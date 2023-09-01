import { request, gql } from "graphql-request";

// Uniswap V2 엔드포인트
const endpointUniswapV2 = "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v2-dev";

// Uniswap V2 pool 정보를 가져오는 함수
async function fetchUniswapV2Pool() {
  // 토큰들로 구성된 pool을 쿼리합니다.
  const query = gql`
        query {
          pairs(
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
  const response = await request(endpointUniswapV2, query);

  // 쿼리 결과가 있으면, pool의 정보를 담은 객체의 배열을 반환합니다.
  if (response.pairs.length > 0) {
    return response.pairs.map(pair => {
      const token0 = pair.token0.id;
      const token1 = pair.token1.id;
      return ({
        addresses: [token0, token1],
        symbols: [pair.token0.symbol, pair.token1.symbol],
        dex: "Uniswap V2",
        tvl: pair.reserveUSD,
        feeTier: NaN,
        apy: NaN,
      });
    });
  } else {
    return [];
  }
}

export { fetchUniswapV2Pool };