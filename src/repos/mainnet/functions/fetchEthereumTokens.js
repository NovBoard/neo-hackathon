import fetch from 'node-fetch';
// https://api.coingecko.com/api/v3/coins/list?include_platform=true
import { ethTokens } from "../constant/ethTokens.js"

const fetchEthereumTokens = async () => {
    const response = ethTokens.map(token => {
        if(token.platforms === undefined) return null;
        const platforms = token.platforms;
        const address = platforms.ethereum;
        if(address === undefined) return null;
        
        return {
            address: address,
            symbol: token.symbol.toUpperCase(),
            dex: "Ethereum",
        }
    }).filter(token => token !== null);

    response.push({
        address: "0x0000000000000000000000000000000000000000",
        symbol: "ETH",
        dex: "Ethereum",
    })
    
    return response;
};

export { fetchEthereumTokens };