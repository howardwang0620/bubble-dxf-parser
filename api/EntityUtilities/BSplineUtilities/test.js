const gaussQ = require("gauss-quadrature");
const BSpline = require('./bspline.js')

// Method to calculate and store the knot vector
 function calcKnots(o) {

    // The number of knots in the knot vector = number of control points + order (i.e. degree + 1)
    let knotCount = cp.length + o;
    let knots = [];

    // For an open b-spline where the ends are incident on the first and last control points,
    // the first o knots are the same and the last o knots are the same, where o is the order
    // of the curve.
    var k = 0;
    for(let i = 0; i < o; i++) {
    	knots.push(0.0);
    }

    for(let i = o; i < cp.length; i++) {
    	k++;
    	knots.push(k);
    }
    k++;
    for(let i = cp.length; i < knotCount; i++) {
    	knots.push(k);
    }

    return knots;
}

// console.log(gaussQ(3));

// let cp = [
//     {x: -2.0, y: -1.0},
//     {x: -1.0, y: 1.0},
//     {x: -0.25, y: 1.0},
//     {x: 0.25, y: -1.0},
//     {x: 1.0, y: -1.0},
//     {x: 2.0, y: 1.0}
// ];
// let knots = calcKnots(4);
let knots = [
  0,
  0,
  0,
  0,
  6.910715016505838,
  12.31702626854546,
  18.71697660077794,
  18.71697660077794,
  18.71697660077794,
  18.71697660077794
];
let cp = [
  { x: 15.85800112038426, y: 15.40844783741257, z: 0 },
  { x: 17.27820792628184, y: 12.31951779689738, z: 0 },
  { x: 19.80945461974659, y: 6.814091461148735, z: 0 },
  { x: 23.93244209132767, y: 17.13451038751724, z: 0 },
  { x: 26.35407964993021, y: 11.94366076131157, z: 0 },
  { x: 27.66680340986886, y: 9.129799696767655, z: 0 }
];

var bspline = new BSpline(cp, knots, 4);
bspline.calcTotalLength();
console.log(bspline.calcTotalLength());


// console.log(gaussQ(32));