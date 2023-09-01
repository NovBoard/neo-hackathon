import { request, gql } from "graphql-request";

// Sushiswap 엔드포인트
const endpointKyberswap = "https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-ethereum";

// Sushiswap pool 정보를 가져오는 함수
async function fetchKyberClassicPool() {
  // 토큰들로 구성된 pool을 쿼리합니다.
  const query = gql`
        query {
          pools(
            first: 1000,
            orderBy: reserveUSD,
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
            reserveUSD
          }
        }
      `;

  // 모든 프로미스가 완료되면, 결과를 합쳐서 반환합니다.
  const response = await request(endpointKyberswap, query);

  // 쿼리 결과가 있으면, pool의 정보를 담은 객체의 배열을 반환합니다.
  if (response.pools.length > 0) {
    return response.pools.map(pool => {
      const token0 = pool.token0.id;
      const token1 = pool.token1.id;
      return ({
        addresses: [token0, token1],
        symbols: [pool.token0.symbol, pool.token1.symbol],
        dex: "Kyber Classic",
        tvl: pool.reserveUSD,
        feeTier: NaN,
        apy: NaN,
      });
    });
  } else {
    return [];
  }
}

export { fetchKyberClassicPool };
