module.exports = function(number, formatSize) {
    let returnValue = '';
    for(let i = 1; i < formatSize; i++) {
        if(Math.floor(number / (10 ** i)) === 0) {
            returnValue += '0';
        }
    }
    return returnValue + number;
}