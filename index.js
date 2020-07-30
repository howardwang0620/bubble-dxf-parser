var express = require('express');
var bodyParser = require('body-parser');
var DxfParser = require('dxf-parser');
var fs = require('fs');
var path = require('path')
const request = require('request');
const formidable = require('formidable');
const EntityCalculation = require('./EntityUtilities/Utilities.js');

var app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())

app.get('/', (req, res) => {
	res.json("HELLO");
});


/*
	POST method for DXF file upload
	Return object data will be in following format:
	{
		layers: {
			ex_layer_1: {
				color: numerical value of color,
				colorIndex: numerical vlue of color index,
				length: sum of all lengths of given layer,
				area: sum of all areas of given layer,
			}
		},
		totLength: sum of all entity lengths,
		image: dxf file as an image,
		dimensions: [x dimension, y dimension] 
	}
*/
app.post('/upload', (req, res) => {

	//parse data incoming from form file -> may need to switch to get file
	var form = new formidable.IncomingForm();
    form.parse(req);

    //get file from form upload
    form.on('file', async (name, file) => {
        console.log('Uploaded ' + file.name);

        //receive file text to pass into dxf parser
        var fileText = fs.readFileSync(file.path, { encoding: 'utf8' });
  //       var fileUrl = "https://s3.amazonaws.com/appforest_uf/f1595895341671x835374520128248300/sample.dxf";
		// var fileText = await request.get(fileUrl, function (err, res, body) {
		//     if (err) throw new Error("can't get file url");
		//     return res.body;
		//     // return body;
		// });

        var parser = new DxfParser();
        try {
         	//parse dxf into readable object
        	var dxf = parser.parseSync(fileText);
        	// console.log(dxf.entities);
        	var totLength = 0;
        	console.log("HEADER:", dxf.header);
        	//returning object
        	var res = {
        		layers: {},
        		totLength: 0,
        		image: null,
        		dimensions: null,
        	};

        	//fill colors object using layers in table secion
        	if(dxf.tables && dxf.tables.layer && dxf.tables.layer.layers) {
        		for (const layerNum in dxf.tables.layer.layers) {
	        		var layer = dxf.tables.layer.layers[layerNum];
	        		res.layers[layer.name] = {
	        			color: layer.color ? layer.color : null,
	        			colorIndex: layer.colorIndex ? layer.colorIndex : null,
	        			length: 0,
	        			area: 0,
	        		};
	        	}
        	} else {
        		res.layers.DEFAULT = {
        			length: 0,
        			area: 0,
        		};
        	}

        	// Dimensions represented as [MIN X value, MIN Y value, MAX X value, MAX Y value]
        	let dimensions = [Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
        	for (const entityNum in dxf.entities) {
        		var entity = dxf.entities[entityNum];
        		var calcs = EntityCalculation.handleEntityCalculation(entity);
        		if(!calcs.message) {

        			//apply global, total length calculation
	        		res.totLength += calcs.length;

	        		//apply layer specific area and length calculations
	        		if(res.layers[entity.layer]) {
	        			res.layers[entity.layer].length += calcs.length;
	        			res.layers[entity.layer].area += calcs.area;
	        		} else {
	        			res.layers.DEFAULT.length += calcs.length;
	        			res.layers.DEFAULT.area += calcs.area;
	        		}

	        		//determine dimensions
	        		dimensions[0] = Math.min(dimensions[0], calcs.dimensions[0]);
					dimensions[1] = Math.min(dimensions[1], calcs.dimensions[1]);
					dimensions[2] = Math.max(dimensions[2], calcs.dimensions[2]);
					dimensions[3] = Math.max(dimensions[3], calcs.dimensions[3]);
	        	} else {
	        		console.log(`not possible for entity type: ${entity.type}\n`);

	        	}
        	}

        	res.dimensions = [dimensions[2] - dimensions[0], dimensions[3] - dimensions[1]];
        	console.log("OBJ:", res);
        } catch(err) {

        	//error reading dxf file
        	throw new Error(err.message);
        }

    });
});


 
const PORT = 1234;
app.listen(PORT, function() {
	console.log(`Listening on ${PORT}`);
});
