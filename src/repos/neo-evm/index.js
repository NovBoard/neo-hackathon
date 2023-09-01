import { fetchNeoEVMTokens } from "./functions/fetchNeoEVMTokens"

const getNeoEVMUserData = async (address) => {
    const totalTokens = await fetchNeoEVMTokens(address);
    
    return {
        totalTokens,
    }
};

export { getNeoEVMUserData };