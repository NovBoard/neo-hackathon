// 모듈 임포트
import axios from 'axios';
// import { getLpPools } from '../../functions/getUsersBalances.js';

const walletAddress = "0xba12222222228d8ba445958a75a0704d566bf2c8"

async function fetchCurvePools() {
    const urls = [
        "https://api.curve.fi/api/getPools/ethereum/main",
        "https://api.curve.fi/api/getPools/ethereum/crypto",
        "https://api.curve.fi/api/getPools/ethereum/factory",
        "https://api.curve.fi/api/getPools/ethereum/factory-crypto",
        "https://api.curve.fi/api/getPools/ethereum/factory-crvusd",
        "https://api.curve.fi/api/getPools/ethereum/factory-tricrypto"
    ];

    let pools = [];

    for (let url of urls) {
        let response = await axios(url);
        let poolList = response.data.data.poolData;
        pools = pools.concat(poolList);
    }

    const apyURL = "https://api.curve.fi/api/getSubgraphData/ethereum";
    const apyResponse = await axios(apyURL);
    const apyData = apyResponse.data.data.poolList;

    pools = pools.map(pool => {
        const apy = apyData.find(
            apyPool => apyPool.address === pool.lpTokenAddress
        )?.latestDailyApy;

        return {
            address: pool.lpTokenAddress,
            symbols: pool.coins.map(token => token.symbol),
            tokens: pool.coins.map(token => token.address),
            reserves: pool.coins.map(token => Number(token.poolBalance) / Math.pow(10, Number(token.decimals))),
            totalSupply: Number(pool.totalSupply),
            apy: apy,
            dex: "Curve",
        }
    })

    // console.log("Curve done!");
    return pools;
}



async function main() {
    const kslpTokens = await fetchCurvePools();
    console.log(kslpTokens)
    // getLpPools(kslpTokens, walletAddress)
}

// main();

export { fetchCurvePools };