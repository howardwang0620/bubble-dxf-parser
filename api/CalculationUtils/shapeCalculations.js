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

	// Distance formula to get max axis length
	const a = (Math.sqrt(Math.pow(entity.majorAxisEndPoint.x, 2) + Math.pow(entity.majorAxisEndPoint.y, 2)));

	// Calculate min axis length
	const b = a * entity.axisRatio;

	// Ramanujan Approximation for circumference
	const h = (Math.pow(a - b, 2) / Math.pow(a + b, 2));
	const circumference = Math.PI * (a + b) * (1 + ((3 * h) / (10 + Math.sqrt(4 - 3 * h))));

	// Area calculation
	const area = a * b * Math.PI;

	// Handle dims here -> referenced https://math.stackexchange.com/questions/91132/how-to-get-the-limits-of-rotated-ellipse
	// calculate angle
	const angle = Math.atan2(entity.majorAxisEndPoint.y, entity.majorAxisEndPoint.x);

	// calculate limits of ellipse
	// calc length of y limit
	const x = Math.sqrt( Math.pow(a, 2) * Math.pow(Math.cos(angle), 2) + 
						Math.pow(b, 2) * Math.pow(Math.sin(angle), 2) );

	// calc length of x limit
	const y = Math.sqrt( Math.pow(a, 2) * Math.pow(Math.sin(angle), 2) + 
						Math.pow(b, 2) * Math.pow(Math.cos(angle), 2) );

	dims.min_x = Math.min(entity.center.x - x, dims.min_x);
	dims.max_x = Math.max(entity.center.x + x, dims.max_x);
	dims.min_y = Math.min(entity.center.y - y, dims.min_y);
	dims.max_y = Math.max(entity.center.y + y, dims.max_y);

	return {
		length: circumference,
		area: area,
	};
};

module.exports.arcCalculation = function arcCalculation(entity, dims) {
	const center = entity.center;
	const radius = entity.radius;
	const start = entity.startAngle;
	const end = entity.endAngle;

	const x1 = center.x + radius * Math.cos(start);
	const y1 = center.y + radius * Math.sin(start);

	const x2 = center.x + radius * Math.cos(end);
	const y2 = center.y + radius * Math.sin(end);

	console.log(x2, y2);

	// if minimum X angle (occurs at 180° or pi) is in range of empty space in arc
	// set to smaller of 2 arc endpoint X pos' else set to X pos at 180°
	const minXAngle = Math.PI;
	if(minXAngle < start && minXAngle > end) {
		dims.min_x = Math.min(Math.min(x1, x2), dims.min_x);
	} else {
		dims.min_x = Math.min(center.x - radius, dims.min_x);
	}

	// if maximum X angle (occurs at 0° or 0) is in range of empty space in arc
	// set to smaller of 2 arc endpoint X pos' else set to X pos at 0°
	const maxXAngle = 0;
	if(maxXAngle < start && maxXAngle > end) {
		dims.max_x = Math.max(Math.max(x1, x2), dims.max_x);
	} else {
		dims.max_x = Math.max(center.x + radius, dims.max_x);
	}

	// if minimum Y angle (occurs at 270° or 3pi/2) is in range of empty space in arc
	// set to smaller of 2 arc endpoint Y pos' else set to Y pos at 270°
	const minYAngle = 3 * Math.PI / 2;
	if(minYAngle < start && minYAngle > end) {
		dims.min_y = Math.min(Math.min(y1, y2), dims.min_y);
	} else {
		dims.min_y = Math.min(center.y - radius, dims.min_y);
	}

	// if maximum Y angle (occurs at 90° or pi/2) is in range of empty space in arc
	// set to smaller of 2 arc endpoint Y pos' else set to Y pos at 90°
	const maxYAngle = Math.PI / 2;
	if(maxYAngle < start && maxYAngle > end) {
		dims.max_y = Math.max(Math.max(y1, y2), dims.max_y);
	} else {
		dims.max_y = Math.max(center.y + radius, dims.max_y);
	}

	return {
		length: radius * (2 * Math.PI - Math.abs(entity.angleLength)),
		area: 0
	};
};
