var BSpline = require('./bspline.js');
/*
	Needs to return dimensions of entity
		Dimensions represented as [min X value, min Y value, max X value, max Y value]
	Area and length calculations must be determined as well
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
		default: return {
			message: `Entity ${entity.type} not found`,
		};
	}
}


/****************EDIT DIMENSIONS*******************/
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

	//DIMENSIONS NEED EDITING
	return {
		length: circumference,
		area: area,
		dimensions: [entity.center.x - majAxisX, entity.center.y - majAxisY, entity.center.x + majAxisX, entity.center.y + majAxisY],
	};

}

function handleCircle(entity) {
	return {
		length: entity.radius * 2 * Math.PI,
		area: Math.pow(entity.radius, 2) * Math.PI,
		dimensions: [entity.center.x - entity.radius, entity.center.y - entity.radius, 
					entity.center.x + entity.radius, entity.center.y + entity.radius],
	};
}

function handleLine(entity) {
	// console.log(entity);
	const x1 = entity.vertices[0].x;
	const y1 = entity.vertices[0].y;

	const x2 = entity.vertices[1].x;
	const y2 = entity.vertices[1].y;

	let length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y2, 2));
	let dimensions = [Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)];

	return {
		length: length,
		area: 0,
		dimensions: dimensions
	}

}

//coordinates MUST point to next coordinate -> DOES NOT handle complex polygons
//calculates length and area of lines
//area calculations derived from Area of a polygon using Coordinate Geometry
function handlePolyLine(entity) {

	let length = 0;

	let hasArea = entity.shape || 
					(entity.vertices[0].x == entity.vertices[entity.vertices.length - 1].x && 
					entity.vertices[0].y == entity.vertices[entity.vertices.length - 1].y);
	let area = 0;
	let dimensions = [Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
	for(var i = 0; i < entity.vertices.length; i++) {

		const x1 = entity.vertices[i].x;
		const y1 = entity.vertices[i].y;

		let nextPoint = (i == entity.vertices.length - 1) ? 0 : i + 1;
		const x2 = entity.vertices[nextPoint].x;
		const y2 = entity.vertices[nextPoint].y;

		//get dimensions of polyLine
		dimensions[0] = Math.min(dimensions[0], x1);
		dimensions[1] = Math.min(dimensions[1], y1);
		dimensions[2] = Math.max(dimensions[2], x2);
		dimensions[3] = Math.max(dimensions[3], y2);

		//calculating length of polygon
		length += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y2, 2));

		//calculating area of polygon
		if(hasArea) area += (x1 * y2) - (x2 * y1);
	}

	//final calc of area
	area = Math.abs(area)/2;
	return {
			length: length,
			area: area,
			dimensions: dimensions,
	};
}

/*

	def deBoorDerivative(k, x, t, c, p):
    """
    Evaluates S(x).

    Args
    ----
    k: index of knot interval that contains x
    x: position
    t: array of knot positions, needs to be padded as described above
    c: array of control points
    p: degree of B-spline
    """
    q = [p * (c[j+k-p+1] - c[j+k-p]) / (t[j+k+1] - t[j+k-p+1]) for j in range(0, p)]

    for r in range(1, p):
        for j in range(p-1, r-1, -1):
            right = j+1+k-r
            left = j+k-(p-1)
            alpha = (x - t[left]) / (t[right] - t[left])
            q[j] = (1.0 - alpha) * q[j-1] + alpha * q[j]

    return q[p-1]

*/
function handleSpline(entity) {
	// console.log(entity);
	let dimensions = [Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];

	/*
	De Boor algorithm calculating length of B-Spline
		http://public.vrac.iastate.edu/~oliver/courses/me625/week5b.pdf,
	Implementation in Python can be found here
		https://stackoverflow.com/questions/57507696/b-spline-derivative-using-de-boors-algorithm
	*/
	// var r = 1;

	// var k = entity.knotValues.length - 1;
	// var x = entity.knotValues[k];
	// var t = entity.knotValues;
	// var c = entity.controlPoints;
	// var p = entity.degreeOfSplineCurve;

	var bspline = new BSpline(entity.controlPoints, entity.knotValues, 4);
	let area = 0;
	let length = bspline.calcTotalLength();


	for(var i = 0; i < entity.controlPoints.length; i++) {

		const x1 = entity.controlPoints[i].x;
		const y1 = entity.controlPoints[i].y;

		let nextPoint = (i == entity.controlPoints.length - 1) ? 0 : i + 1;
		const x2 = entity.controlPoints[nextPoint].x;
		const y2 = entity.controlPoints[nextPoint].y;

		dimensions[0] = Math.min(dimensions[0], x1);
		dimensions[1] = Math.min(dimensions[1], y1);
		dimensions[2] = Math.max(dimensions[2], x2);
		dimensions[3] = Math.max(dimensions[3], y2);
	}

	return {
		length: length,
		area: area,
		dimensions: dimensions,
	};


}




module.exports = { handleEntityCalculation };