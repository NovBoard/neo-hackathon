const fetchKlaytnTokens = async () => {
    const response = await fetch('https://s.klayswap.com/stat/klayswapInfo.json');
    const data = await response.json();
    const tokens = data.tokenInfo;
    return tokens;
};

// fetchKlaytnTokens();

export { fetchKlaytnTokens };