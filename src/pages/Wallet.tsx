// SideBar.js
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { SideBar } from '../components/SideBar';
import { AssetWorth } from '../components/AssetSummaryView';
import { WalletAddressInputView } from '../components/WalletAddressInputView';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNavigator } from '../components/MobileNavigator';
import { useLocation } from 'react-router-dom';
import userAPI from '../api/userAPI';
import { getUserData } from '../repos/balance.js';
import { calculateTotalValue } from '../functions/Utils';
import { getExchangeRate } from '../functions/GetExchangeRate';
import { Spinner } from '../components/Spinner';

const AppLayoutBlock = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    background-color: black;
    height: 100vh;

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

const Wallet = () => {
    const loc = useLocation();
    const state = loc.state;
    const credential = state.credential;
    const [wallets, setWallets] = useState([]);
    const [totalValue, setTotalValue] = useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getInitialState = async () => {
            const userResponse = await userAPI.post("/get-wallets", { credential });
            const walletAddresses = userResponse.data.ethereum;
            setWallets(walletAddresses);

            const data = await getUserData(walletAddresses);
            const exchangeRate = await getExchangeRate();
            const { totalTokenValue, totalPoolValue } = calculateTotalValue(data);
            setTotalValue((totalTokenValue + totalPoolValue) * exchangeRate);

            setLoading(false);
        }

        getInitialState();
    }, [])

    return (
        <AppLayoutBlock>
            <SideBar selectedMenu={3} />
            <AssetLayoutBlock>
                <MobileHeader />
                {loading ? (
                    <Spinner />
                ) : (
                    <>
                        <AssetWorth totalValue={totalValue} />
                        <WalletAddressInputView wallets={wallets} />
                    </>
                )}
                <MobileNavigator selectedMenu={3} />
            </AssetLayoutBlock>
        </AppLayoutBlock>
    );
}

export { Wallet };