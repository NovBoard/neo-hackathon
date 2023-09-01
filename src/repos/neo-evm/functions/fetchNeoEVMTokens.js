import axios from "axios"

const fetchNeoEVMTokens = async (walletAddress) => {
    // const response = await axios(`https://evm.ngd.network/api?module=account&address=${walletAddress}&action=tokenlist`);
    const response = {
        data: {
            result: []
        }
    }
    const tokens = response.data.result;

    if(tokens.length === 0 ) return [];

    const result = tokens.map(token => {
        return {
            address: token.contractAddress,
            price: 0,
            amount: token.balance / Math.pow(10, Number(token.decimals)),
            symbol: token.symbol.toUpperCase(),
            dex: "NeoEVM",
            value: 0,
        }
    });

    // console.log(result);
    return result;
}

// fetchNeoEVMTokens("0x1043987a09D87C13d42c7a62A0b0f4546e60Fc8F");

export { fetchNeoEVMTokens };