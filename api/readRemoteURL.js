const request = require('request');

// Read url from remote location and sends body
module.exports.getBodyURL = function getBodyURL(url) {
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
};
