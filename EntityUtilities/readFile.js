const request = require('request');
var DxfParser = require('dxf-parser');

const url = "https://s3.amazonaws.com/appforest_uf/f1595892674477x375947631632813440/sample.dxf";

async function getBodyURL(url) {
	const options = {
		url: url,
		method: 'GET'
	};
    request.get(options, function(err, resp, body) {
		if (err) {
			return({status: 400, errorMessage: err.message});
		} else {
			// console.log(body);
			return {status: 200, body: body};
		}
	});
}



var fileObj = getBodyURL(url).then((res) => {
	console.log(res);
});

// if(fileObj.status == 200) {
// 	var fileText = fileObj.body;
// 	console.log(fileText);
// }
// var parser = new DxfParser();
// try {
//  	//parse dxf into readable object
// 	var dxf = parser.parseSync(fileText);
	
// } catch(err) {
// 	console.log(err.message);
// }