/*global BigInt*/
import { Web3 } from "web3";
import { getMultipleTokenInfo } from "./getMultipleTokenInfo.js";
import { Web3BatchRequest, Web3RequestManager } from "web3-core";
import { ETHEREUM } from "../constant/providers.js";
import { balanceCheckerABI } from "../abi/balanceCheckerABI.js";

const provider = ETHEREUM;
const web3 = new Web3(provider);

const mainnetBalanceChecker = "0xb1F8e55c7f64D203C1400B9D8555d050F94aDF39";

async function getUsersBalances(data, walletAddresses) {
  if (walletAddresses.length === 0) return [];

  if (data.length === 0) return [];

  const balanceCheckerContract = new web3.eth.Contract(balanceCheckerABI, mainnetBalanceChecker);
  const assetAddresses = data.map(token => token.address).filter((address, index, self) => address.length === 42 && self.indexOf(address) === index);

  const filteredData = data.filter((token, index, self) => token.address.length === 42 && self.findIndex(v => v.address === token.address) === index);

  const chunkSize = 50;
  const chunkCount = Math.ceil(assetAddresses.length / chunkSize);

  const balancePromises = [];

  for (let j = 0; j < chunkCount; j++) {
    const asset = assetAddresses.slice(chunkSize * j, chunkSize * (j + 1));
    const contract = balanceCheckerContract.methods.balances(walletAddresses, asset);
    const call = contract.call();
    balancePromises.push(call);
  }

  // console.time("Balance Done")
  const balances = await Promise.all(balancePromises);
  // console.timeEnd("Balance Done")

  let results = new Array(walletAddresses.length).fill([]);
  balances.forEach(balance => {
    try {
      const length = Math.floor(balance.length / walletAddresses.length);

      for (let i = 0; i < walletAddresses.length; i++) {
        let slicedResult = balance.slice(length * i, length * (i + 1));
        results[i] = results[i].concat(slicedResult);
      }
    } catch (e) {
      // console.log(balance);
      console.log(e);
    }
  });

  const nonZeroBalanceAssets = results.map((balances, index1) => {
    return balances.flat().map((balance, index2) => {
      if (balance !== 0n) {
        const assetInfo = filteredData[index2];
        const address = assetInfo.address;
        return {
          balance: Number(balance),
          address: address,
          details: assetInfo,
          dex: assetInfo.dex,
        };
      } else {
        return null;
      }
    }).filter(asset => asset !== null);
  });

  // console.time("Price Done");
  let result = [];

  const pricePromises = [];
  for (let i = 0; i < nonZeroBalanceAssets.length; i++) {
    const assets = nonZeroBalanceAssets[i];
    const nonZeroBalanceTokens = assets.filter(asset => asset.dex === "Ethereum");

    let addressChunkSize = 100;
    let chunkCount = Math.ceil(nonZeroBalanceTokens.length / addressChunkSize);
    const pricePromise = [];

    for (let i = 0; i < chunkCount; i++) {
      const chunkedTokens = nonZeroBalanceTokens.slice(addressChunkSize * i, addressChunkSize * (i + 1));
      const prices = getMultipleTokenInfo(chunkedTokens.map(token => token.address));
      pricePromise.push(prices);
    }

    pricePromises.push(Promise.all(pricePromise));
  }

  const priceResults = await Promise.all(pricePromises);

  for (let i = 0; i < priceResults.length; i++) {
    const assets = nonZeroBalanceAssets[i];
    const nonZeroBalanceTokens = assets.filter(asset => asset.dex === "Ethereum");
    const nonZeroBalancePools = assets.filter(asset => asset.dex !== "Ethereum");

    const priceChunks = priceResults[i];
    const tokenTokenResults = calculateDepositUSD(priceChunks, nonZeroBalanceTokens);
    const totalAssets = tokenTokenResults.concat(nonZeroBalancePools);
    result.push(totalAssets);
  }

  // console.timeEnd("Price Done");
  // console.log(result);

  return result;
}

// 각 토큰의 가격과 밸런스를 곱하여 depositUSD 값을 계산하는 함수
function calculateDepositUSD(priceChunks, addressChunks) {
  // 결과를 저장할 배열을 선언합니다.
  let result = [];

  const prices = priceChunks.flat();

  // priceChunks 배열을 순회하면서 각 토큰의 가격과 밸런스를 곱하여 depositUSD 값을 계산하고, 결과 배열에 추가합니다.
  for (let i = 0; i < prices.length; i++) {
    let assetInfo = prices[i];
    if (assetInfo === undefined) continue;

    let token = addressChunks[i];
    let symbol = token.details.symbol;
    let price = assetInfo.price;
    let balance = token.balance; // 토큰의 밸런스
    let decimals = assetInfo.decimals; // 토큰의 소수점 자릿수
    let amount = balance / (Math.pow(10, decimals)); // 밸런스를 실제 수량으로 변환
    let value = amount * price; // 밸런스와 가격을 곱하여 depositUSD 값을 계산

    result.push({
      symbol: symbol,
      price: price,
      amount: amount,
      value: value,
      address: token.address,
      dex: "Ethereum",
    });
  }

  // 결과 배열을 반환합니다.
  return result;
}

export { getUsersBalances }