// caver-js 라이브러리를 불러옵니다.
// import Caver from 'caver-js';
import CaverExtKAS from "caver-js-ext-kas";

// KAS 접속 정보 설정
const accessKeyId = "KASK2U8TSYABXYY6NZYAEN0F" // KAS 콘솔에서 발급받은 access key id
const secretAccessKey = "JWvA6UoIsnQaj8C0dwo-oVmyF1rkD5ozLOYTuVq9" // KAS 콘솔에서 발급받은 secret access key
const chainId = 8217 // 메인넷의 chain id

// caver 객체를 생성합니다.
const caver = new CaverExtKAS();
caver.initKASAPI(chainId, accessKeyId, secretAccessKey);

// 각 KSLP 토큰 컨트랙트에 대해 balanceOf 함수의 데이터를 준비합니다.
async function prepareKlaytnTokens(tokens, walletAddress) {
    // 결과를 저장할 배열을 선언합니다.
    let result = []

    // balanceOf 함수의 시그니처를 인코딩합니다.
    let functionSignature = caver.abi.encodeFunctionSignature('balanceOf(address)');

    // balanceOf 함수의 인자로 지갑 주소를 인코딩합니다.
    let address = caver.abi.encodeParameter('address', walletAddress);

    // callData는 함수 시그니처와 인자를 이어붙인 바이트 배열입니다.
    let callData = functionSignature + address.slice(2);


    // kslpTokens 객체의 각 속성에 대해 반복합니다.
    for (let token in tokens) {
        const tokenInfo = tokens[token]

        // 속성 값으로부터 토큰 주소와 이름을 가져옵니다.
        let tokenAddress = tokenInfo.address;

        // balanceOf 함수의 데이터를 배열로 만듭니다.
        let balanceOfData = [
            tokenAddress, // 컨트랙트 주소
            callData, // 함수 이름
        ]

        // 결과 배열에 추가합니다.
        result.push(balanceOfData)
    }

    // 결과 배열을 반환합니다.
    return result
}

export { prepareKlaytnTokens }