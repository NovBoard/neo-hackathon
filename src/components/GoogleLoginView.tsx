import React from 'react';
import '../styles/Login.scss';
import { Div, Img, Span } from './Common';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import authAPI from '../api/authAPI';

declare global {
    interface Window {
        gtag: any; // gtag 함수의 타입을 선언합니다.
    }
}

const GoogleLoginButton = () => {
    const navigate = useNavigate();
    const goToDashBoard = (credential: string) => {
        navigate('/dashboard', { state: { credential: credential } });
    };

    const handleGoogleLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse: any) => {
            const { tokens, email, isAuth } = await authAPI.post("/google", {
                credential: codeResponse.code,
            }).then(res => res.data);

            if (isAuth) {
                goToDashBoard(tokens);
                window.gtag('set', { 'user_id': email });
            } else {
                alert("인증 대기 중입니다!");
            }
        },
        onError: errorResponse => console.log(errorResponse),
    });

    return (
        <Div className="google-login-button" onClick={handleGoogleLogin}>
            <Img src="img/SigninButtonGoogle.svg" alt="Google" />
        </Div>
    );
};

const GoogleLoginView = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID!;

    return (
        <Div className="google-login">
            <Div className="google-login-modal">
                <Div className="google-login-title">WELCOME BACK</Div>
                <Div className="google-login-description">Welcome back! You can sign in/up with Google.</Div>
                <GoogleOAuthProvider clientId={clientId}>
                    <GoogleLoginButton />
                </GoogleOAuthProvider>
                <Div className="google-login-text">
                    <Div className="google-login-text-account">Don’t have an account?</Div>
                    <Div className="google-login-text-signup">Sign up fo free!</Div>
                </Div>
            </Div>
        </Div>
    )
}

export { GoogleLoginView };