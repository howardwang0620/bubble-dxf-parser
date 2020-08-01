const request = require('request');
var DxfParser = require('dxf-parser');

// const url = "https://s3.amazonaws.com/appforest_uf/f1595892674477x375947631632813440/sample.dxf";
function getBodyURL(url) {
	const options = {
		url: url,
		method: 'GET'
	};
	console.log("INIT...");
    return new Promise(function(resolve, reject) {
    	request.get(options, function(err, resp, body) {
	    	console.log("Requesting URL...");
			if (err) {
				console.log("Error requesting URL");
				reject(err);
			} else {
				console.log("Success! URL body gathered");
				resolve(body);
			}
		});
    });
}

module.exports = { getBodyURL }