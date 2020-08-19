const namer = require('color-namer');

// Converts color to hex then gets name of color
function getColor(col) {
    var hex = "#" + parseInt(col).toString(16).toUpperCase().padStart(6, '0');
    var name = namer(hex).html[0].name;
    return name.toUpperCase();
}
module.exports.getColor = getColor;

function roundTo3Dec(num) {
    return Math.round((num) * 1000) / 1000;
}
module.exports.roundTo3Dec = roundTo3Dec;

function roundTo6Dec(num) {
    return Math.round((num) * 1000000) / 1000000;
}
module.exports.roundTo6Dec = roundTo6Dec;
