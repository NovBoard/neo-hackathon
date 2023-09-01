const fetchEthereumTokens = async () => {
    // const response = await fetch('https://tokens.coingecko.com/ethereum/all.json');
    const response = await fetch('https://tokens.coingecko.com/uniswap/all.json');
    const data = await response.json();
    // console.log(data.tokens);
    return data.tokens;
};

// fetchEthereumTokens();

export { fetchEthereumTokens };