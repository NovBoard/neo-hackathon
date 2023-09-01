import { Web3 } from "web3";
import { multicallABI } from "../../abi/abis.js";
import { prepareEthereumTokens } from "./prepareEthereumTokens.js";

const provider = "https://mainnet.infura.io/v3/d3ae86a8709a4d66a552594d998347d3";
const web3 = new Web3(provider);

// multicall3 컨트랙트 주소와 ABI를 불러옵니다.
const multicallAddress = "0xcA11bde05977b3631167028862bE2a173976CA11";

// multicall3 컨트랙트 객체를 생성합니다.
const multicallContract = new web3.eth.Contract(multicallABI, multicallAddress);

// multicall3 컨트랙트의 aggregate 메소드를 호출하여 잔액을 조회합니다.
async function getEthereumTokens(tokens, walletAddress) {
    // balanceOf 함수의 데이터를 준비합니다.
    let balanceOfData = await prepareEthereumTokens(tokens, walletAddress);

    // balanceOfData 배열을 50개씩 분할합니다.
    const chunkSize = 50;
    let chunks = [];
    for (let i = 0; i < balanceOfData.length; i += chunkSize) {
        chunks.push(balanceOfData.slice(i, i + chunkSize));
    }

    // 각 청크에 대해 tryAggregate 메소드를 병렬로 호출합니다.
    let promises = [];
    for (let chunk of chunks) {
        promises.push(multicallContract.methods.aggregate(chunk).call());
    }

    // 모든 프로미스가 완료될 때까지 기다립니다.
    let results = await Promise.all(promises);

    // aggregate 메소드의 반환값에서 잔액들을 추출합니다.
    let balances = [];
    for (let result of results) {
        for (let callResult of result.returnData) {
            try{
                balances.push(web3.eth.abi.decodeParameter('uint256', callResult));
            } catch (e) {
                balances.push(0n);
            }
        }
    }

    // 결과를 저장할 배열을 선언합니다.
    let result = []

    // 잔액들을 순회하면서 0이 아니면 결과 배열에 추가합니다.
    for (let i = 0; i < balances.length; i++) {
        let balance = balances[i]
        if (balance !== 0n) {
            result.push({ address: balanceOfData[i][0], balance: balance, tokenInfo: tokens[i] })
        }
    }

    console.log(result);

    // 결과 배열을 반환합니다.
    return result
}

export { getEthereumTokens }