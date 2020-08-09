var express = require('express');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var validUrl = require('valid-url');
var helmet = require('helmet');
var fs = require('fs');
var path = require('path');
var cors = require('cors');

//Middleware for reading and parsing DXF file
var DxfParser = require('dxf-parser');
var ReadRemoteURL = require('./readRemoteURL.js');
var DXFParser = require('./parseDXF.js');
var bspline = require('b-spline');

var app = express();
app.use(express.static(path.join(path.resolve('./'), 'public')));
// app.use(express.static('../public'));
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(helmet());


// Receives remote url as body and parses DXF file and returns DXF object
app.post('/remoteurl', (req, res) => {
    console.log("************DXF CALL************");

    // JSON payload
    var obj = {
        layers: [],
        totLength: 0,
        image: "",
        extents: "",
        errors: [],
        message: "",
    };

    const url = req.body.url;
    if(url && validUrl.isHttpsUri(url)) {
        ReadRemoteURL.getBodyURL(url).then(function(ret) {
            console.log("Received file, building DXF obj...");
            const unit = (!req.body.unit || req.body.unit == "") ? "" : req.body.unit;
            var parser = new DxfParser();
            try {
                var dxf = parser.parseSync(ret);
                const dxfObj = DXFParser.parseDXF(dxf, unit, obj);

                console.log("Returning DXF Object:", dxfObj);
                console.log("Sending obj...");
                res.json(dxfObj);
            } catch(err) {

                //Somehow an error reading and parsing DXF
                console.log("Error reading DXF obj");
                obj.layers.push({
                    name: "Empty",
                    length: 0,
                    area: 0
                });
                obj.message = "Error reading DXF object";
                // throw new Error(err.message);
                res.json(obj);
            }
        });
    } else {

        // If no file is supplied
        obj.layers.push({
            name: "Empty",
            length: 0,
            area: 0
        });
        obj.message = "File/URL Invalid";

        res.json(obj);
    }
});

/*
    (TESTING ROUTE)
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
		extents: [x extent, y extent] 
	}
*/
app.post('/upload', (req, res) => {

	//parse data incoming from form file -> may need to switch to get file
	var form = new formidable.IncomingForm();
    form.parse(req);

    var obj = {
        layers: [],
        totLength: 0,
        image: "",
        extents: "",
        errors: [],
        message: "",
    };

    // Get file from form upload
    form.on('file', async (name, file) => {
        console.log('Uploaded ' + file.name);

        // Receive file text to pass into dxf parser
        var fileText = fs.readFileSync(file.path, { encoding: 'utf8' });
        var parser = new DxfParser();
        try {
            var dxf = parser.parseSync(fileText);

            //parse dxf object
            const dxfObj = DXFParser.parseDXF(dxf, null, obj);
            // console.log(dxfObj);
            res.status(200).send(dxfObj);

        } catch(err) {
            console.log(err);
            obj.layers.push({
                name: "Empty",
                length: 0,
                area: 0
            });
            obj.message = "Error reading DXF object";

            res.status(422).json(obj);
            throw new Error("error parsing DXF File:" + err.message);
        }

    });
});

 
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
	console.log(`Listening on ${PORT}`);
});
