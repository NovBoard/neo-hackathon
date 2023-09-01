// 모듈 임포트
import CaverExtKAS from "caver-js-ext-kas";
import { multicallABI } from "../../abi/abis.js";
import { prepareKlaytnTokens } from "./prepareKlaytnTokens.js";

// KAS 접속 정보 설정
const accessKeyId = "KASK2U8TSYABXYY6NZYAEN0F" // KAS 콘솔에서 발급받은 access key id
const secretAccessKey = "JWvA6UoIsnQaj8C0dwo-oVmyF1rkD5ozLOYTuVq9" // KAS 콘솔에서 발급받은 secret access key
const chainId = 8217 // 메인넷의 chain id

// caver 객체를 생성합니다.
const caver = new CaverExtKAS();
caver.initKASAPI(chainId, accessKeyId, secretAccessKey);

// multicall3 컨트랙트 주소와 ABI를 불러옵니다.
const multicallAddress = "0xcA11bde05977b3631167028862bE2a173976CA11";

// multicall3 컨트랙트 객체를 생성합니다.
const multicallContract = new caver.contract(multicallABI, multicallAddress);

// multicall3 컨트랙트의 aggregate 메소드를 호출하여 잔액을 조회합니다.
async function getKlaytnTokens(tokens, walletAddress) {
    // balanceOf 함수의 데이터를 준비합니다.
    let balanceOfData = await prepareKlaytnTokens(tokens, walletAddress);

    // balanceOfData 배열을 100개씩 분할합니다.
    const chunkSize = 100;
    let chunks = [];
    for (let i = 0; i < balanceOfData.length; i += chunkSize) {
        chunks.push(balanceOfData.slice(i, i + chunkSize));
    }

    // console.log(chunks);

    // 각 청크에 대해 tryAggregate 메소드를 병렬로 호출합니다.
    let promises = [];
    for (let chunk of chunks) {
        promises.push(multicallContract.methods.tryAggregate(false, chunk).call());
    }

    // 모든 프로미스가 완료될 때까지 기다립니다.
    let results = await Promise.all(promises);

    // console.log(results);

    // aggregate 메소드의 반환값에서 잔액들을 추출합니다.
    let balances = [];
    for (let result of results) {
        for (let callResult of result) {
            if(callResult.success === false) continue;
            balances.push(caver.abi.decodeParameter('uint256', callResult.returnData));
        }
    }

    // 결과를 저장할 배열을 선언합니다.
    let result = []

    // 잔액들을 순회하면서 0이 아니면 결과 배열에 추가합니다.
    for (let i = 0; i < balances.length; i++) {
        let balance = Number(balances[i]);
        if (balance !== 0) {
            result.push({ address: balanceOfData[i][0], balance: balance })
        }
    }

    console.log(result);

    // 결과 배열을 반환합니다.
    return result
}

export { getKlaytnTokens };