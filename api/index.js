var express = require('express');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var validUrl = require('valid-url');
var helmet = require('helmet');
var fs = require('fs');
var path = require('path');
var cors = require('cors');

// Middleware for reading and parsing DXF file
var DxfParser = require('dxf-parser');
var { getBodyURL } = require('./readRemoteURL.js');
var { parseDXF } = require('./DXFProcessor/parseDXF.js');

var app = express();
app.use(express.static(path.join(path.resolve('./'), 'public')));
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(helmet());


// Receives remote url as body and parses DXF file and returns DXF object
app.post('/remoteurl', (req, res) => {
    console.log("API Call Starting...");

    // JSON payload
    var obj = {
        x_extents: "",
        y_extents: "",
        included_colors: {
            total_length: 0,
            colors: [],
        },
        excluded_colors: {
            total_length: 0,
            colors: [],
        },
        image: "",
        unsupported_types: "none",
        missing_colors: "none",
        message: "",
    };

    const url = req.body.url;
    if(url && validUrl.isHttpsUri(url)) {
        getBodyURL(url).then(function(ret) {
            console.log("Received file, building DXF obj...");

            var { dxf, included} = req.body;

            // Units deprecated
            // unit = (!unit || unit.trim() == "") ? "" : unit;
            included = (!included || included == 'null' || included.trim() == "") ? null : included;

            var parser = new DxfParser();
            try {

                dxf = parser.parseSync(ret);
                const dxfObj = parseDXF(dxf, obj, included);

                // console.log("Returning DXF Object:", dxfObj);
                console.log("Successfully parsed DXF! Sending obj...");
                res.json(dxfObj);
            } catch(err) {

                // Somehow an error reading and parsing DXF
                console.log("Error reading DXF obj:", err.message);
                obj.included_colors.colors.push({
                    name: "None",
                    length: 0,
                    area: 0
                });
                obj.excluded_colors.colors.push({
                    name: "None",
                    length: 0,
                    area: 0
                });
                obj.message = "Error reading DXF object: " + err.message;
                res.json(obj);
            }
        });
    } else {
        // If no file is supplied
        console.log("Error: File/URL Invalid");
        obj.included_colors.colors.push({
            name: "None",
            length: 0,
            area: 0
        });
        obj.excluded_colors.colors.push({
            name: "None",
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
*/
app.post('/upload', (req, res) => {

    console.log(req.body);
    // parse data incoming from form file -> may need to switch to get file
    var form = new formidable.IncomingForm();
    form.parse(req);

    var obj = {
        x_extents: "",
        y_extents: "",
        included_colors: {
            total_length: 0,
            colors: [],
        },
        excluded_colors: {
            total_length: 0,
            colors: [],
        },
        image: "",
        unsupported_types: [],
        missing_colors: [],
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

            // parse dxf object
            const dxfObj = parseDXF(dxf, obj, null);
            // console.log("PARSED DXF:", dxfObj);
            res.status(200).send(dxfObj);

        } catch(err) {
            console.log(err);
            obj.included_colors.colors.push({
                name: "None",
                length: 0,
                area: 0
            });
            obj.excluded_colors.colors.push({
                name: "None",
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
