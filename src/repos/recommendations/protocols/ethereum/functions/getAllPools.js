import { fetchBalancerV2Pool } from "../projects/balancer-v2/index.js"
import { fetchCurvePool } from "../projects/curve/index.js"
import { fetchHelixPool } from "../projects/helix/index.js";
import { fetchKyberClassicPool } from "../projects/kyber-classic/index.js";
import { fetchPancakeswapV3Pool } from "../projects/pancake-v3/index.js";
import { fetchSushiswapPool } from "../projects/sushi-v2/index.js";
import { fetchUniswapV2Pool } from "../projects/uni-v2/index.js";
import { fetchUniswapV3Pool } from "../projects/uni-v3/index.js";

const getAllPools = async () => {
    const data = await Promise.all([
        fetchBalancerV2Pool(),
        fetchCurvePool(),
        fetchHelixPool(),
        fetchKyberClassicPool(),
        fetchPancakeswapV3Pool(),
        fetchSushiswapPool(),
        fetchUniswapV2Pool(),
        fetchUniswapV3Pool(),
    ]);

    return data.flat();
}

export { getAllPools };