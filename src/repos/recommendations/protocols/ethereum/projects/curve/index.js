// 모듈 임포트
import axios from 'axios';

const walletAddress = "0xba12222222228d8ba445958a75a0704d566bf2c8"

async function fetchCurvePool() {
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

    pools = pools.map(pool => {
        if (pool.isMetaPool) {
            return {
                addresses: pool.underlyingCoins.map(token => token.address),
                symbols: pool.underlyingCoins.map(token => token.symbol),
                dex: "Curve",
                tvl: Number(pool.usdTotal),
                feeTier: NaN,
                apy: NaN,
            };
        } else {
            return  {
                addresses: pool.coins.map(token => token.address),
                symbols: pool.coins.map(token => token.symbol),
                dex: "Curve",
                tvl: Number(pool.usdTotal),
                feeTier: NaN,
                apy: NaN,
            };
        }
    })

    return pools;
}

// async function main() {
//     const kslpTokens = await fetchCurvePools();
//     console.log(kslpTokens)
//     // getLpPools(kslpTokens, walletAddress)
// }

// main();

export { fetchCurvePool };