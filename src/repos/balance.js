import { getMainnetUserData } from "./mainnet/index.js";
import { getNeoEVMUserData } from "./neo-evm/index.js";
import { getNeoN3UserData } from "./neo-n3/index.js";

const getUserData = async (walletAddresses) => {
    const gasWalletAddresses = JSON.parse(localStorage.getItem("gas") || "[]");

    const userData = await Promise.all([
        getMainnetUserData(walletAddresses),
        getNeoEVMUserData(walletAddresses),
        getNeoN3UserData(gasWalletAddresses),
    ])

    const totalTokens = userData.map(data => data.totalTokens).flat();
    const totalPools = userData.map(data => data.totalPools).flat();

    return {
        totalTokens,
        totalPools,
    }
}

export { getUserData };