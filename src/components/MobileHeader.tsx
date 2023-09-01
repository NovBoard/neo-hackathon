import { Div, Img, useIsMobile } from "./Common";
import '../styles/MobileDashboard.scss';
import { useNavigate } from "react-router-dom";

const MobileHeader = () => {
    const isMobile = useIsMobile(768);
    const navigate = useNavigate();

    const Header = () => {
        return(
            <Div className="mobile-header">
                <Div className="mobile-header-images">
                    <Div className="mobile-header-image"><Img src={"img/NOVLogo.svg"} /></Div>
                    <Div className="mobile-header-image" onClick={()=>{navigate("/")}}><Img src={"img/LogoutOutlined.svg"} /></Div>
                </Div>
            </Div>
        )
    }

    return isMobile ? <Header /> : <Div />
};

export { MobileHeader };
