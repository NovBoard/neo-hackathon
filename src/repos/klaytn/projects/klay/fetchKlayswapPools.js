import fetch from 'node-fetch';

async function fetchKlayswapPools() {
    const response = await fetch('https://s.klayswap.com/stat/klayswapInfo.json');
    const data = await response.json();
    return data.recentPoolInfo;
}

export { fetchKlayswapPools };
