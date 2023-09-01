// 모듈 임포트
import { getLpPools } from '../../functions/getUsersBalances.js';
import { helixPools } from './helixPool.js';

const walletAddress = "0xa4c1135f0c0123f6683f98a8177f4c51f3179107"

async function fetchHelixPools() {
    const response = helixPools;
    // console.log("Helix done!");
    return response.pools;
}

// async function main() {
//     const lpTokens = await fetchPools();
//     getLpPools(lpTokens, walletAddress)
// }

// main();

export { fetchHelixPools };