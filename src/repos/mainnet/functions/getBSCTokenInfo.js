import axios from "axios";

const getBSCTokenInfo = async (token0Address, token1Address) => {
    const { data } = await axios.get(`https://coins.llama.fi/prices/current/bsc:${token0Address},bsc:${token1Address}`);
    const token0Info = data.coins[`bsc:${token0Address}`];
    const token1Info = data.coins[`bsc:${token1Address}`];
    return {
        token0Info,
        token1Info,
    };
};

export { getBSCTokenInfo };