var BSpline = require('./BSplineUtilities/bspline.js');
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
	let length = 0;
	let closed = entity.shape || 
					(entity.vertices[0].x == entity.vertices[entity.vertices.length - 1].x && 
					entity.vertices[0].y == entity.vertices[entity.vertices.length - 1].y);
	let area = 0;
	for(var i = 0; i < entity.vertices.length - 1; i++) {

		const x1 = entity.vertices[i].x;
		const y1 = entity.vertices[i].y;

		const x2 = entity.vertices[i + 1].x;
		const y2 = entity.vertices[i + 1].y;

		//calculating length of polygon
		length += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

		//calculating area of polygon
		if(closed) area += (x1 * y2) - (x2 * y1);
	}

	//calculate last closed point length of polygon
	if(closed || entity.shape) {
		const x1 = entity.vertices[entity.vertices.length - 1].x;
		const y1 = entity.vertices[entity.vertices.length - 1].y;

		const x2 = entity.vertices[0].x;
		const y2 = entity.vertices[0].y;
		length += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	}

	//final calc of area
	area = Math.abs(area)/2;
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
	var bspline = new BSpline(entity.controlPoints, entity.knotValues, entity.degreeOfSplineCurve + 1);
	let length = bspline.calcTotalLength();

	return {
		length: length,
		area: 0,
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