import axios from 'axios';

const getPriorBlock = async (timestamp) => {
    const response = await axios.get(`https://coins.llama.fi/block/ethereum/${timestamp}`);
    const block = response.data;
    const height = block.height;
    return height;
}

export { getPriorBlock };