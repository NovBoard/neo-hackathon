import { Div, Img, useIsMobile } from "./Common";
import '../styles/MobileDashboard.scss';
import { useLocation, useNavigate } from "react-router-dom";

type NavigatorProps = {
    selectedMenu: number;
}

const MobileNavigator = ({ selectedMenu }: NavigatorProps) => {
    const isMobile = useIsMobile(768);
    const navigate = useNavigate();
    const loc = useLocation();
    const state = loc.state;
    const credential = state.credential;

    // 사이드바 메뉴의 아이콘과 텍스트를 배열로 정의합니다.
    const menuItems = [
        { icon: "img/DashboardOutlined.svg", text: "대시보드", path: "/dashboard" },
        { icon: "img/BankOutlined.svg", text: "풀 자산", path: "/pool" },
        { icon: "img/HistoryOutlined.svg", text: "히스토리", path: "/history" },
        { icon: "img/WalletOutlined.svg", text: "내 지갑", path: "/wallet" },
    ];

    const Navigator = () => {
        return (
            <Div className="mobile-navigator">
                <Div className="mobile-navigator-items">
                    {menuItems.map((item, index) =>
                        index === selectedMenu ?
                            <Div className="mobile-navigator-item" key={index} style={{ "backgroundColor": "#1668DC" }} onClick={() => { navigate(item.path, {state:{credential}}) }}>
                                <Div className="mobile-navigator-item-icon">
                                    <Img src={item.icon} alt={item.text} />
                                </Div>
                                <Div className="mobile-navigator-item-text">{item.text}</Div>
                            </Div> :
                            <Div className="mobile-navigator-item" key={index} onClick={() => { navigate(item.path, {state:{credential}}) }}>
                                <Div className="mobile-navigator-item-icon">
                                    <Img src={item.icon} alt={item.text} />
                                </Div>
                                <Div className="mobile-navigator-item-text">{item.text}</Div>
                            </Div>
                    )}
                </Div>
            </Div>
        )
    }

    return isMobile ? <Navigator /> : <Div />
};

export { MobileNavigator };
