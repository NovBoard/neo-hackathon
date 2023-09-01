import { fetchEthereumTokens } from "./protocols/ethereum/fetchEthereumTokens.js";
import { getEthereumTokens } from "./functions/ethereum/getEthereumTokens.js";
import { fetchKlaytnTokens } from "./protocols/klaytn/fetchKlaytnTokens.js";
import { getKlaytnTokens } from "./functions/klaytn/getKlaytnTokens.js";

const main = async () => {
    // uniswap v2
    // const walletAddress = "0x0C9446d917C8553ba693f4704a9Acfb0d677B7cD";

    // sushiswap
    // const walletAddress = "0x5ad6211cd3fde39a9cecb5df6f380b8263d1e277";
    // const walletAddress = "0x1f14be60172b40dac0ad9cd72f6f0f2c245992e8";

    // pancakeswap
    // const walletAddress = "0xae69116e4aa49645f78c1fc9f28f677aede0d153";
    // const walletAddress = "0x3d3ac4ca86e5e8304acea9c202fda747cdec45bb";

    // helix
    // const walletAddress = "0xa4c1135f0c0123f6683f98a8177f4c51f3179107";

    // kyberswap
    // const walletAddress = "0x31De05f28568e3d3D612BFA6A78B356676367470";

    // balancer v2
    // const walletAddress = "0x088C56A24DC58c78D5D15Ad55Ab3811658c9dfa0";
    // const walletAddress = "0xaf52695e1bb01a16d33d7194c28c42b10e0dbec2";
    const ethereumAddress = "0xba12222222228d8ba445958a75a0704d566bf2c8";

    // curve
    // const walletAddress = "0xaf4264916b467e2c9c8acf07acc22b9edddadf33";

    // uniswap v3 -> 아직 불가능
    // const walletAddress = "0x50ec05ade8280758e2077fcbc08d878d4aef79c3";
    // const walletAddress = "0x088C56A24DC58c78D5D15Ad55Ab3811658c9dfa0";

    // klaytn
    // const walletAddress = "0x386ca3cb8bb13f48d1a6adc1fb8df09e7bb7f9c8";
    const klayAddress = "0xe73e76e3ddba532a3583888df330c82df1568e07";

    // getEthereum
    // Promise.all 사용하여 병렬로 비동기 작업 수행
    let tokens = await Promise.all([
        fetchEthereumTokens(),
        fetchKlaytnTokens()
    ]);

    let [ethereum, klaytn] = await Promise.all([
        getEthereumTokens(tokens[0], ethereumAddress),
        getKlaytnTokens(tokens[1], klayAddress)
    ]);

    console.log(ethereum, klaytn);

    console.log("All done!");
}

main();