import { fetchEthereumTokens } from "./fetchEthereumTokens.js";
import { fetchCurvePools } from "../projects/curve/index.js";
import { fetchHelixPools } from "../projects/helix/index.js";
import { fetchKyberClassicPools } from "../projects/kyber-classic/index.js";

// 파일 병합
const getAllPools = async () => {
    // Promise.all 사용하여 병렬로 비동기 작업 수행
    const data = await Promise.all([
        fetchEthereumTokens(),
        fetchCurvePools(),
        fetchHelixPools(),
        fetchKyberClassicPools(),
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

export { getAllPools };