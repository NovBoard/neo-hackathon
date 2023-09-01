import axios from "axios";
import { fetchNeoN3Tokens } from "../../functions/fetchNeoN3Tokens.js";

const fetchFlamingoPools = async (walletAddress) => {
    const tokens = await fetchNeoN3Tokens(walletAddress);
    const tokenAddresses = tokens.map(token => token.address);
    const poolResponse = await axios("https://api.flamingo.finance/project-info/defillama-yields");
    const pools = poolResponse.data.pools;
    tokenAddresses.push("0xa9603a59e21d29e37ac39cf1b5f5abf5006b22a3");

    console.log(pools);
    
    const result = pools.find(pool => {
        return tokenAddresses.includes(pool.pool.toString())
    });

    console.log(result);
}

fetchFlamingoPools("NdUL5oDPD159KeFpD5A9zw5xNF1xLX6nLT");