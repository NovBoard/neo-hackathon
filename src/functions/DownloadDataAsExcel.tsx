import * as XLSX from 'xlsx';
import { getPreviousDay } from './Utils';
import { getExchangeRate } from './GetExchangeRate';

async function downloadDataAsExcel(data: any) {
    let sheetData = [];

    let headerRow = [
        "날짜(KST)",
        "종류",
        "가상화폐명",
        "수량",
        "현재 가격",
        "평가 금액",
        "일간 P&L",
        "일간 수익률",
    ];

    // Push the header row into the sheet data array
    sheetData.push(headerRow);

    const exchangeRate = await getExchangeRate();

    // Loop over the data array and extract the values for each row
    for (let i = 0; i < data.length; i++) {
        let date = data[i].date;
        let totalValue = data[i].totalValue;
        let totalTokens = data[i].totalTokens;
        let totalPools = data[i].totalPools;

        let yesterdayValue;
        let yesterdayTokens;
        let yesterdayPools;
        if(i === data.length - 1) {
            yesterdayValue = 0;
            yesterdayTokens = [];
            yesterdayPools = [];
        } else{
            if(data[i+1].date === getPreviousDay(data[i].date)) {
                yesterdayValue = data[i+1].totalValue;
                yesterdayTokens = data[i+1].totalTokens;
                yesterdayPools = data[i+1].totalPools;
            } else{
                yesterdayValue = 0;
                yesterdayTokens = [];
                yesterdayPools = [];
            }
        }

        let dailyPL, dailyReturn;
        if(yesterdayValue === 0){
            dailyPL = totalValue;
            dailyReturn = 0;
        } else{
            dailyPL = totalValue - yesterdayValue;
            dailyReturn = dailyPL / yesterdayValue * 100;
        }

        let totalRow = [
            date + "11:59 PM",
            "Total",
            "",
            "",
            "",
            totalValue * exchangeRate,
            dailyPL * exchangeRate,
            dailyReturn,
        ];

        sheetData.push(totalRow);

        // Loop over the total tokens array and create a row for each token
        for (let j = 0; j < totalTokens.length; j++) {
            let token = totalTokens[j];
            let yesterdayTokenValue = yesterdayTokens.find((yesterdayToken: any) => yesterdayToken.symbol === token.symbol)?.value;
            let tokenDailyPL, tokenDailyReturn;
            if(yesterdayTokenValue === undefined){
                tokenDailyPL = token.value;
                tokenDailyReturn = 0;
            } else{
                tokenDailyPL = token.value - yesterdayTokenValue;
                tokenDailyReturn = tokenDailyPL / yesterdayTokenValue * 100;
            }

            let tokenRow = [
                "",
                "Token",
                token.symbol,
                token.amount,
                token.price * exchangeRate,
                token.value * exchangeRate,
                tokenDailyPL * exchangeRate,
                tokenDailyReturn,
            ];

            sheetData.push(tokenRow);
        }

        // Loop over the total pools array and create a row for each pool
        for (let k = 0; k < totalPools.length; k++) {
            let pool = totalPools[k];
            let yesterdayPoolValue = yesterdayPools.find((yesterdayPool: any) => yesterdayPool.symbols.join("/") === pool.symbols.join("/") && yesterdayPool.dex === pool.dex)?.value;
            let poolDailyPL, poolDailyReturn;
            if(yesterdayPoolValue === undefined){
                poolDailyPL = pool.value;
                poolDailyReturn = 0;
            } else{
                poolDailyPL = pool.value - yesterdayPoolValue;
                poolDailyReturn = poolDailyPL / yesterdayPoolValue * 100;
            }

            let poolRow = [
                "",
                "Pool",
                pool.symbols.join("/"),
                pool.amounts.join("/"),
                pool.dex,
                pool.value * exchangeRate,
                poolDailyPL * exchangeRate,
                poolDailyReturn,
            ];

            sheetData.push(poolRow);
        }
    }

    // Create a new workbook object
    let workbook = XLSX.utils.book_new();

    // Create a new worksheet object from the sheet data array
    let worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate a file name for the excel file
    let fileName = 'data.xlsx';

    // Write the workbook to a binary string
    let binaryString = XLSX.write(workbook, {bookType:'xlsx', type:'binary'});

    // Convert the binary string to a blob object
    let blob = new Blob([s2ab(binaryString)], {type: 'application/octet-stream'});

    // Create a URL from the blob object
    let url = URL.createObjectURL(blob);

    // Create a new anchor element
    let anchor = document.createElement('a');

    // Set the href attribute of the anchor element to the URL
    anchor.href = url;

    // Set the download attribute of the anchor element to the file name
    anchor.download = fileName;

    // Append the anchor element to the document body
    document.body.appendChild(anchor);

    // Simulate a click on the anchor element
    anchor.click();

    // Remove the anchor element from the document body
    document.body.removeChild(anchor);

}

// Helper function to convert a binary string to an array buffer
function s2ab(s: string) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i=0; i<s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

export { downloadDataAsExcel };