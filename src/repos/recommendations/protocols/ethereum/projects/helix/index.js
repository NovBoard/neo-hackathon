// 모듈 임포트
import { uniswapV3NFTABI } from '../../../../../mainnet/abi/abis.js';
import { helixPools } from './helixPool.js';

async function fetchHelixPool() {
    const response = helixPools;

    // const promises = response.pools.map(pool => {
    //     const contract = new web3.eth.Contract(uniswapV3NFTABI, pool.address);
    //     return contract.methods.totalSupply().call();
    // })

    // const totalSupplies = await Promise.all(promises);

    const results = response.pools.map((pool, index) => {
        const token0 = pool.token0;
        const token1 = pool.token1;
        return({
            addresses: [token0, token1],
            symbols: [pool.token0.symbol, pool.token1.symbol],
            dex: "Helix",
            tvl: NaN,
            feeTier: NaN,
            apy: NaN
        });
    })

    return results;
}

export { fetchHelixPool };