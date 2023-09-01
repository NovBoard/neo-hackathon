/*global BigInt*/
import { multicallABI, uniswapV3NFTABI } from "../../abi/abis.js";
import { getPancakeswapV3AllPools } from "./getPancakeswapV3AllPools.js";
import { getBSCTokenInfo } from "../../functions/getBSCTokenInfo.js";
import { Web3 } from "web3";
import { Web3BatchRequest, Web3RequestManager } from "web3-core";
import { BNBCHAIN } from "../../constant/providers.js";

const provider = BNBCHAIN;
const web3 = new Web3(provider);

const masterVault = "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364";
const multicallAddress = "0xcA11bde05977b3631167028862bE2a173976CA11";

const Q96 = 2 ** 96;
const Q128 = BigInt(340282366920938463463374607431768211455n);

const fetchPancakeswapV3Pools = async (walletAddress) => {
    // console.time("Pancakeswap V3")
    const positions = await getPancakeswapV3AllPools(walletAddress);
    // console.timeEnd("Pancakeswap V3")

    const pools = [];

    if (positions.length === 0) return pools;

    // UniswapV3 NFT 컨트랙트 인스턴스 생성
    const nftContract = new web3.eth.Contract(uniswapV3NFTABI, masterVault);

    // totalSupply 함수의 시그니처를 인코딩합니다.
    let slot0FunctionSignature = "0x3850c7bd";

    let slot0Batch = new Web3BatchRequest();
    slot0Batch._requestManager = new Web3RequestManager(web3.currentProvider);

    let collectBatch = new Web3BatchRequest();
    collectBatch._requestManager = new Web3RequestManager(web3.currentProvider);

    let chunkSize = 100;
    let slot0Batches = [];
    let collectBatches = [];
    let batchCount = Math.ceil(positions.length / chunkSize);

    for (let i = 0; i < batchCount; i++) {
        let slot0Batch = new Web3BatchRequest();
        slot0Batch._requestManager = new Web3RequestManager(web3.currentProvider);

        let collectBatch = new Web3BatchRequest();
        collectBatch._requestManager = new Web3RequestManager(web3.currentProvider);

        positions.slice(chunkSize * i, chunkSize * (i + 1)).forEach((position, index) => {
            const poolAddress = position.pool.id;
            const tokenId = position.id;

            // slot0 함수의 데이터를 배열로 만듭니다.
            const slot0Request = {
                jsonrpc: '2.0',
                id: index,
                method: 'eth_call',
                params: [
                    {
                        to: poolAddress, // use token address as the contract address
                        data: slot0FunctionSignature // use balanceOf function signature and padded wallet address as the data field
                    },
                    'latest' // use latest block number
                ]
            };

            // collect 함수 데이터 인코딩
            let collectData = nftContract.methods.collect({
                tokenId: tokenId,
                recipient: walletAddress,
                amount0Max: Q128,
                amount1Max: Q128,
            }).encodeABI();

            // slot0 함수의 데이터를 배열로 만듭니다.
            const collectRequest = {
                jsonrpc: '2.0',
                id: index,
                method: 'eth_call',
                params: [
                    {
                        to: masterVault, // use token address as the contract address
                        data: collectData // use balanceOf function signature and padded wallet address as the data field
                    },
                    'latest' // use latest block number
                ]
            };

            slot0Batch.add(slot0Request);
            collectBatch.add(collectRequest);
        })

        slot0Batches.push(slot0Batch);
        collectBatches.push(collectBatch);
    }

    // console.time("Pancakeswap V3: multicall")
    const [slot0Results, collectResults] = await Promise.all([
        Promise.all(slot0Batches.map(batch => batch.execute())),
        Promise.all(collectBatches.map(batch => batch.execute())),
    ]);
    // console.timeEnd("Pancakeswap V3: multicall")

    const slot0ReturnData = slot0Results.flat().map(result => result.result);
    const collectReturnData = collectResults.flat().map(result => result.result);

    // 각 컨트랙트 함수의 반환 값을 디코딩합니다.
    const slot0Result = slot0ReturnData.map(data => web3.eth.abi.decodeParameters([
        "uint160",
        "int24",
        "uint16",
        "uint16",
        "uint16",
        "uint8",
        "bool"
    ], data));

    const collectResult = collectReturnData.map(data => web3.eth.abi.decodeParameter("(uint256, uint256)", data));

    await Promise.all(positions.map(async (position, index) => {
        const [token0, token1] = [position.token0.id, position.token1.id];
        const [token0Symbol, token1Symbol] = [position.token0.symbol, position.token1.symbol];
        const [tickLower, tickUpper] = [Number(position.tickLower.tickIdx), Number(position.tickUpper.tickIdx)];
        const positionLiquidity = Number(position.liquidity);

        const { token0Info, token1Info } = await getBSCTokenInfo(token0, token1);

        if (token0Info === undefined || token1Info === undefined) return;

        const [token0Decimals, token1Decimals] = [token0Info.decimals, token1Info.decimals];
        const [token0Price, token1Price] = [token0Info.price, token1Info.price];

        // UniswapV3Pool 컨트랙트의 slot0 함수를 호출하여 풀의 현재 가격을 구합니다.
        const sqrtPriceX96 = Number(slot0Result[index][0]);
        const collectableTokens = collectResult[index];
        const claimableToken0Amount = Number(collectableTokens[0]) / (10 ** token0Decimals);
        const claimableToken1Amount = Number(collectableTokens[1]) / (10 ** token1Decimals);

        // 예치 범위의 가격과 총 유동성을 이용하여 예치한 토큰의 양을 구합니다.
        const unCliamableTokenAmounts = getUnCliamableTokenAmounts(positionLiquidity, sqrtPriceX96, tickLower, tickUpper, token0Decimals, token1Decimals);
        const claimableTokenAmounts = {
            amount0: claimableToken0Amount,
            amount1: claimableToken1Amount,
        };
        const unCliamableToken0Value = unCliamableTokenAmounts.amount0 * token0Price;
        const unCliamableToken1Value = unCliamableTokenAmounts.amount1 * token1Price;
        const claimableToken0Value = claimableTokenAmounts.amount0 * token0Price;
        const claimableToken1Value = claimableTokenAmounts.amount1 * token1Price;
        const unCliamableUSD = unCliamableToken0Value + unCliamableToken1Value;
        const climabaleUSD = claimableToken0Value + claimableToken1Value;
        const totalDepositUSD = unCliamableUSD + climabaleUSD;
        const amount0 = (unCliamableTokenAmounts.amount0 + claimableTokenAmounts.amount0);
        const amount1 = (unCliamableTokenAmounts.amount1 + claimableTokenAmounts.amount1);

        const pool = {
            symbols: [token0Symbol, token1Symbol],
            dex: "Pancakewap V3",
            amounts: [amount0, amount1],
            value: totalDepositUSD,
        }

        pools.push(pool);
    }));

    return pools;
}

function getUnCliamableTokenAmounts(liquidity, sqrtPriceX96, tickLow, tickHigh, token0Decimals, token1Decimals) {
    let sqrtRatioA = Math.sqrt(1.0001 ** tickLow);
    let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh);

    let currentTick = getTickAtSqrtRatio(sqrtPriceX96);
    let sqrtPrice = sqrtPriceX96 / Q96;

    let amount0wei = 0;
    let amount1wei = 0;
    if (currentTick <= tickLow) {
        amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB)));
    }
    else if (currentTick > tickHigh) {
        amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
    }
    else if (currentTick >= tickLow && currentTick < tickHigh) {
        amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB)));
        amount1wei = Math.floor(liquidity * (sqrtPrice - sqrtRatioA));
    }

    const amount0 = amount0wei / (10 ** token0Decimals);
    const amount1 = amount1wei / (10 ** token1Decimals);

    return {
        amount0,
        amount1,
    }
}

function getTickAtSqrtRatio(sqrtPriceX96) {
    let tick = Math.floor(Math.log((sqrtPriceX96 / Q96) ** 2) / Math.log(1.0001));
    return tick;
}

// getPancakeswapV3PoolInfo("0x46a15b0b27311cedf172ab29e4f4766fbe7f4364");

export { fetchPancakeswapV3Pools }