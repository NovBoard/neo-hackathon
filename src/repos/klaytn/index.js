import { getAllPools } from "./functions/getAllPools.js";
import { getLpPools } from "./functions/getLpPools.js";
// import { getPoolInfo } from "./functions/getPoolInfo.js";

const main = async () => {
    // klayswap
    const walletAddress = "0xe73e76e3ddba532a3583888df330c82df1568e07";

    let pools = await getAllPools(walletAddress);
    console.log("All done!");

    const positions = await getLpPools(pools, walletAddress);
    // const result = await getPoolInfo(positions);
}

main();