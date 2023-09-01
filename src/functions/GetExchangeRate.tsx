import utilsAPI from "../api/utilsAPI";

const getExchangeRate = async () => {
    const response = await utilsAPI.get("/get-exchange-rates");
    const exchangeRate = response.data;
    return exchangeRate;
}

export { getExchangeRate };