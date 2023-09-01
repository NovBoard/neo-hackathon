import { useState, useEffect } from "react";
import { Div, Img, Span, useIsMobile } from "./Common";
import { formatNumber } from "../functions/Utils";

type Token = {
    symbol: string;
    amount: number;
    price: number;
    value: number;
}

type Pool = {
    symbols: string[];
    dex: string;
    amounts: number[];
    apy: number;
    value: number;
}

type Asset = {
    type: string,
    asset: Token[] | Pool[],
}

const Text = ({ children, style }: { children: any, style?: any }) => {
    return <Div className="asset-scroll-title" style={style}>{children}</Div>
}

const Field = ({ label, value }: { label: any, value: any }) => {
    const isMobile = useIsMobile(768);
    const fontSize = isMobile ? "0.5rem" : "1rem";

    return isMobile ? (
        <Div className="asset-scroll-field">
            <Div className="asset-scroll-text">{label}</Div>
            <Div className="asset-scroll-text" style={{ fontSize }}>{value}</Div>
        </Div>
    ) : (
        <Div className="asset-scroll-field">
            <Div>
                <Div className="asset-scroll-text">{label}</Div>
                <Div className="asset-scroll-text">{value}</Div>
            </Div>
        </Div>
    );
}

const Item = ({ fields }: { fields: any[] }) => {
    return (
        <Div className="asset-scroll-item">
            {fields.map((field, index) => (
                <Field label={field.label} value={field.value} key={index} />
            ))}
        </Div>
    )
}

// Use a switch statement to handle different types of assets
const AssetScrollItem = ({ type, asset }: Asset) => {
    const isMobile = useIsMobile(768);

    let title, items: any[];
    switch (type) {
        case "token":
            title = "지갑 자산";
            if (isMobile) {
                items = (asset as Token[]).map(token => ({
                    fields: [
                        { label: token.symbol, value: "" },
                        { label: formatNumber(token.amount), value: "" },
                        { label: `₩${formatNumber(token.value)}`, value: "" }
                    ]
                }));
            } else {
                items = (asset as Token[]).map(token => ({
                    fields: [
                        { label: token.symbol, value: "" },
                        { label: "토큰 수량(개)", value: formatNumber(token.amount) },
                        { label: "현재 가격", value: `₩${formatNumber(token.price)}` },
                        { label: "평가 가치", value: `₩${formatNumber(token.value)}` }
                    ]
                }));
            }
            break;
        case "pool":
            title = "풀 자산";
            if (isMobile) {
                items = (asset as Pool[]).map(pool => ({
                    fields: [
                        { label: pool.symbols.join("/"), value: pool.dex },
                        { label: pool.amounts.map(amount => formatNumber(amount)).join(" / "), value: "" },
                        { label: `₩${formatNumber(pool.value)}`, value: "" }
                    ]
                }));
            } else {
                items = (asset as Pool[]).map(pool => ({
                    fields: [
                        { label: pool.symbols.join("/"), value: pool.dex },
                        { label: "토큰 수량(개)", value: pool.amounts.map(amount => formatNumber(amount)).join(" / ") },
                        { label: "APY", value: `${formatNumber(pool.apy)}%` },
                        { label: "평가 가치", value: `₩${formatNumber(pool.value)}` }
                    ]
                }));
            }
            break;
        default:
            title = "";
            items = [];
    }

    // Use useState hook to manage the toggle state
    const [isToggled, setIsToggled] = useState(false);

    // Define the handler function for the toggle button
    const toggle = () => {
        // Toggle the state
        setIsToggled(!isToggled);
    }

    const totalValue = (asset as Token[]).reduce((acc, token) => acc + token.value, 0);

    return (
        <Div className="asset-scroll">
            {isMobile
                ?
                <Div className="asset-scroll-title-mobile">
                    <Text>{title}</Text>
                    <Text>₩ {formatNumber(totalValue)}</Text>
                </Div>
                :
                <Text>{title}</Text>
            }
            <Div className="asset-scroll-items">
                {/* Use FieldRaw component if mobile */}
                {isMobile && <FieldRaw isToggled={isToggled} toggle={toggle} />}
                {/* Slice the items array according to the toggle state */}
                {isMobile ? items.slice(0, isToggled ? asset.length : 4).map((item, index) => (
                    <Item key={index} fields={item.fields} />
                )) : items.map((item, index) => (
                    <Item key={index} fields={item.fields} />
                ))}
            </Div>
        </Div>
    )
}

// Define FieldRaw component as a separate function
const FieldRaw = ({ isToggled, toggle }: { isToggled: boolean, toggle: () => void }) => {
    return (
        <Div className="field-raw">
            <Div className="field-raw-token">토큰</Div>
            <Div className="field-raw-amount">수량</Div>
            <Div className="field-raw-value">
                <Div className="field-raw-text">평가 가치</Div>
                {isToggled ?
                    <Div onClick={toggle} className="field-raw-toggle">
                        <Img src={"img/Vector-1.svg"} />
                    </Div> :
                    <Div onClick={toggle} className="field-raw-toggle">
                        <Img src={"img/Vector.svg"} />
                    </Div>}
            </Div>
        </Div>
    )
}


const TokenScrollView = ({ tokens }: { tokens: Token[] }) => {
    return <AssetScrollItem type="token" asset={tokens} />
}

const PoolScrollView = ({ pools }: { pools: Pool[] }) => {
    return <AssetScrollItem type="pool" asset={pools} />
}

const AssetScrollView = ({ tokens, pools }: { tokens: Token[], pools: Pool[] }) => {
    return (
        <Div className="asset-scroll-view">
            <TokenScrollView tokens={tokens} />
            <PoolScrollView pools={pools} />
        </Div>
    )
}

export { AssetScrollView }