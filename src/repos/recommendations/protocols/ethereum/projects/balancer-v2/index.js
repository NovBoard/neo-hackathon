// Balancer V2
import { request, gql } from "graphql-request";

// graphql 엔드포인트
const endpoint = "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2";

// graphql-request를 사용하여 pool 정보를 가져오는 함수
async function fetchBalancerV2Pool() {
  // 토큰들로 구성된 pool을 쿼리합니다.
  const query = gql`
        query {
          pools(
            first: 1000,
            orderBy: totalLiquidity,
            orderDirection: desc
          ) {
            id
            tokens {
              address
              symbol
            }
            swapFee
            totalLiquidity
          }
        }
      `;

  // 모든 프로미스가 완료되면, 결과를 합쳐서 반환합니다.
  const response = await request(endpoint, query);

  // 쿼리 결과가 있으면, pool의 정보를 담은 객체의 배열을 반환합니다.
  if (response.pools.length > 0) {
    return response.pools.map(pool => {
      let poolTokens = pool.tokens.map(token => token.address);
      return ({
        addresses: poolTokens,
        symbols: pool.tokens.map(token => token.symbol),
        dex: "Balancer V2",
        tvl: pool.totalLiquidity,
        feeTier: NaN,
        apy: NaN,
      });
    })
  } else {
    return [];
  }
}

export { fetchBalancerV2Pool };