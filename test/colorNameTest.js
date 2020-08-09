var namer = require('color-namer');


var color = 4980736;

var hex = "#" + color.toString(16).toUpperCase().padStart(6, '0');

console.log(namer(hex).html[0]);
