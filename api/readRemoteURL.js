const request = require('request');
var DxfParser = require('dxf-parser');

// const url = "https://s3.amazonaws.com/appforest_uf/f1595892674477x375947631632813440/sample.dxf";
function getBodyURL(url) {
	const options = {
		url: url,
		method: 'GET'
	};
	console.log("here we go...");
    return new Promise(function(resolve, reject) {
    	request.get(options, function(err, resp, body) {
	    	console.log("requesting...");
			if (err) {
				console.log("error .");
				reject(err);
			} else {
				console.log("success!");
				resolve(body);
			}
		});
    });
}

module.exports = { getBodyURL }