// 모듈 임포트
// import { getLpPools } from '../../functions/getUsersBalances.js';
import { request, gql } from 'graphql-request';
import { getPriorBlock } from '../../functions/getPriorBlock.js';
import { Web3 } from "web3";
import { Web3BatchRequest, Web3RequestManager } from "web3-core";
import { balancerV2ABI } from '../../abi/balancerV2ABI.js';
import { getMultipleTokenInfo } from '../../functions/getMultipleTokenInfo.js';
import { ETHEREUM } from '../../constant/providers.js';

const provider = ETHEREUM;
const web3 = new Web3(provider);

const BALANCER_V2_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2';
const BALANCER_V2_GAUGE_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges';
const masterVault = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";

async function fetchBalancerV2Pools(walletAddress) {
  let address = walletAddress.toLowerCase();

  const now = Math.floor((new Date()).getTime() / 1000);
  const yesterday = now - 86400;

  // graphql 쿼리
  const query = gql`
  {
    user(id: "${address}"){
      sharesOwned(first: 1000 where: {balance_gt: "0"}){
        poolId {
          id
          address
          swapFee
          totalLiquidity
          totalSwapFee
          totalShares
          tokens {
            address
            symbol
            balance
          }
        }
      }
    }
  }
        `;

  const gaugeQuery = gql`
  {
    user(id: "${address}"){
      gaugeShares(first: 1000 where:{balance_gt: 0}){
        id
        gauge{
          poolId
          poolAddress
          symbol
          totalSupply
        }
        balance
      }
    }
  }
  `;

  const [yesterdayBlock, response, gaugeResponse] = await Promise.all([
    getPriorBlock(yesterday),
    request(BALANCER_V2_SUBGRAPH_URL, query),
    request(BALANCER_V2_GAUGE_SUBGRAPH_URL, gaugeQuery),
  ]);

  if(response.user === null && gaugeResponse.user === null) return [];

  let pools = [];

  if(response.user !== null){
    if(response.user.sharesOwned.length === 0) return pools;

    pools = response.user.sharesOwned;
    
    let ids = pools.map(pool => pool.poolId.id);
    const queryPrior = gql`
      {
        pools (first: 1000 where:{id_in: ${JSON.stringify(ids)}} block: {number: ${yesterdayBlock}}) { 
          id 
          totalSwapFee 
        }
      }
    `;

    const priorResponse = await request(BALANCER_V2_SUBGRAPH_URL, queryPrior);
    const priorPools = priorResponse.pools;
    console.log(pools, priorPools);

    pools = pools.map(pool => {
      const priorFeeUSD = priorPools.find(
        priorPool => priorPool.id === pool.poolId.id
      )?.totalSwapFee;

      // apy 오류 해결해야함
      // const swapFeePercentage = Number(pool.poolId.swapFee) * 10000;
      const swapFeePercentage = 0.5;

      const fee24H = Number(pool.poolId.totalSwapFee) - Number(priorFeeUSD);
      const apy = fee24H * swapFeePercentage * 365 / Number(pool.poolId.totalLiquidity) * 100;

      console.log(yesterdayBlock);
      console.log(pool.poolId.tokens.map(token => token.symbol))
      console.log(pool.poolId.swapFee)
      console.log(pool.poolId.totalSwapFee)
      console.log(priorFeeUSD)
      console.log(apy);

      return {
        address: pool.poolId.address,
        symbols: pool.poolId.tokens.map(token => token.symbol),
        tokens: pool.poolId.tokens.map(token => token.address),
        reserves: pool.poolId.tokens.map(token => Number(token.balance)),
        totalSupply: Number(pool.poolId.totalShares) * Math.pow(10, 18),
        apy: apy,
        dex: "Balancer V2",
      }
    })
  }

  if(gaugeResponse.user === null) return pools;

  if(gaugeResponse.user !== null){
    if(gaugeResponse.user.gaugeShares.length === 0) return pools;

    let gaugePools = gaugeResponse.user.gaugeShares;
    let chunkSize = 100;
    let batches = [];
    let batchCount = Math.ceil(gaugePools.length / chunkSize);

    const contract = new web3.eth.Contract(balancerV2ABI, masterVault);
    for (let i = 0; i < batchCount; i++) {
      let batch = new Web3BatchRequest();
      batch._requestManager = new Web3RequestManager(web3.currentProvider);

      gaugePools.slice(chunkSize * i, chunkSize * (i + 1)).forEach((gaugeShare, index) => {
        const poolId = gaugeShare.gauge.poolId;
        const tokenData = contract.methods.getPoolTokens(poolId).encodeABI();
        
        const request = {
          jsonrpc: '2.0',
          id: index,
          method: 'eth_call',
          params: [
            {
              to: masterVault, // use token address as the contract address
              data: tokenData // use balanceOf function signature and padded wallet address as the data field
            },
            'latest' // use latest block number
          ]
        };

        batch.add(request);
      });

      batches.push(batch);
    }

    const gaugeResults = await Promise.all(batches.map(batch => batch.execute()));

    const gaugeTokens = gaugeResults.flat().map(result => {
      try{
        const decoded = web3.eth.abi.decodeParameters(["address[]", "uint256[]"], result.result);
        const gaugeTokenInfo = {
          address: decoded[0],
          balance: decoded[1],
        };

        return gaugeTokenInfo;
      } catch(e){
        console.log(result);
        return null;
      }
    })

    const gaugeTokenInfos = await Promise.all(gaugeTokens.map(token => {
      if(token === null) return null;

      return getMultipleTokenInfo(token.address);
    }));

    const gaugePoolsWithTokens = gaugePools.map((gaugePool, index) => {
      if(gaugeTokenInfos[index] === null) return null;

      return {
        address: gaugePool.id.split("-")[1],
        symbols: [],
        tokens: [],
        reserves: [],
        totalSupply: Number(gaugePool.gauge.totalSupply) * Math.pow(10, 18),
        dex: "Balancer V2",
      }
    });

    gaugePoolsWithTokens.forEach((gaugePoolWithToken, index) => {
      if(gaugePoolWithToken === null) return;

      gaugeTokens[index].address.forEach((token, index2) => {
        if(gaugeTokenInfos[index][index2] !== undefined) {
          gaugePoolWithToken.symbols.push(gaugeTokenInfos[index][index2].symbol);
          gaugePoolWithToken.tokens.push(token);
          gaugePoolWithToken.reserves.push(Number((gaugeTokens[index].balance)[index2]) / Math.pow(10, gaugeTokenInfos[index][index2].decimals));
          gaugePoolWithToken.totalSupply += Number();
        }
      });
    });

    pools = pools.concat(gaugePoolsWithTokens);
  }

  return pools;
}

export { fetchBalancerV2Pools };
