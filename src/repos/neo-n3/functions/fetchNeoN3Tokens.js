import axios from "axios"

const fetchNeoN3Tokens = async (walletAddress) => {
    const [response, priceResponse] = await Promise.all(
        [
            axios(`https://mainnet1.neo.coz.io?jsonrpc=2.0&method=getnep17balances&params=["${walletAddress}"]&id=1`),
            axios("https://api.flamingo.finance/token-info/prices"),
        ]
    )

    const tokens = response.data.result.balance;
    const prices = priceResponse.data;

    if(tokens.length === 0 ) return [];
    
    const result = tokens.map(token => {
        const amount = token.amount;
        const price = prices.find(price => price.hash === token.assethash);
        const usdPrice = price.usd_price;

        return {
            address: token.assethash,
            price: usdPrice,
            amount: Number(amount),
            symbol: token.symbol.toUpperCase(),
            dex: "NeoN3",
            value: amount * usdPrice,
        }
    });

    // console.log(result);
    return result;
}

// fetchNeoN3Tokens("NdUL5oDPD159KeFpD5A9zw5xNF1xLX6nLT");

export { fetchNeoN3Tokens};