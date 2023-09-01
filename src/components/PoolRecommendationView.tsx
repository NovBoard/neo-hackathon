import React, { useState } from "react";
import { Div, useIsMobile } from "./Common";
import '../styles/Pool.scss';
import { formatNumber } from "../functions/Utils";

type Pool = {
    symbols: string[];
    dex: string;
    tvl: number | string;
    apy: number;
    feeTier: number;
};

const PoolItem = ({ symbols, dex, tvl, apy, feeTier }: Pool) => {
    const isMobile = useIsMobile(768);

    return (
        <Div className="pool-item">
            <Div className="pool-field">{symbols.join("/")}</Div>
            <Div className="pool-field">{dex}</Div>
            <Div className="pool-field">
                <Div>
                    <Div className="pool-field-item">APY</Div>
                    <Div className="pool-field-item">{formatNumber(apy)}</Div>
                </Div>
            </Div>
            <Div className="pool-field">
                <Div>
                    <Div className="pool-field-item">TVL</Div>
                    <Div className="pool-field-item">＄{formatNumber(Number(tvl))}</Div>
                </Div>
            </Div>
            {!isMobile && (
                <Div className="pool-field">
                    <Div>
                        <Div className="pool-field-item">FEE TIER</Div>
                        <Div className="pool-field-item">{feeTier}</Div>
                    </Div>
                </Div>
            )}
        </Div>
    );
};

const PoolRecommendationView = ({recommendedPools}: {recommendedPools: Pool[]}) => {
    const [sortBy, setSortBy] = useState("TVL"); // TVL 또는 APY로 정렬할 수 있는 상태

    const sortedPools = recommendedPools.sort((a:any, b:any) => {
        if (sortBy === "TVL") {
          return Number(b.tvl) - Number(a.tvl); // TVL이 높은 순으로 정렬
        } else if (sortBy === "APY") {
          return b.apy - a.apy; // APY가 높은 순으로 정렬
        } else {
          return 0; // 정렬하지 않음
        }
      });

    return (
        <Div className="pool-recommendation">
            <Div className="pool-recommendation-title">DEX 풀</Div>
            <Div className="pool-recommendation-text">
                "내 암호화폐 자산 포트폴리오에 가장 적합한 DEX 풀은 무엇인가요?"
            </Div>
            <Div className="pool-recommendation-button">
                {/* <Div className={`pool-recommendation-button-item ${sortBy === "TVL" ? "selected" : "unselected"}`} onClick={() => setSortBy("TVL")}>TVL 높은 순</Div> 
                <Div className={`pool-recommendation-button-item ${sortBy === "APY" ? "selected" : "unselected"}`} onClick={() => setSortBy("APY")}>APY 높은 순</Div> */}
                <Div className={`pool-recommendation-button-item selected`} onClick={() => setSortBy("TVL")}>TVL 높은 순</Div> 
                <Div className={`pool-recommendation-button-item unselected`}>APY 높은 순</Div>
            </Div>
            <Div className="pool-items">
                {sortedPools.slice(0, 5).map((pool, index) => ( // 정렬된 풀 배열 사용
                    <PoolItem key={index} {...pool} />
                ))}
            </Div>
        </Div>
    );
};

export { PoolRecommendationView };
