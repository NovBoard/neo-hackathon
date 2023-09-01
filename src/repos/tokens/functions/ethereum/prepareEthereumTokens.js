import { Web3 } from "web3";

const provider = "https://mainnet.infura.io/v3/d3ae86a8709a4d66a552594d998347d3";
const web3 = new Web3(provider);

// 각 KSLP 토큰 컨트랙트에 대해 balanceOf 함수의 데이터를 준비합니다.
async function prepareEthereumTokens(tokens, walletAddress) {
    // 결과를 저장할 배열을 선언합니다.
    let result = []

    // balanceOf 함수의 시그니처를 인코딩합니다.
    let functionSignature = web3.eth.abi.encodeFunctionSignature('balanceOf(address)');

    // balanceOf 함수의 인자로 지갑 주소를 인코딩합니다.
    let address = web3.eth.abi.encodeParameter('address', walletAddress);

    // callData는 함수 시그니처와 인자를 이어붙인 바이트 배열입니다.
    let callData = functionSignature + address.slice(2);

    // kslpTokens 객체의 각 속성에 대해 반복합니다.
    for (let token in tokens) {
        const tokenInfo = tokens[token];

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

export { prepareEthereumTokens }