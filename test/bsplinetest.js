var bspline = require('b-spline');
// var bspline = require('./bspline.js');
var ReadRemoteURL = require('../api/readRemoteURL.js');
var DxfParser = require('dxf-parser');

const url = "https://s3.amazonaws.com/appforest_uf/f1596620245117x358143398078736800/samplespline.dxf";

ReadRemoteURL.getBodyURL(url).then(function(ret) {
    console.log("Received file, building DXF obj...");
    var parser = new DxfParser();
    try {

        var dxf = parser.parseSync(ret);
        var splineEntity = dxf.entities[0];

        const degree = splineEntity.degreeOfSplineCurve;
        const knots = splineEntity.knotValues;


        const cp = splineEntity.controlPoints;
        // var points = [];
        // for(var i = 0; i < cp.length; i++) {
        // 	var xy = [cp[i].x, cp[i].y];
        // 	points[i] = xy;
        // }

        var list = Object.keys(cp).map((key) => [cp[key].x, cp[key].y]);
        console.log(list);

    } catch(err) {
        throw new Error(err.message);
    }
});




















