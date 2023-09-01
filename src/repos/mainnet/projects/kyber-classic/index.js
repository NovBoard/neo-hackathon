// 모듈 임포트
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { getPriorBlock } from '../../functions/getPriorBlock.js';
// import { getLpPools } from '../../functions/getLpPools.js';

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-ethereum",
  cache: new InMemoryCache(),
  batch: true,
});

async function fetchKyberClassicPools() {
  const now = Math.floor((new Date()).getTime() / 1000);
  const yesterday = now - 86400;

  // graphql 쿼리
  const query = gql`
            {
                pools (first: 1000) {
                  id
                  reserve0
                  reserve1
                  reserveUSD
                  feeUSD
                  totalSupply
                  token0 {
                    symbol
                    id
                  }
                  token1 {
                    symbol
                    id
                  }
                }
            }
        `;

  const [yesterdayBlock, response] = await Promise.all([
    getPriorBlock(yesterday),
    client.query({ query })
  ]);

  let pools = response.data.pools;

  const queryPrior = gql`
    {
      pools (first: 1000 block: {number: ${yesterdayBlock}}) { 
        id 
        feeUSD 
      }
    }
  `;

  const priorResponse = await client.query({ query: queryPrior });
  const priorPools = priorResponse.data.pools;

  pools = pools.map(pool => {
    const priorFeeUSD = priorPools.find(
      priorPool => priorPool.id === pool.id
    )?.feeUSD;

    const fee24H = Number(pool.feeUSD) - Number(priorFeeUSD);
    const apy = fee24H * 365 / Number(pool.reserveUSD) * 100;

    return {
      address: pool.id,
      symbols: [pool.token0.symbol, pool.token1.symbol],
      tokens: [pool.token0.id, pool.token1.id],
      reserves: [Number(pool.reserve0), Number(pool.reserve1)],
      totalSupply: Number(pool.totalSupply) * Math.pow(10, 18),
      apy: apy,
      dex: "Kyber Classic",
    }
  })

  // console.log("Kyber done!");
  return pools;
}

// async function main() {
//   const lpTokens = await fetchKyberClassicPools();
//   console.log(lpTokens);
//   getLpPools(lpTokens, walletAddress);
// }

// main();

export { fetchKyberClassicPools }