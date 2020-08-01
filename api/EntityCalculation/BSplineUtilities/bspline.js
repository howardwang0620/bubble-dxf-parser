var gaussQ = require("gauss-quadrature");
var GAUSS_CONSTANTS = require('./GaussConstants.js')

module.exports = class BSpline {
	constructor(controlPoints, knotVector, order) {
		this.cp = controlPoints;
		this.knots = knotVector;
		this.order = order;
		this.spanLengths = [];
		this.totalLength = 0.0;
	}

	calcTotalLength() {
		var spanLengths = [];
		var totalLength = 0.0;
		for(var i = this.order - 1; i < this.knots.length - this.order; i++) {
			// console.log(i);
			let t0 = this.knots[i];
			let t1 = this.knots[i+1];

			let spanLength = this.gaussLegendereIntegrate(t0, t1, 32, function(t) {
				// console.log("t:", t);
				let x = this.dx(t);
				// console.log("dx: 	", x);
				let y = this.dy(t);
				// console.log("dy: 	", y);
				return Math.sqrt(x * x + y * y);
			}.bind(this));

			spanLengths.push(spanLength);
			totalLength += spanLength;
		}

		this.spanLengths = spanLengths;
		this.totalLength = totalLength;

		return totalLength;
	}


	gaussLegendereIntegrate(a, b, o, callback) {
		var result = 0;
		let wgts = GAUSS_CONSTANTS.G_WEIGHTS;
		let absc = GAUSS_CONSTANTS.G_ABSCISSA;

		for(var i = 0; i < o; i++) {
			let a0 = absc[i];
            let w0 = wgts[i];
            result += w0 * callback(0.5 * (b + a + a0 - (b - a)));
		}

		return 0.5 * (b - a) * result;
	}

	// The b-spline basis function
    basis(i, k, t) {
        var r = 0.0;
        switch (k) {
            // case 1:
            //     if((this.knots[i] <= t) && (t <= this.knots[i+1])) {
            //         return 1.0;
            //     } else {
            //         return 0.0;
            //     }
            // default:
            //     var n0 = t - this.knots[i];
            //     var d0 = this.knots[i+k-1]-this.knots[i];
            //     var b0 = this.basis(i,k-1,t);

            //     var n1 = this.knots[i+k] - t;
            //     var d1 = this.knots[i+k]-this.knots[i+1];
            //     var b1 = this.basis(i+1,k-1,t);
            case 0:
                if((this.knots[i] <= t) && (t <= this.knots[i+1])) {
                    return 1.0;
                } else {
                    return 0.0;
                }
            default:
                var n0 = t - this.knots[i];
                var d0 = this.knots[i+k]-this.knots[i];
                var b0 = this.basis(i,k-1,t);

                var n1 = this.knots[i+k+1] - t;
                var d1 = this.knots[i+k+1]-this.knots[i+1];
                var b1 = this.basis(i+1,k-1,t);

                var left = 0.0;
                var right = 0.0;
                if(b0 != 0 && d0 != 0)  left = n0 * b0 / d0;
                if(b1 != 0 && d1 != 0) right = n1 * b1 / d1;
                r = left + right;
        }
        return r;
    }

	// Derivative of the x-component
    dx(t) {
        var p = 0.0;
        let n = this.order;

        for(var i = 0; i < this.cp.length - 1; i++) {
        	let u0 = this.knots[i + n + 1];
            let u1 = this.knots[i + 1];
            let fn = n / (u0 - u1);
            let thePoint = (this.cp[i+1].x - this.cp[i].x) * fn;
            // console.log("thePoint dx: ", thePoint);
            let b = this.basis(i+1, n-1, t);
            p += thePoint * b;
        }
        return p;
    }

    // Derivative of the y-component
    dy(t) {
        var p = 0.0;
        let n = this.order;

        for(var i = 0; i < this.cp.length - 1; i++) {
        	let u0 = this.knots[i + n + 1];
            let u1 = this.knots[i + 1];
            let fn = n / (u0 - u1);
            let thePoint = (this.cp[i+1].y - this.cp[i].y) * fn;
            // console.log("thePoint dx: ", thePoint);
            let b = this.basis(i+1, n-1, t);
            p += thePoint * b;
        }
        return p;
    }
}