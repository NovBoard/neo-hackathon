// SideBar.js
import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import { SideBar } from '../components/SideBar';
import { AssetSummaryView } from '../components/AssetSummaryView';
import AssetChangeView from '../components/AssetChangeView';
import { AssetAllocationView } from '../components/AssetAllocationView';
import { AssetScrollView } from '../components/AssetScrollView';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNavigator } from '../components/MobileNavigator';
import { useLocation } from 'react-router-dom';
import userAPI from '../api/userAPI';
import { getUserData } from '../repos/balance.js';
import { processTokenData, processDexData, calculateTotalValue } from '../functions/Utils';
import { getExchangeRate } from '../functions/GetExchangeRate';
import { Spinner } from '../components/Spinner';

const AppLayoutBlock = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    background-color: black;
    height: 225vh;

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

const Dashboard = () => {
    const loc = useLocation();
    const state = loc.state;
    const credential = state.credential;
    const [totalTokens, setTotalTokens] = useState([] as any);
    const [totalPools, setTotalPools] = useState([] as any);
    const [totalTokenValue, setTotalTokenValue] = useState(0);
    const [totalPoolValue, setTotalPoolValue] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [tokenAllocation, setTokenAllocation] = useState([] as any);
    const [poolAllocation, setPoolAllocation] = useState([] as any);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getInitialState = async () => {
            const userResponse = await userAPI.post("/get-wallets", { credential });
            const walletAddresses = userResponse.data.ethereum;

            const data = await getUserData(walletAddresses);
            const exchangeRate = await getExchangeRate();

            const totalTokens = data.totalTokens.map((token: any) => ({ ...token, value: token.value * exchangeRate, price: token.price * exchangeRate }));
            const totalPools = data.totalPools.map((pool: any) => ({ ...pool, value: pool.value * exchangeRate }));
            const { totalTokenValue, totalPoolValue } = calculateTotalValue(data);

            setTotalTokens(totalTokens);
            setTotalPools(totalPools);
            setTotalTokenValue(totalTokenValue * exchangeRate);
            setTotalPoolValue(totalPoolValue * exchangeRate);
            setTotalValue((totalTokenValue + totalPoolValue) * exchangeRate);
            setTokenAllocation(processTokenData(totalTokens));
            setPoolAllocation(processDexData(totalPools));

            setLoading(false);
        }

        getInitialState();
    }, [])

    return (
        <AppLayoutBlock>
            <SideBar selectedMenu={0} />
            <AssetLayoutBlock>
                <MobileHeader />
                {loading ? (
                        <Spinner />
                ) : (
                    <>
                        <AssetSummaryView totalTokenValue={totalTokenValue} totalPoolValue={totalPoolValue} />
                        <AssetChangeView totalValue={totalValue} />
                        <AssetAllocationView tokens={tokenAllocation} pools={poolAllocation} />
                        <AssetScrollView tokens={totalTokens} pools={totalPools} />
                    </>
                )}
                <MobileNavigator selectedMenu={0} />
            </AssetLayoutBlock>
        </AppLayoutBlock>
    );
}

export { Dashboard };