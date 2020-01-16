const zeroFormat = require('./zeroFormat');
module.exports = function(dateObj) {
    return `${dateObj.getYear() + 1900}.${zeroFormat(dateObj.getMonth() + 1, 2)}.${zeroFormat(dateObj.getDate(),2)} ${zeroFormat(dateObj.getHours(),2)}:${zeroFormat(dateObj.getMinutes(),2)}`
}