const request = require('request');
const namer = require('color-namer');

// reads file from remote url
function getBodyURL(url) {
    const options = {
        url: url,
        method: 'GET'
    };
    return new Promise(function(resolve, reject) {
        request.get(options, function(err, resp, body) {
            console.log("Requesting URL...");
            if(err) {
                console.log("Error requesting URL");
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
};
module.exports.getBodyURL = getBodyURL;

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