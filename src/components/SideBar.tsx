// SideBar.js
import React from 'react';
import '../styles/SideBar.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { Div, Img } from './Common';

type SideBarProps = {
    selectedMenu: number;
}

const SideBar = ({selectedMenu}: SideBarProps) => {
    // useNavigate 훅을 사용하여 페이지 이동 함수를 가져옵니다.
    const navigate = useNavigate();
    const loc = useLocation();
    const state = loc.state;
    const credential = state.credential;

    // 사이드바 메뉴의 아이콘과 텍스트를 배열로 정의합니다.
    const menuItems = [
        {icon: "img/DashboardOutlined.svg", text: "대시보드", path: "/dashboard"},
        {icon: "img/BankOutlined.svg", text: "풀 자산", path: "/pool"},
        {icon: "img/HistoryOutlined.svg", text: "히스토리", path: "/history"},
        {icon: "img/WalletOutlined.svg", text: "내 지갑", path: "/wallet"},
        {icon: "img/LogoutOutlined.svg", text: "로그아웃", path: "/"}
    ];    

    return (
        <Div className="sidebar">
            <Div className="logo">
                <Img src={"img/NOVLogo.svg"} alt="NOV Dashboard Logo" />
            </Div>
            <Div className="menu">
                {menuItems.map((item, index) => {
                    if(index === selectedMenu){
                        return(
                            <Div className="menu-item" key={item.text} style={{"backgroundColor": "#1668DC"}} onClick={()=>{navigate(item.path, {state:{credential}})}}>
                                <Div className="menu-field">
                                    <Img src={item.icon} alt={item.text} />
                                    <Div className="text">{item.text}</Div>
                                </Div>
                            </Div>
                        )
                    } else{
                        return(
                            <Div className="menu-item" key={item.text} onClick={()=>{navigate(item.path, {state:{credential}})}}>
                                <Div className="menu-field">
                                    <Img src={item.icon} alt={item.text} />
                                    <Div className="text">{item.text}</Div>
                                </Div>
                            </Div>
                        )
                    }
                })}
            </Div>
        </Div>
    );
}

export { SideBar };
