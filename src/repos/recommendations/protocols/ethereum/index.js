const recommendAllPools = (pools, tokens) => {
    let addresses = tokens.map(token => token.address);
    const recommendedPools = pools.map((pool) => {
        const isMatch = pool.addresses.every((address) => addresses.includes(address));
        if (isMatch) {
            return pool;
        } else{
            return null;
        }
    }).filter((pool) => pool !== null);
    return recommendedPools;
}

export { recommendAllPools };