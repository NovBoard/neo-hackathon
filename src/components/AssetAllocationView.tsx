import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Div, useIsMobile } from './Common';

type Token = {
    symbol: string;
    amount: number;
    price: number;
    value: number;
}

type Pool = {
    dex: string;
    value: number;
}

type Asset = {
    tokens: Token[],
    pools: Pool[],
}

type AssetAllocationItemProps = {
    title: string,
    asset: any,
};

const StackedDoughnutChart = ({asset}: any) => {
    let sum = 0;
    let labels: string[] = [];
    let values: number[] = [];

    asset.forEach((item: any) => {
        sum += item.value;
    });

    if(sum === 0){
        labels = ['자산이 없습니다.'];
        values = [100];
    } else{
        asset.forEach((item: any) => {
            if(item.symbol === undefined) labels.push(item.dex);
            else labels.push(item.symbol);
    
            values.push(Math.round(item.value / sum * 100));
        });
    }

    const data = {
        labels: labels,
        datasets: [
            {
                data: values,
                backgroundColor: ["#1668DC", "#15417E", "#65A9F3", "#301C4D", "#642AB5", "#854ECA"],
                borderWidth: 0,
            },
        ],
    };

    const options: any = {
        cutout: '65%',
        rotation: -0.5 * Math.PI,
        plugins: {
            legend: {
                display: true,
                position: "right",
                labels: {
                    padding: 20,
                },
            },
            tooltips: {
                enabled: true,
            },
            datalabels: {
                color: '#fff',
                formatter: (value: Number) => `${value}%`
            }
        },
        maintainAspectRatio: false,
    };


    return (
        <Div className='stacked-doughnut-chart'>
            <Doughnut data={data} options={options} height={300} />
        </Div>
    )
};

const AssetAllocationItem = ({ title, asset }: AssetAllocationItemProps) => {
    return (
        <Div className='asset-allocation-item'>
            <Div className='asset-allocation-title'>{title}</Div>
            <StackedDoughnutChart asset={asset}/>
        </Div>
    )
}

const AssetAllocationView = ({tokens, pools}: Asset) => {
    const isMobile = useIsMobile(768);

    // Render the slider based on the slider mode
    return (
        <Div className="asset-allocation">
            {isMobile ? (
                <Carousel
                    showStatus={false}
                    showIndicators={false}
                    infiniteLoop={true}
                >
                    <AssetAllocationItem title="토큰 할당" asset={tokens}/>
                    <AssetAllocationItem title="프로토콜 할당" asset={pools}/>
                </Carousel>
            ) : (
                <>
                    <AssetAllocationItem title="토큰 할당" asset={tokens}/>
                    <AssetAllocationItem title="프로토콜 할당" asset={pools}/>
                </>
            )}
        </Div>
    );
};


export { AssetAllocationView };
