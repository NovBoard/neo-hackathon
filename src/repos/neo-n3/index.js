import { fetchFlamingoPools } from "./projects/flamingo/index.js"

const getNeoN3UserData = async (addresses) => {
    let data = await Promise.all(addresses.map(address => fetchFlamingoPools(address)));

    let totalTokenData = [];
    let totalPoolData = [];

    data.forEach(d => {
        totalTokenData = totalTokenData.concat(d.totalTokens);
        totalPoolData = totalPoolData.concat(d.totalPools);
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

    totalPoolData.forEach(pool => {
        const existingPool = totalPools.find(p => (p.symbols.join() === pool.symbols.join() && p.dex === pool.dex));
        if (existingPool) {
            existingPool.value += pool.value;
            pool.amounts.forEach((amount, index) => {
                existingPool.amounts[index] += amount;
            });
        } else {
            totalPools.push(pool);
        }
    });

    return {
        totalTokens,
        totalPools,
    }
}

export { getNeoN3UserData };