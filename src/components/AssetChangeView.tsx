import React, { useEffect, useState } from "react";
import '../styles/Dashboard.scss';
import Chart from "chart.js/auto";
import { Line } from 'react-chartjs-2';
import { registerables, Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation'; // annotation 플러그인 import
import { Div } from "./Common";
import historyAPI from "../api/historyAPI";
import { useLocation } from "react-router-dom";
import { formatNumber, getFormattedDateBefore } from "../functions/Utils";
import { getExchangeRate } from "../functions/GetExchangeRate";

ChartJS.register(...registerables); // 차트.js에 필요한 요소들 등록
ChartJS.register(annotationPlugin); // 차트.js에 annotation 플러그인 등록

const AssetChangeText = ({totalValue}: {totalValue: number}) => {
    const loc = useLocation();
    const state = loc.state;
    const credential = state.credential;
    const [changeValue, setChangeValue] = useState(0);

    useEffect(() => {
        const getInitialState = async () => {
            const exchangeRate = await getExchangeRate();
            const yesterdayValue = await historyAPI.post("/get-yesterday-value", {credential}).then(res => res.data);
            const yesterdayTotalValue = yesterdayValue * exchangeRate;
            const changeValue = totalValue - yesterdayTotalValue;
            setChangeValue(changeValue);
        }

        getInitialState();
    }, [totalValue]);

    return(
        <Div className="asset-change-text">
            <Div className="asset-change-title">자산 가치 변동</Div>
            {changeValue >= 0 ? <Div className="asset-change-value" style={{"color": "#3C89E8"}}>+ ₩ {formatNumber(changeValue)}</Div> : <Div className="asset-change-value" style={{"color": "#F00"}}>- ₩ {formatNumber(Math.abs(changeValue))}</Div>}
        </Div>
    )
}

const LineChart = ({totalValue}: {totalValue: number}) => {
    const loc = useLocation();
    const state = loc.state;
    const credential = state.credential;

    const [labels, setLabels] = useState([] as any);
    const [values, setValues] = useState([] as number[]);

    useEffect(() => {
        const getInitialState = async () => {
            const weekResponse = await historyAPI.post('/get-week-value', {credential});
            const weekData = weekResponse.data;
            const exchangeRate = await getExchangeRate();
            
            const labels = weekData.map((data: any) => data.date);
            const values = weekData.map((data: any) => data.totalValue * exchangeRate);

            labels.push(getFormattedDateBefore(0));
            values.push(totalValue);

            setLabels(labels);
            setValues(values);
        }

        getInitialState();
    }, [totalValue]);

    const data = {
        labels: labels,
        datasets: [
            {
                backgroundColor: "rgba(91,143,249,0.25)",
                fill: "start",
                borderColor: "#5B8FF9",
                data: values,
            },
        ],
    };

    const createHorizontalLines = (min: number, max: number, step: number) => {
        let lines = [];
        for (let i = min; i <= max; i += step) {
            lines.push({
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y',
                value: i,
                borderColor: '#424242',
                borderWidth: 1,
            });
        }
        return lines;
    };

    const options: any = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            datalabels: {
                display: false,
            },
            annotation: {
                // annotations: createHorizontalLines(0, 70, 10),           
            },
        },
        scales: {
            x: {
                offset: true,
            },
            y: {
                ticks: {
                    callback: function(value: number) {
                        return formatNumber(value); // use the imported function
                    }
                }
            }
    
        },
        maintainAspectRatio: false,
    };

    return (
        <Div className="line-chart">
            <Line data={data} options={options} height={300} />
        </Div>
    );
};

const AssetChangeView = ({totalValue}: {totalValue: number}) => {
    return (
        <Div className="asset-change">
            <AssetChangeText totalValue={totalValue}/>
            <LineChart totalValue={totalValue}/>
        </Div>
    )
}

export default AssetChangeView;
