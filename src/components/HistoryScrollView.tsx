import React, { useEffect, useMemo, useState } from "react";
import { useCollapse } from "react-collapsed";
import { useLocation } from "react-router-dom";
import historyAPI from "../api/historyAPI";
import { downloadDataAsExcel } from "../functions/DownloadDataAsExcel";
import "../styles/History.scss";
import { Div, Img, useIsMobile } from "./Common";
import { formatNumber, getPreviousDay } from "../functions/Utils";
import { getExchangeRate } from "../functions/GetExchangeRate";

type Token = {
    symbol: string;
    amount: number;
    price: number;
    value: number;
}

type Pool = {
    symbols: string[];
    amounts: number[];
    dex: string;
    value: number;
}

type History = {
    date: string;
    totalValue: number;
    totalTokens: Token[];
    totalPools: Pool[];
}

type HistoryItemProps = {
    index: number;
    history: History[];
};

type TotalAssetItemProps = {
    index: number;
    history: History[];
    getToggleProps: () => any;
    isExpanded: boolean;
};

type CollapseContentProps = {
    index: number;
    history: History[];
    getCollapseProps: () => any;
    isExpanded: boolean;
};

const TotalAssetItem = ({ index, history, getToggleProps, isExpanded }: TotalAssetItemProps) => {
    const { date } = history[index];
    const [totalValue, setTotalValue] = useState(0);
    const [dailyPL, setDailyPL] = useState(0);

    const ICON_EXPANDED = "img/Vector.svg";
    const ICON_COLLAPSED = "img/Vector-1.svg";

    useEffect(() => {
        async function getInitialState() {
            const exchangeRate = await getExchangeRate();
            const totalValue = history[index].totalValue * exchangeRate;
            setTotalValue(totalValue);

            let yesterdayValue;
            if (index === history.length - 1) {
                yesterdayValue = 0;
            } else {
                if (history[index + 1].date === getPreviousDay(history[index].date)) {
                    yesterdayValue = history[index + 1].totalValue * exchangeRate;
                } else {
                    yesterdayValue = 0;
                }
            }

            let dailyPL;
            if (yesterdayValue === 0) {
                dailyPL = totalValue;
            } else {
                dailyPL = totalValue - yesterdayValue;
            }

            setDailyPL(dailyPL);
        }

        getInitialState();
    }, []);

    const icon = useMemo(
        () => (isExpanded ? ICON_EXPANDED : ICON_COLLAPSED),
        [isExpanded]
    );

    return (
        <Div className="total-asset-item">
            <Div className="asset-field">{date}</Div>
            <Div className="asset-field">
                <Div>총 자산</Div>
                <Div>₩ {formatNumber(totalValue)}</Div>
            </Div>
            <Div className="asset-field">
                <Div>일간 손익(₩)</Div>
                {dailyPL >= 0 ? <Div style={{ "color": "#3C89E8" }}>+{formatNumber(dailyPL)}</Div> : <Div style={{ "color": "#F00" }}>{formatNumber(dailyPL)}</Div>}
            </Div>
            <Div className="asset-field" {...getToggleProps()}>
                <Div className="asset-field-collapse">
                    <Div>더 보기</Div>
                    <Div className="asset-field-collapse-image">
                        <Img src={icon} alt="icon" />
                    </Div>
                </Div>
            </Div>
        </Div>
    );
};

const TokenItem = ({ token, yesterdayTokens }: { token: Token, yesterdayTokens: Token[] }) => {
    const { symbol, amount, price, value } = token;
    const isMobile = useIsMobile(768);

    let yesterdayValue = yesterdayTokens.find((yesterdayToken: any) => yesterdayToken.symbol === symbol)?.value;
    let dailyPL;
    if (yesterdayValue === undefined) {
        dailyPL = value;
    } else {
        dailyPL = value - yesterdayValue;
    }

    return (
        <Div className="asset-item">
            <Div className="asset-field">{symbol}</Div>
            <Div className="asset-field">
                <Div>토큰 수량(개)</Div>
                <Div>{formatNumber(amount)}개</Div>
            </Div>
            <Div className="asset-field">
                <Div>현재 가격</Div>
                <Div>₩{formatNumber(price)}</Div>
            </Div>
            <Div className="asset-field">
                <Div>평가 가치</Div>
                <Div>₩{formatNumber(value)}</Div>
            </Div>
            {
                !isMobile &&
                <Div className="asset-field">
                    <Div>일가 손익(₩)</Div>
                    {dailyPL >= 0 ? <Div style={{ "color": "#3C89E8" }}>+{formatNumber(dailyPL)}</Div> : <Div style={{ "color": "#F00" }}>{formatNumber(dailyPL)}</Div>}
                </Div>
            }
        </Div>
    );
};

const PoolItem = ({ pool, yesterdayPools }: { pool: Pool, yesterdayPools: Pool[] }) => {
    const { symbols, dex, amounts, value } = pool;
    const isMobile = useIsMobile(768);

    let yesterdayValue = yesterdayPools.find((yesterdayPool: any) => yesterdayPool.symbols.join("/") === symbols.join("/") && yesterdayPool.dex === dex)?.value;
    let dailyPL;
    if (yesterdayValue === undefined) {
        dailyPL = value;
    } else {
        dailyPL = value - yesterdayValue;
    }

    return (
        <Div className="asset-item">
            <Div className="asset-field">
                <Div>{symbols.join("/")}</Div>
                <Div>{dex}</Div>
            </Div>
            <Div className="asset-field">
                <Div>토큰 수량(개)</Div>
                <Div>{amounts.map(amount => formatNumber(amount)).join(" / ")}</Div>
            </Div>
            <Div className="asset-field">
                <Div>현재 가격</Div>
                <Div>-</Div>
            </Div>
            <Div className="asset-field">
                <Div>평가 가치</Div>
                <Div>₩{formatNumber(value)}</Div>
            </Div>
            {
                !isMobile &&
                <Div className="asset-field">
                    <Div>일가 손익(₩)</Div>
                    {dailyPL >= 0 ? <Div style={{ "color": "#3C89E8" }}>+{formatNumber(dailyPL)}</Div> : <Div style={{ "color": "#F00" }}>{formatNumber(dailyPL)}</Div>}
                </Div>
            }
        </Div>
    );
};

const CollapseContent = ({ index, history, getCollapseProps, isExpanded }: CollapseContentProps) => {
    const [totalTokens, setTotalTokens] = useState<Token[]>([]);
    const [totalPools, setTotalPools] = useState<Pool[]>([]);
    const [yesterdayTokens, setYesterdayTokens] = useState<Token[]>([]);
    const [yesterdayPools, setYesterdayPools] = useState<Pool[]>([]);

    useEffect(() => {
        async function getInitialState() {
            const exchangeRate = await getExchangeRate();
            setTotalTokens(history[index].totalTokens.map((token: Token) => ({ ...token, value: token.value * exchangeRate, price: token.price * exchangeRate })))
            setTotalPools(history[index].totalPools.map((pool: Pool) => ({ ...pool, value: pool.value * exchangeRate })));

            let yesterdayTokens: Token[] = [];
            let yesterdayPools: Pool[] = [];
            if (index === history.length - 1) {
                yesterdayTokens = [];
                yesterdayPools = [];
            } else {
                if (history[index + 1].date === getPreviousDay(history[index].date)) {
                    yesterdayTokens = history[index + 1].totalTokens.map((token: Token) => ({ ...token, value: token.value * exchangeRate, price: token.price * exchangeRate }));
                    yesterdayPools = history[index + 1].totalPools.map((pool: Pool) => ({ ...pool, value: pool.value * exchangeRate }));
                } else {
                    yesterdayTokens = [];
                    yesterdayPools = [];
                }
            }

            setYesterdayTokens(yesterdayTokens);
            setYesterdayPools(yesterdayPools);
        }

        getInitialState();
    }, []);

    return (
        <Div {...getCollapseProps()} className="collapse-content">
            <Div className="collapse-content-items">
                {totalTokens.map((token) => (
                    <TokenItem token={token} yesterdayTokens={yesterdayTokens} key={token.symbol} />
                ))}
                {totalPools.map((pool) => (
                    <PoolItem pool={pool} yesterdayPools={yesterdayPools} key={pool.symbols[0] + pool.symbols[1]} />
                ))}
            </Div>
        </Div>
    );
};

const HistoryItem = ({ index, history }: HistoryItemProps) => {
    const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();
    return (
        <Div className="history-item">
            <TotalAssetItem index={index} history={history} getToggleProps={getToggleProps} isExpanded={isExpanded} />
            <CollapseContent index={index} history={history} getCollapseProps={getCollapseProps} isExpanded={isExpanded} />
        </Div>
    );
};

const HistoryScrollView = () => {
    const loc = useLocation();
    const state = loc.state;
    const credential = state.credential;
    const [data, setData] = useState([]);


    useEffect(() => {
        const getInitialState = async () => {
            const history = await historyAPI.post("/get-all-history", { credential }).then(res => res.data);
            setData(history.reverse());
        }

        getInitialState();
    }, []);

    return (
        <Div className="history-scroll">
            <Div className="history-scroll-title">
                <Div className="history-scroll-title-label">히스토리</Div>
                <Div className="history-scroll-title-image" onClick={() => { downloadDataAsExcel(data) }}><Img src={"img/_Button_.svg"} alt="button" /></Div>
            </Div>
            <Div className="history-scroll-table">
                <Div className="history-scroll-items">
                    <Div className="history-scroll-item">
                        {data.map((item, index) => (
                            <HistoryItem key={index} index={index} history={data} />
                        ))}
                    </Div>
                </Div>
            </Div>
        </Div>
    )
}

export { HistoryScrollView };
