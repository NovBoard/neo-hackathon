import { multicallABI, uniswapV2ABI } from "../abi/abis.js";
import { ETHEREUM } from "../constant/providers.js";
import { getMultipleTokenInfo } from "./getMultipleTokenInfo.js";
import { Web3BatchRequest, Web3RequestManager } from "web3-core";
import { Web3 } from "web3";

const provider = ETHEREUM;
const web3 = new Web3(provider);

const multicallVault = "0xcA11bde05977b3631167028862bE2a173976CA11";
const multicallContract = new web3.eth.Contract(multicallABI, multicallVault);

const getPoolInfo = async (positions) => {
    if (positions.length === 0) return [];

    const tokenInfoPromises = [];

    positions.forEach(position => {
        const tokenInfoPromise = getMultipleTokenInfo(position.details.tokens);
        tokenInfoPromises.push(tokenInfoPromise);
    });

    // console.time("Token Info Done")
    const tokenInfoResults = await Promise.all(tokenInfoPromises);
    // console.timeEnd("Token Info Done")

    const pools = positions.map(async (position, index) => {
        const contract = new web3.eth.Contract(uniswapV2ABI, position.address);
        let tokenAddresses;
        if (position.details.tokens && position.details.totalSupply) {
            tokenAddresses = position.details.tokens;
        } else {
            const token0 = await contract.methods.token0().call();
            const token1 = await contract.methods.token1().call();
            tokenAddresses = [token0, token1];
        }

        let totalSupply;
        if (position.details.totalSupply) {
            totalSupply = position.details.totalSupply;
        } else {
            totalSupply = Number(await contract.methods.totalSupply().call());
        }

        const share = Number(position.balance) / totalSupply;
        const tokenInfos = tokenInfoResults[index];
        let symbols;
        if (position.details.symbols) {
            symbols = position.details.symbols;
        } else {
            symbols = tokenInfos.filter(tokenInfo => tokenInfo !== undefined).map(tokenInfo => tokenInfo.symbol);
        }

        let reserves = [];
        if (position.details.reserves) {
            reserves = position.details.reserves;
        } else {
            if (tokenInfos[0] === undefined || tokenInfos[1] === undefined) return;
            const { _reserve0, _reserve1 } = await contract.methods.getReserves().call();
            reserves = [Number(_reserve0) / Math.pow(10, tokenInfos[0].decimals || 0), Number(_reserve1) / Math.pow(10, tokenInfos[1].decimals || 0)]
        }

        const amounts = reserves.map(reserve => reserve * share);

        let value = 0;
        amounts.forEach((amount, index) => {
            if (tokenInfos[index] === undefined) return;
            value += amount * tokenInfos[index].price;
        });

        let dex = position.dex;

        return {
            symbols,
            dex,
            amounts,
            value,
        };
    });

    const result = await Promise.all(pools);
    return result;
}

export { getPoolInfo };
