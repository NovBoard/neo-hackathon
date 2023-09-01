import { request, gql } from "graphql-request";

// graphql 엔드포인트
const endpoint = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

// graphql-request를 사용하여 pool 정보를 가져오는 함수
async function fetchUniswapV3Pool() {
  // 토큰들로 구성된 pool을 쿼리합니다.
  const query = gql`
        query {
          pools(
            first: 1000,
            orderBy: totalValueLockedUSD,
            orderDirection: desc
          ) {
            id
            token0 {
              id
              symbol
            }
            token1 {
              id
              symbol
            }
            feeTier
            totalValueLockedUSD
          }
        }
      `;

  // 모든 프로미스가 완료되면, 결과를 합쳐서 반환합니다.
  const response = await request(endpoint, query);

  // 쿼리 결과가 있으면, pool의 정보를 담은 객체의 배열을 반환합니다.
  if (response.pools.length > 0) {
    return response.pools.map(pool => {
      const token0 = pool.token0.id;
      const token1 = pool.token1.id;
      return ({
        addresses: [token0, token1],
        symbols: [pool.token0.symbol, pool.token1.symbol],
        dex: "Uniswap V3",
        tvl: pool.totalValueLockedUSD,
        feeTier: pool.feeTier,
        apy: NaN,
      });
    });
  } else {
    return [];
  }
}

export { fetchUniswapV3Pool };