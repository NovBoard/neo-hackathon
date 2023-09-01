// index.js
import { getAllPools } from "./functions/getAllPools.js";
import { getUsersBalances } from "./functions/getUsersBalances.js";
import { getPoolInfo } from "./functions/getPoolInfo.js";
import { getWalletSpecificPools } from "./functions/getWalletSpecificPools.js";

const getUserData = async (walletAddresses) => {
    const commonData = await getAllPools();
    const commonTokens = commonData.map(token => ({ ...token }));

    // console.time("getUserData");

    // console.time("getWalletSpecificPools")
    const userTokensPromises = walletAddresses.map(walletAddress => {
        return getWalletSpecificPools(walletAddress);
    });

    const walletSpecificPools = await Promise.all(userTokensPromises);
    const completedDex = ["Uniswap V3", "Pancakeswap V3"];
    const walletSpecificPoolData = walletSpecificPools.map(pools => pools.map(pool => pool.data).flat()).flat();
    let preparedData = (commonTokens.map(token => token.data).flat()).concat(walletSpecificPoolData);
    let uncompletedData = preparedData.filter(token => !completedDex.includes(token.dex));
    let completedAssets = preparedData.filter(token => completedDex.includes(token.dex));
    // console.timeEnd("getWalletSpecificPools");

    // console.time("getUsersBalances");
    let uncompletedAssets = await getUsersBalances(uncompletedData, walletAddresses);
    // console.timeEnd("getUsersBalances");

    let uncompletedPools = uncompletedAssets.map(assets => assets.filter(asset => asset.dex !== "Ethereum" && !completedDex.includes(asset.dex))).flat();
    
    // console.time("getPoolInfo");
    let pools = await getPoolInfo(uncompletedPools);
    // console.timeEnd("getPoolInfo");

    let tokenData = uncompletedAssets.map(assets => assets.filter(asset => asset.dex === "Ethereum")).flat();
    let poolData = pools.flat().concat(completedAssets).filter(pool => pool.dex !== undefined).filter(pool => pool.value !== 0);

    let totalTokens = [];
    let totalPools = [];

    tokenData.forEach(token => {
        const existingToken = totalTokens.find(t => t.symbol === token.symbol);
        if (existingToken) {
            existingToken.value += token.value;
            existingToken.amount += token.amount;
        } else {
            totalTokens.push(token);
        }
    });

    poolData.forEach(pool => {
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

    // console.timeEnd("getUserData");

    console.log(totalTokens);

    return {
        totalTokens,
        totalPools,
    };
}

export { getUserData };
