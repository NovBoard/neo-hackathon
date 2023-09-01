// balanceOfData를 n개의 작은 배열로 나누는 함수를 정의합니다.
function splitArray(array, n) {
    let result = [];
    let size = Math.ceil(array.length / n);
    for (let i = 0; i < n; i++) {
        result.push(array.slice(i * size, (i + 1) * size));
    }
    return result;
}

export { splitArray }