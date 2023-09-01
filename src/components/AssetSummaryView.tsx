import React, { useEffect, useState } from "react";
import '../styles/Dashboard.scss';
import Chart from "chart.js/auto";
import { Bar } from 'react-chartjs-2';
import { registerables, Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Div } from "./Common";
import { useLocation } from "react-router-dom";
import historyAPI from "../api/historyAPI";
import { formatNumber } from "../functions/Utils";
import { getExchangeRate } from "../functions/GetExchangeRate";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, ...registerables);
ChartJS.register(ChartDataLabels);

const AssetWorth = ({totalValue}: {totalValue: number}) => {
    const loc = useLocation();
    const state = loc.state;
    const credential = state.credential;
    const [rate, setRate] = useState(0);

    useEffect(() => {
        const getInitialState = async () => {
            const yesterdayValue = await historyAPI.post("/get-yesterday-value", {credential}).then(res => res.data);
            const exchangeRate = await getExchangeRate();
            const yesterdayTotalValue = yesterdayValue * exchangeRate;

            if(yesterdayValue === 0) {
                setRate(0);
                return;
            } else{
                const rate = (totalValue - yesterdayTotalValue) / yesterdayTotalValue * 100;
                setRate(rate);
            }
        }

        getInitialState();
    }, [totalValue]);

    return (
        <Div className="total-worth">
            <Div className="total-worth-title">자산 가치</Div>
            <Div className="total-worth-value">
                <Div className="total-worth-amount">₩ {formatNumber(totalValue)}</Div>
                {rate >= 0 ? <Div className="total-worth-change" style={{"color": "#3C89E8"}}>+ {rate.toFixed(2)}%</Div> : <Div className="total-worth-change" style={{"color": "#F00"}}>- {Math.abs(rate).toFixed(2)}%</Div>}
            </Div>
        </Div>
    )
}

const TotalAssets = ({totalValue}: {totalValue: number}) => {
    type AssetItemProps = {
        label: string;
        value: string;
      };
      
      const AssetItem = ({ label, value }: AssetItemProps) => {
        return (
            <Div className="asset-item">
                <Div className="asset-label">{label}</Div>
                <Div className="asset-value">{value}</Div>
            </Div>
        );
      };

      
    return(
        <Div className="total-assets">
            <AssetItem label="클레임 가능 자산" value="N/A" />
            <AssetItem label="총 자산" value={`₩ ${formatNumber(totalValue)}`} />
            <AssetItem label="총 부채" value="N/A" />
        </Div>
    )
}

const BarChart = ({tokenRatio, poolRatio}: {tokenRatio: number, poolRatio: number}) => {
    const data = [
        { type: "지갑 자산", value: tokenRatio },
        { type: "풀 자산", value: poolRatio },
    ];

    // chartData의 datasets 옵션 수정
    const chartData = {
        labels: ["자산 비율"], // 라벨을 하나만 사용
        datasets: [
            {
                label: data[0].type, // 첫 번째 데이터셋의 라벨
                data: [data[0].value], // 첫 번째 데이터셋의 값
                backgroundColor: '#15417E', // 첫 번째 데이터셋의 색상
            },
            {
                label: data[1].type, // 두 번째 데이터셋의 라벨
                data: [data[1].value], // 두 번째 데이터셋의 값
                backgroundColor: '#3C89E8', // 두 번째 데이터셋의 색상
            }
        ]
    };

    const chartOptions: any = {
        indexAxis: 'y',
        scales: {
            x: {
                stacked: true,
                ticks: {
                    display: false,
                }
            },
            y: {
                stacked: true,
                ticks: {
                    display: false,
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                align: 'start',
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: (context: any) => `${context.dataset.label}: ${context.parsed.x}%`
                }
            },
            datalabels: {
                anchor: 'start',
                align: 'start',
                offset: -50,
                color: '#fff',
                formatter: (value: Number) => `${value}%`
            }
        },
        maintainAspectRatio: false,
    };

    return (
        <Div className="bar-chart">
            <Bar
                data={chartData}
                options={chartOptions}
                height={100}
            />
        </Div>
    );
};

const AssetSummaryView = ({totalTokenValue, totalPoolValue}: {totalTokenValue: number, totalPoolValue: number}) => {
    const totalValue = totalTokenValue + totalPoolValue;
    const tokenRatio = Math.round(totalTokenValue / totalValue * 100);
    const poolRatio = Math.round(totalPoolValue / totalValue * 100);

    return (
        <Div className='asset-summary'>
            <AssetWorth totalValue = {totalValue}/>
            <TotalAssets totalValue = {totalValue}/>
            <BarChart tokenRatio={tokenRatio} poolRatio={poolRatio}/>
        </Div>
    )
}

export { AssetWorth, AssetSummaryView }
