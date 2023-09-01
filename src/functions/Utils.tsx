const calculateTotalValue = (data: any) => {
    const totalTokenValue = data.totalTokens.reduce((total: any, token: any) => total + token.value, 0);
    const totalPoolValue = data.totalPools.reduce((total: any, pool: any) => total + pool.value, 0);

    return {
        totalTokenValue,
        totalPoolValue,
    };
}

const getFormattedDateBefore = (i: number) => {
    // Date 객체 생성
    let today = new Date();

    // 하루 전의 시간을 밀리초 단위로 계산
    let day = new Date(today.getTime() - 24 * i * 60 * 60 * 1000);

    // 연도, 월, 일을 각각 추출
    let year = day.getFullYear();
    let month = day.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줌
    let date = day.getDate();

    let monthString = month.toString();
    let dateString = date.toString();

    // 월과 일이 한 자리수면 앞에 0을 붙여줌
    if (month < 10) {
        monthString = '0' + month;
    }

    if (date < 10) {
        dateString = '0' + date;
    }

    // 연도-월-일 형식의 문자열 생성
    let formattedDate = year + '.' + monthString + '.' + dateString;

    // 문자열 반환
    return formattedDate;
}

const processTokenData = (data: any) => {
    // value를 기준으로 내림차순으로 정렬합니다.
    data.sort((a: any, b: any) => b.value - a.value);

    // value가 가장 큰 5개 요소와 나머지 요소를 추출합니다.
    const top5 = data.slice(0, 5);
    const rest = data.slice(5);

    // "기타" 요소를 만듭니다.
    const others = {
        symbol: "기타",
        value: rest.reduce((total: any, item: any) => total + item.value, 0)
    };

    // 최종 결과 리스트를 생성합니다.
    const resultList = [...top5, others];

    return resultList;
}

const processDexData = (data: any) => {
    const groupedData: Record<string, number> = {};

    data.forEach((item: any) => {
        if (!groupedData[item.dex]) {
            groupedData[item.dex] = 0;
        }
        groupedData[item.dex] += item.value;
    });

    const sortedGroups: [string, number][] = Object.entries(groupedData)
        .sort((a, b) => b[1] - a[1]);

    const top5Groups: [string, number][] = sortedGroups.slice(0, 5);
    const restGroups: [string, number][] = sortedGroups.slice(5);

    const othersDex = "기타";
    const othersValue = restGroups.reduce((total, [, value]) => total + value, 0);

    const resultList = top5Groups.map(([dex, value]) => ({ dex, value }));
    resultList.push({ dex: othersDex, value: othersValue });

    return resultList;
}

const getPreviousDay = (dateString: string) => {
    // 입력된 문자열을 Date 객체로 변환
    let date = new Date(dateString.split(".").join("-"));

    // 날짜를 1만큼 감소시킴
    date.setDate(date.getDate() - 1);

    // 연도, 월, 날짜를 각각 얻음
    let year = date.getFullYear();
    let month: string | number = date.getMonth() + 1;
    let day: string | number = date.getDate();

    // 월과 날짜가 한 자리수인 경우에는 앞에 0을 붙여줌
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }

    // 문자열들을 "."으로 연결하여 결과를 만듦
    let result = year + "." + month + "." + day;

    // 결과를 반환함
    return result;
}

const formatNumber = (input: number) => {
    // Check if input is a valid number
    if (isNaN(input)) {
        return "NaN";
    }
    // Check if input is less than 0.01
    if (input == 0) {
        return "0";
    }
    // Check if input is zero
    else if (Math.abs(input) < 0.01) {
        return "< 0.01";
    }
    // Check if input is negative
    var negative = false;
    if (input < 0) {
        negative = true;
        input = Math.abs(input);
    }
    // Define the units and their powers
    var units = ["", "만", "억", "조", "경", "해", "자", "양", "구", "간", "정", "재", "극", "항"];
    var powers = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36];
    // Find the highest unit that fits the input
    var index = powers.length - 1;
    while (index > 0 && Math.pow(10, powers[index]) > input) {
        index--;
    }
    // Check if input is too large
    if (index == powers.length - 1) {
        return "Too large";
    }
    // Divide the input by the unit's power and round to two decimal places
    var output = (input / Math.pow(10, powers[index])).toFixed(2);
    // Remove trailing zeros and decimal point if possible
    output = output.replace(/\.?0+$/, "");
    // Append the unit's symbol and return the output
    output += units[index];
    // Add a minus sign if input was negative
    if (negative) {
        output = "-" + output;
    }
    return output;
}


export { calculateTotalValue, getFormattedDateBefore, processTokenData, processDexData, getPreviousDay, formatNumber };