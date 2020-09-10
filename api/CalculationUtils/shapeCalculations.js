var bspline = require('b-spline');

module.exports.lineCalculation = function lineCalculation(entity, dims) {
	const x1 = entity.vertices[0].x;
	const y1 = entity.vertices[0].y;

	const x2 = entity.vertices[1].x;
	const y2 = entity.vertices[1].y;

	var length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	var area = Math.abs(x1 * y2) - Math.abs(x2 * y1);

	// handle dimensions for coordinate1
	dims.min_x = Math.min(x1, dims.min_x);
	dims.max_x = Math.max(x1, dims.max_x);
	dims.min_y = Math.min(y1, dims.min_y);
	dims.max_y = Math.max(y1, dims.max_y);

	// handle dimensions for coordinate2
	dims.min_x = Math.min(x2, dims.min_x);
	dims.max_x = Math.max(x2, dims.max_x);
	dims.min_y = Math.min(y2, dims.min_y);
	dims.max_y = Math.max(y2, dims.max_y);

	return {
		length: length,
		area: area
	};
};

// DOES NOT HANDLE AREA FOR COMPLEX POLYGONS
// Calculates length and area of polylines
// Area calculated using Coordinate Geometry
module.exports.polyLineCalculation = function polyLineCalculation(entity, dims) {

	//handle length and area calculations
	var length = 0;
	var area = 0;
	var vt = entity.vertices;
	for(var i = 0; i < vt.length - 1; i++) {
		const x1 = vt[i].x;
		const y1 = vt[i].y;

		const x2 = vt[i + 1].x;
		const y2 = vt[i + 1].y;

		// calculating length of polygon
		length += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

		// handle area
		area += Math.abs(x1 * y2) - Math.abs(x2 * y1);

		// handle dimensions
		dims.min_x = Math.min(x1, dims.min_x);
		dims.max_x = Math.max(x1, dims.max_x);
		dims.min_y = Math.min(y1, dims.min_y);
		dims.max_y = Math.max(y1, dims.max_y);
	}

	// handle dimensions for last coordinate
	dims.min_x = Math.min(vt[vt.length - 1].x, dims.min_x);
	dims.max_x = Math.max(vt[vt.length - 1].x, dims.max_x);
	dims.min_y = Math.min(vt[vt.length - 1].y, dims.min_y);
	dims.max_y = Math.max(vt[vt.length - 1].y, dims.max_y);

	//make last calculation if first point and last points don't match
	//get length and area distance from last to first point
	if(entity.shape) {
		const x1 = vt[vt.length - 1].x;
		const y1 = vt[vt.length - 1].y;

		const x2 = vt[0].x;
		const y2 = vt[0].y;

		length += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		area += Math.abs(x1 * y2) - Math.abs(x2 * y1);
	}

	// return object
	return {
		length: length,
		area: area,
	};
};

// Uses b-spline library to get interpolation of points
// Length and area calculated from integral t=0->1 with t+= 0.0001
module.exports.splineCalculation = function splineCalculation(entity, dims) {
	const degree = entity.degreeOfSplineCurve;
	const knots = entity.knotValues;

	const cp = entity.controlPoints;
	// console.log(cp);
	var points = Object.keys(cp).map((key) => [cp[key].x, cp[key].y]);

	var length = 0;
	var area = 0;
	var lastPoint;
	for(var t = 0; t < 1; t += 0.0001) {
		var point = bspline(t, degree, points, knots);

		if(lastPoint) {
			const x1 = lastPoint[0];
			const y1 = lastPoint[1];

			const x2 = point[0];
			const y2 = point[1];

			length += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

			area += Math.abs(x1 * y2) - Math.abs(x2 * y1);

			// handle dimensions
			dims.min_x = Math.min(x1, dims.min_x);
			dims.max_x = Math.max(x1, dims.max_x);
			dims.min_y = Math.min(y1, dims.min_y);
			dims.max_y = Math.max(y1, dims.max_y);
		}
		lastPoint = point;
	}

	// handle dimensions for last coordinate
	dims.min_x = Math.min(lastPoint[0], dims.min_x);
	dims.max_x = Math.max(lastPoint[0], dims.max_x);
	dims.min_y = Math.min(lastPoint[1], dims.min_y);
	dims.max_y = Math.max(lastPoint[1], dims.max_y);

	return {
		length: length,
		area: area,
	};
};

module.exports.circleCalculation = function circleCalculation(entity, dims) {
	dims.min_x = Math.min(entity.center.x - entity.radius, dims.min_x);
	dims.max_x = Math.max(entity.center.x + entity.radius, dims.max_x);
	dims.min_y = Math.min(entity.center.y - entity.radius, dims.min_y);
	dims.max_y = Math.max(entity.center.y + entity.radius, dims.max_y);

	return {
		length: entity.radius * 2 * Math.PI,
		area: Math.pow(entity.radius, 2) * Math.PI,
	};
};

module.exports.ellipseCalculation = function ellipseCalculation(entity, dims) {
	// Calculate dist from maj axis points to center
	const majAxisX = Math.abs(entity.majorAxisEndPoint.x);
	const majAxisY = Math.abs(entity.majorAxisEndPoint.y);

	const a = (Math.sqrt(Math.pow(majAxisX, 2) + Math.pow(majAxisY, 2)));

	// Calculate dist from min axis points to center
	const minAxisX = entity.majorAxisEndPoint.y * entity.axisRatio;
	const minAxisY = entity.majorAxisEndPoint.x * entity.axisRatio;
	const b = (Math.sqrt(Math.pow(minAxisX, 2) + Math.pow(minAxisY, 2)));

	// Ramanujan Approximation for circumference
	const h = (Math.pow(a - b, 2) / Math.pow(a + b, 2));
	const circumference = Math.PI * (a + b) * (1 + ((3 * h) / (10 + Math.sqrt(4 - 3 * h))));

	// Area calculation
	const area = a * b * Math.PI;

	return {
		length: circumference,
		area: area,
	};
};

module.exports.arcCalculation = function arcCalculation(entity, dims) {
	return {
		length: entity.radius * entity.angleLength,
		area: 0
	};
};
