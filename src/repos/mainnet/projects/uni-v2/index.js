// 모듈 임포트
// import { getLpPools } from '../../functions/getUsersBalances.js';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { getPriorBlock } from '../../functions/getPriorBlock.js';

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v2-dev',
  cache: new InMemoryCache(),
  batch: true,
});

async function fetchUniswapV2Pools(walletAddress) {
  let address = walletAddress.toLowerCase();

  const now = Math.floor((new Date()).getTime() / 1000);
  const yesterday = now - 86400;

  // graphql 쿼리
  const query = gql`
            {
              user(id: "${address}"){
                liquidityPositions{
                  pair{
                    id
                    reserve0
                    reserve1
                    totalSupply
                    volumeUSD
                    reserveUSD
                    token0{
                      id
                      symbol
                    }
                    token1{
                      id
                      symbol
                    }
                  }
                }
              }
            }
        `;

  // 병렬로 블록 번호와 페어 정보 가져오기
  const [yesterdayBlock, response] = await Promise.all([
    getPriorBlock(yesterday),
    client.query({ query })
  ]);

  if (response.data.user === null) {
    // console.log("Uni V2 done!");
    return [];
  }

  let pairs = response.data.user.liquidityPositions;
  let addresses = pairs.map(pair => pair.pair.id);

  const queryPrior = gql`
        {
          pairs (first: 1000 where:{id_in: ${JSON.stringify(addresses)}} block: {number: ${yesterdayBlock}}) { 
            id 
            volumeUSD 
          }
        }
      `;

  const priorResponse = await client.query({ query: queryPrior });
  const priorPairs = priorResponse.data.pairs;

  pairs = pairs.map(pair => {
    const priorVolumeUSD = priorPairs.find(
      priorPair => priorPair.id === pair.pair.id
    )?.volumeUSD;

    const volume24H = Number(pair.pair.volumeUSD) - Number(priorVolumeUSD);
    const apy = volume24H * 0.003 * 365 / Number(pair.pair.reserveUSD) * 100;

    return {
      address: pair.pair.id,
      symbols: [pair.pair.token0.symbol, pair.pair.token1.symbol],
      tokens: [pair.pair.token0.id, pair.pair.token1.id],
      reserves: [Number(pair.pair.reserve0), Number(pair.pair.reserve1)],
      totalSupply: Number(pair.pair.totalSupply) * Math.pow(10, 18),
      apy: apy,
      dex: "Uniswap V2",
    }
  })

  // console.log("Uni V2 done!");
  return pairs;
}

// async function main() {
//   const lpTokens = await fetchUniswapV2Pools();
//   getLpPools(lpTokens, walletAddress)
// }

// main();

export { fetchUniswapV2Pools };
