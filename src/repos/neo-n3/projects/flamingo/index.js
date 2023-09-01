import axios from "axios";
import { fetchNeoN3Tokens } from "../../functions/fetchNeoN3Tokens.js";

const fetchFlamingoPools = async (walletAddress) => {
    let totalTokens = await fetchNeoN3Tokens(walletAddress);
    const tokenAddresses = totalTokens.map(token => {
        if (token.price !== 0) return null;
        return token.address;
    }).filter(token => token !== null);

    const poolResponse = await axios("https://api.flamingo.finance/project-info/defillama-yields");
    const poolData = poolResponse.data.pools;
    const userPools = poolData.filter(pool => {
        return tokenAddresses.includes(pool.pool.toString())
    });

    totalTokens = totalTokens.map(token => {
        if (token.price !== 0) {
            return token;
        } else {
            return null;
        }
    }).filter(token => token !== null);

    const totalPools = userPools.map(pool => {
        const symbols = pool.symbol.split("-");
        const dex = "Flamingo Finance";
        const amounts = [Math.random() * 1000, Math.random() * 1000];
        const value = Math.random() * 1000;

        return {
            symbols,
            dex,
            amounts,
            value
        }
    });

    return {
        totalTokens,
        totalPools,
    }
}

export { fetchFlamingoPools };

// fetchFlamingoPools("NUyjyXW1VYKHJfaxgGRKrMYUwGWPuAeDRC");