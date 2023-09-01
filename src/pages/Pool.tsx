// SideBar.js
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { SideBar } from '../components/SideBar';
import { AssetWorth } from '../components/AssetSummaryView';
import { AssetAllocationView } from '../components/AssetAllocationView';
import { PoolRecommendationView } from '../components/PoolRecommendationView';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNavigator } from '../components/MobileNavigator';
import { useLocation } from 'react-router-dom';
import userAPI from '../api/userAPI';
import { getUserData } from '../repos/balance.js';
import { calculateTotalValue, processDexData, processTokenData } from '../functions/Utils';
import { recommendAllPools } from '../repos/recommendations/protocols/ethereum/index.js';
import { getExchangeRate } from '../functions/GetExchangeRate';
import { getAllPools } from '../repos/recommendations/protocols/ethereum/functions/getAllPools';
import { Spinner } from '../components/Spinner';

const AppLayoutBlock = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    background-color: black;
    height: 175vh;

    @media (max-width: 768px) {
       height: 100%;
    }
    
`;

const AssetLayoutBlock = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: space-evenly;
`;

const Pool = () => {
    const loc = useLocation();
    const state = loc.state;
    const credential = state.credential;
    const [totalValue, setTotalValue] = useState(0);
    const [tokenAllocation, setTokenAllocation] = useState([] as any);
    const [poolAllocation, setPoolAllocation] = useState([] as any);
    const [recommendedPools, setRecommendedPools] = useState([] as any);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getInitialState = async () => {
            const userResponse = await userAPI.post("/get-wallets", { credential });

            const walletAddresses = userResponse.data.ethereum;

            const [data, pools] = await Promise.all([
                getUserData(walletAddresses),
                getAllPools()
            ]);

            const exchangeRate = await getExchangeRate();

            const totalTokens = data.totalTokens.map((token: any) => ({ ...token, value: token.value * exchangeRate, price: token.price * exchangeRate }));
            const totalPools = data.totalPools.map((pool: any) => ({ ...pool, value: pool.value * exchangeRate }));

            const { totalTokenValue, totalPoolValue } = calculateTotalValue(data);

            setTotalValue((totalTokenValue + totalPoolValue) * exchangeRate);
            setTokenAllocation(processTokenData(totalTokens));
            setPoolAllocation(processDexData(totalPools));

            const recommendedPools = recommendAllPools(pools, totalTokens);
            setRecommendedPools(recommendedPools);

            setLoading(false);
        }

        getInitialState();
    }, [])

    return (
        <AppLayoutBlock>
            <SideBar selectedMenu={1} />
            <AssetLayoutBlock>
                <MobileHeader />
                {loading ? (
                    <Spinner />
                ) : (
                    <>
                        <AssetWorth totalValue={totalValue} />
                        <AssetAllocationView tokens={tokenAllocation} pools={poolAllocation} />
                        <PoolRecommendationView recommendedPools={recommendedPools} />
                    </>
                )}
                <MobileNavigator selectedMenu={1} />
            </AssetLayoutBlock>
        </AppLayoutBlock>
    );
}

export { Pool };