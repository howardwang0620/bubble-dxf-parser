var namer = require('color-namer');
var hexnamer = require('hex-to-color-name');


var color = 255;

var hex = "#" + color.toString(16).toUpperCase().padStart(6, '0');

console.log(namer(hex).html[0]);

console.log(hexnamer(hex));