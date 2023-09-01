import { fetchBalancerV2Pools } from "../projects/balancer-v2/index.js";
import { fetchSushiswapV2Pools } from "../projects/sushi-v2/index.js";
import { fetchUniswapV2Pools } from "../projects/uni-v2/index.js";
import { fetchUniswapV3Pools } from "../projects/uni-v3/index.js";
import { fetchPancakeswapV3Pools } from "../projects/pancake-v3/index.js";

// 파일 병합
const getWalletSpecificPools = async (walletAddress) => {
    // Promise.all 사용하여 병렬로 비동기 작업 수행
    const data = await Promise.all([
        fetchBalancerV2Pools(walletAddress),
        fetchSushiswapV2Pools(walletAddress),
        fetchUniswapV2Pools(walletAddress),
        fetchUniswapV3Pools(walletAddress),
        fetchPancakeswapV3Pools(walletAddress)
    ]);

    // 결과 배열
    let results = data.map((result, index) => {
        return {
            data: result,
        }
    });

    // 결과 배열을 하나로 합치기
    return results;
}

export { getWalletSpecificPools };