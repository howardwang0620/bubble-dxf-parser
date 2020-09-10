var shapes = require('./shapeCalculations.js');

/*
	input: object of entity types, each an array of objects containing merged entities and closed bool

		Red
		{
		  	CIRCLE: [
			    { merged: [Array], closed: null },
			    { merged: [Array], closed: null }
		  	],
		  	SPLINE: [
		  		{merged: [Array], closed: true}
		  	]
		}

*/
// send each entity in array to type and add to total length and area calculations
module.exports.calculate = function calculate(types) {
	var ret = {
		length: 0,
		area: 0,
		x_extents: 0,
		y_extents: 0,
	};
	for(const type in types) {
		var mergedList = types[type];
		for(var i = 0; i < mergedList.length; i++) {
			var entity = mergedList[i];
			var calcs = handleCalculation(entity, type);

			// If entity is supported, add together lengths and areas for given type to ret object
			if(!calcs.message) {
				ret.length += calcs.length;
				ret.area += calcs.area;
			}
		}
	}

	return ret;
};

/*
Area and length calculations depending on entity
Any unsupported entities will have been caught by mergehandler, don't need to worry here
*/
function handleCalculation(entity, type) {
	switch(type) {
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
	}
}

function handleLine(entity, calc) {
	var entities = entity.merged;
	var closed = entity.closed;

	var def = {
		length: 0,
		area: 0,
	};

	var length = 0;
	for(var i = 0; i < entities.length; i++) {
		var calcs = shapes.lineCalculation(entities[i]);

		def.length += calcs.length;
		if(closed) def.area += calcs.area;

	}
	if(closed) def.area = Math.abs(def.area) / 2;

	return def;
}

function handlePolyLine(entity) {
	var entities = entity.merged;
	var closed = entity.closed;

	var def = {
		length: 0,
		area: 0,
	};
	for(var i = 0; i < entities.length; i++) {
		var calcs = shapes.polyLineCalculation(entities[i]);

		def.length += calcs.length;
		if(closed) def.area += calcs.area;
	}
	if(closed) def.area = Math.abs(def.area) / 2;

	return def;
}

function handleSpline(entity) {
	var entities = entity.merged;
	var closed = entity.closed;

	var def = {
		length: 0,
		area: 0,
	};

	for(var i = 0; i < entities.length; i++) {
		var calcs = shapes.splineCalculation(entities[i]);

		def.length += calcs.length;
		if(closed) def.area += calcs.area;
	}

	if(closed) def.area = Math.abs(def.area) / 2;

	return def;
}

function handleCircle(entity) {
	var entities = entity.merged;
	var closed = entity.closed;

	var def = {
		length: 0,
		area: 0,
	};

	for(var i = 0; i < entities.length; i++) {
		var calcs = shapes.circleCalculation(entities[i]);
		def.length += calcs.length;
		def.area += calcs.area;
	}

	return def;
}

function handleEllipse(entity) {
	var entities = entity.merged;
	var closed = entity.closed;

	var def = {
		length: 0,
		area: 0,
	};

	for(var i = 0; i < entities.length; i++) {
		var calcs = shapes.ellipseCalculation(entities[i]);
		def.length += calcs.length;
		def.area += calcs.area;
	}

	return def;
}

function handleArc(entity) {
	var entities = entity.merged;
	var closed = entity.closed;

	var def = {
		length: 0,
		area: 0,
	};

	for(var i = 0; i < entities.length; i++) {
		var calcs = shapes.arcCalculation(entities[i]);
		def.length += calcs.length;
	}

	return def;
}
