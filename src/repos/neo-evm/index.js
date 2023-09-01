import { fetchNeoEVMTokens } from "./functions/fetchNeoEVMTokens.js"

const getNeoEVMUserData = async (addresses) => {
    let data = await Promise.all(addresses.map(address => fetchNeoEVMTokens(address)));

    let totalTokenData = [];

    data.forEach(d => {
        totalTokenData = totalTokenData.concat(d);
    });

    let totalTokens = [];
    let totalPools = [];

    totalTokenData.forEach(token => {
        const existingToken = totalTokens.find(t => t.symbol === token.symbol);
        if (existingToken) {
            existingToken.value += token.value;
            existingToken.amount += token.amount;
        } else {
            totalTokens.push(token);
        }
    });

    return {
        totalTokens,
        totalPools,
    }
};

export { getNeoEVMUserData };