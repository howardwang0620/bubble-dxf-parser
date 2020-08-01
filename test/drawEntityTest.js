var ReadRemoteURL = require('../api/readRemoteURL.js');
var DrawDXF = require('../api/DXFImageConversion/three-dxf-node.js');
var DxfParser = require('dxf-parser');


const url = "https://s3.amazonaws.com/appforest_uf/f1595892674477x375947631632813440/sample.dxf";
ReadRemoteURL.getBodyURL(url).then(function(ret) {

    var parser = new DxfParser();
    try {
     	//parse dxf into readable object
    	var dxf = parser.parseSync(ret);
    	DrawDXF.drawDXF(dxf, 400, 400);

    } catch(err) {
    	console.log(err);
    }
});