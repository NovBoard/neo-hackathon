import { request, gql } from 'graphql-request';

// graphql 엔드포인트
const endpoint = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

// graphql-request를 사용하여 pool 정보를 가져오는 함수
async function getUniswapV3AllPools(walletAddress) {
    // graphql 쿼리
    const query = gql`
    {
        positions(first: 1000 where: { owner: "${walletAddress}", liquidity_gt: 0}) {
            id
            liquidity
            tickLower{
                tickIdx
            }
            tickUpper{
                tickIdx
            }
            token0 {
                id
                symbol
            }
            token1 {
                id
                symbol
            }
            pool {
                id
                feeTier
            }
        }
    }
    `;

    const response = await request(endpoint, query);
    const positions = response.positions;
    return positions;
}

export { getUniswapV3AllPools }