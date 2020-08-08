var bspline = require('b-spline');
var ReadRemoteURL = require('../api/readRemoteURL.js');
var DxfParser = require('dxf-parser');

// const url = "https://s3.amazonaws.com/appforest_uf/f1596627464154x637024880018178300/3x3in%20control%20point%20curve.dxf";
// const url = "https://s3.amazonaws.com/appforest_uf/f1596627649487x291498755888382340/spline.dxf";
// const url = "https://s3.amazonaws.com/appforest_uf/f1596627764676x456284127070629950/closed-spline.dxf";

// ReadRemoteURL.getBodyURL(url).then(function(ret) {
//     console.log("Received file, building DXF obj...");
//     var parser = new DxfParser();
//     try {

//         var dxf = parser.parseSync(ret);
//         var entity = dxf.entities[0];

//         console.log(entity.closed == true);

//         const degree = entity.degreeOfSplineCurve;
//         const knots = entity.knotValues;


//         const cp = entity.controlPoints;
//         // var points = [];
//         // for(var i = 0; i < cp.length; i++) {
//         // 	var xy = [cp[i].x, cp[i].y];
//         // 	points[i] = xy;
//         // }

//         var points = Object.keys(cp).map((key) => [cp[key].x, cp[key].y]);
//         var length = 0;
//         var area = 0;
//         var lastPoint;
//         for(var t = 0; t < 1; t += 0.0001) {
//             var point = bspline(t, degree, points, knots);

//             if(lastPoint) {
//                 const x1 = lastPoint[0];
//                 const y1 = lastPoint[1];

//                 const x2 = point[0];
//                 const y2 = point[1];

//                 length += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
//                 if(entity.closed) area += Math.abs(x1 * y2) - Math.abs(x2 * y1);
//             }

//             if(entity.closed) lastPoint = point;
//         }

//         area = Math.abs(area) / 2;

//         console.log(area);
//         console.log(length);

//     } catch(err) {
//         throw new Error(err.message);
//     }
// });
















