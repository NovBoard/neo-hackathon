import React from 'react';
import '../styles/Login.scss';
import styled from 'styled-components';
import { GoogleLoginView } from '../components/GoogleLoginView';

const AppLayoutBlock = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    background-image: url("img/Frame3(2).svg");
    background-repeat: no-repeat;
    background-color: #191825;
    max-height: 100vh;
    min-height: 100vh;
`;

const Login = () => {
    return (
        <AppLayoutBlock>
            <GoogleLoginView />
        </AppLayoutBlock>
    );
}

export { Login };