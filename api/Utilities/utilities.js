const namer = require('color-namer');

// Converts color to hex
function getHex(col) {
    return "#" + parseInt(col).toString(16).toUpperCase().padStart(6, '0');
}
module.exports.getHex = getHex;

// Gets name of color
function getColor(col) {
    var hex = getHex(col)
    var name = namer(hex).html[0].name;
    return name.toUpperCase();
}
module.exports.getColor = getColor;

function roundToNDec(num, N) {
    return Math.round((num) * Math.pow(10, N)) / Math.pow(10, N);
}
module.exports.roundToNDec = roundToNDec;