var express = require('express');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var helmet = require('helmet');
var fs = require('fs');
var path = require('path');
var cors = require('cors');

var ReadRemoteURL = require('./readRemoteURL.js');
var DXFParser = require('./parseDXF.js');

var app = express();

app.use(express.static(path.join(path.resolve('./'), 'public')));
app.use(cors())
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(helmet());

app.get('/', (req, res) => {
    console.log(path.join(path.resolve('./'), 'public'));
	res.json("HELLO");
});

//receives remote url as body and parses DXF file
app.post('/remoteurl', (req, res) => {
	console.log(req.body.url);
    const url = req.body.url;
    ReadRemoteURL.getBodyURL(url).then(function(ret) {
        console.log("FINISHED GRABBING FILE");
        const dxfObj = DXFParser.parseDXF(ret);
        console.log(dxfObj);
        console.log("sending obj...");
        res.json(dxfObj);
    });
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
		extents: [x extent, y extent] 
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
        const dxfObj = DXFParser.parseDXF(ret);
        res.send(dxfObj);

    });
});

 
const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
	console.log(`Listening on ${PORT}`);
});
