const namer = require('color-namer');

// Converts color to hex then gets name of color
function getColor(col) {
    var hex = "#" + parseInt(col).toString(16).toUpperCase().padStart(6, '0');
    var name = namer(hex).html[0].name;
    return name.toUpperCase();
}
module.exports.getColor = getColor;

function roundToNDec(num, N) {
    return Math.round((num) * Math.pow(10, N)) / Math.pow(10, N);
}
module.exports.roundToNDec = roundToNDec;