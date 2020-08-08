var bspline = require('b-spline');

/*
	Area and length calculations depending on entity
*/
function handleEntityCalculation(entity) {
	// console.log(entity);
	switch(entity.type) {
		case 'LINE':
			return handleLine(entity);
		case 'POLYLINE':
		case 'LWPOLYLINE':
			return handlePolyLine(entity);
		case 'SPLINE':
			return handleSpline(entity);
		case 'CIRCLE': 
			return handleCircle(entity);
		case 'ELLIPSE':
			return handleEllipse(entity);
		case 'ARC':
			return handleArc(entity);
		default: return {
			message: `Entity ${entity.type} not found`,
		};
	}
}

function handleLine(entity) {
	const x1 = entity.vertices[0].x;
	const y1 = entity.vertices[0].y;

	const x2 = entity.vertices[1].x;
	const y2 = entity.vertices[1].y;

	let length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y2, 2));

	return {
		length: length,
		area: 0,
	};

}

//DOES NOT HANDLE AREA FOR COMPLEXT POLYGONS
//calculates length and area of lines
//area calculations derived from Area of a polygon using Coordinate Geometry
function handlePolyLine(entity) {


	//determine if polygon is closed, thus has area
	let closed = entity.shape ||
					(entity.vertices[0].x == entity.vertices[entity.vertices.length - 1].x && 
					entity.vertices[0].y == entity.vertices[entity.vertices.length - 1].y);
	let length = 0;
	let area = 0;

	//handle length and area calculations
	for(var i = 0; i < entity.vertices.length; i++) {

		const x1 = entity.vertices[i].x;
		const y1 = entity.vertices[i].y;

		const nextPoint = (i == entity.vertices.length - 1) ? 0 : i + 1;

		const x2 = entity.vertices[nextPoint].x;
		const y2 = entity.vertices[nextPoint].y;	

		//calculating length of polygon
		length += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

		//handle area
		if(closed) area += Math.abs(x1 * y2) - Math.abs(x2 * y1);
	}

	//handle last area calculation /2
	if(closed) area = Math.abs(area) / 2;

	//return object
	return {
		length: length,
		area: area,
	};
}

/*
	De Boors Algorithm
	Implementation in ./BSplineUtilities
*/
function handleSpline(entity) {
	// console.log(entity);
	// var bspline = new BSpline(entity.controlPoints, entity.knotValues, entity.degreeOfSplineCurve + 1);
	// let length = bspline.calcTotalLength();

	const degree = entity.degreeOfSplineCurve;
    const knots = entity.knotValues;

    const cp = entity.controlPoints;
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
	    	if(entity.closed) area += Math.abs(x1 * y2) - Math.abs(x2 * y1);
    	}

    	lastPoint = point;
    }
    if(entity.closed) area = Math.abs(area) / 2;

	return {
		length: length,
		area: area,
	};
}

function handleCircle(entity) {
	return {
		length: entity.radius * 2 * Math.PI,
		area: Math.pow(entity.radius, 2) * Math.PI,
	};
}

function handleEllipse(entity) {
	//calculate dist from maj axis points to center
	const majAxisX = Math.abs(entity.majorAxisEndPoint.x);
	const majAxisY = Math.abs(entity.majorAxisEndPoint.y);

	const a = (Math.sqrt(Math.pow(majAxisX, 2) + Math.pow(majAxisY, 2)));

	//calculate dist from min axis points to center
	const minAxisX = entity.majorAxisEndPoint.y * entity.axisRatio;
	const minAxisY = entity.majorAxisEndPoint.x * entity.axisRatio;
	const b = (Math.sqrt(Math.pow(minAxisX, 2) + Math.pow(minAxisY, 2)));

	//Ramanujan Approximation for circumference
	const h = (Math.pow(a - b, 2) / Math.pow(a + b, 2));
	const circumference = Math.PI * (a + b) * (1 + ((3 * h) / (10 + Math.sqrt(4 - 3 * h))));

	//area calculation
	const area = a * b * Math.PI;

	return {
		length: circumference,
		area: area,
	};
}

function handleArc(entity) {
	return {
		length: entity.radius * entity.angleLength,
		area: 0
	};
}

module.exports = { handleEntityCalculation };