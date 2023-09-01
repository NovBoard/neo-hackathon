import { fetchKlayswapPools } from "../projects/klay/fetchKlayswapPools.js";

// 파일 병합
const getAllPools = async () => {
    // Promise.all 사용하여 병렬로 비동기 작업 수행
    const results = await Promise.all([
        fetchKlayswapPools()
    ]);
    // 결과 배열을 하나로 합치기
    return results.flat();
}

export { getAllPools };