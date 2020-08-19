var { roundTo6Dec } = require('../Utilities/utilities.js');

module.exports.mergeSplines = function mergeSplines(entities) {
	var visited = new Array(entities.length).fill(false);
	var merged = [];

	//iterate through all entities and add to merged
	for(var i = 0; i < entities.length; i++) {
		// console.log("CP:", entityList[i].controlPoints);
		if(!visited[i]) {
			var mergedList = [];
			var closed;

			//if entity is already a shape, set mergedlist to it
			if(entities[i].closed) {
				visited[i] = true;
				mergedList.push(entities[i]);
				closed = true;

			//else group connected splines together
			} else {
				mergedList = mergeSplinesDFS(entities, i, [], visited);
				closed = checkClosed(mergedList);
			}

			// add group of connected entities together and specify if closed
			merged.push({
    			merged: mergedList,
    			closed: closed,
    		});
		}
	}
	
    return merged;
};
	
//can check if an entity is closed by adding 
//all start and end control points to a set
//it will be closed if set size is equal to entities length
//meaning all start and end points coincide at least once 
function checkClosed(entities) {
	var set = new Set();
	for(var entity of entities) {
		var cp = entity.controlPoints;
		set.add(roundTo6Dec(cp[0].x) + " " + roundTo6Dec(cp[0].y));
		set.add(roundTo6Dec(cp[cp.length - 1].x) + " " + roundTo6Dec(cp[cp.length - 1].y));
	}

	// console.log("SET SIZE:", set.size);
	// console.log(set);

	return set.size == entities.length;
}

// DFS to traverse list by starting and ending nodes of each entity
// connects 2 entities by looking at end node of one and start node of another
// goal of merging is to have every node's vertices look like (start:end->start:end->...->start:end)
function mergeSplinesDFS(entities, pos, list, visited) {
	list.push(entities[pos]);
	visited[pos] = true;

	var cp = entities[pos].controlPoints;
	let start = cp[0];
	let end = cp[cp.length - 1];

	for(var i = 0; i < entities.length; i++) {
		var currCp = entities[i].controlPoints;
		var currStart = currCp[0];
		var currEnd = currCp[currCp.length - 1];

		//don't check visited nodes
		if(!visited[i]) {	

			// x:x -> y:y where x:x is the entity passed, y:y is the entity iterating thru
			if(end.x == currStart.x && end.y == currStart.y) {

				// start:end -> start:end | start:end -> start:end
				// in order
				mergeSplinesDFS(entities, i, list, visited);	// recursive call
			} else if(end.x == currEnd.x && end.y == currEnd.y) {

				// start:end -> end:start | start:end -> start:end
				// reverse second node
				entities[i].controlPoints = entities[i].controlPoints.reverse();	// if end matches next nodes end, reverse the controlpoints so end matches start
				entities[i].knotValues = reverseKnots(entities[i].knotValues, entities[i].degreeOfSplineCurve);	// reverse knot values as well

				mergeSplinesDFS(entities, i, list, visited);
			} else if(start.x == currStart.x && start.y == currStart.y) {

				// end:start -> start:end | start:end -> start:end
				// reverse first node
				list[list.length - 1].controlPoints = list[list.length - 1].controlPoints.reverse();
				list[list.length - 1].knotValues = reverseKnots(list[list.length - 1].knotValues, list[list.length - 1].degreeOfSplineCurve);
				
				mergeSplinesDFS(entities, i, list, visited);
			} else if(start.x == currEnd.x && start.y == currEnd.y) {

				// end:start -> end:start | start:end -> start:end
				// reverse both nodes
				entities[i].controlPoints = entities[i].controlPoints.reverse();
				entities[i].knotValues = reverseKnots(entities[i].knotValues, entities[i].degreeOfSplineCurve);

				list[list.length - 1].controlPoints = list[list.length - 1].controlPoints.reverse();
				list[list.length - 1].knotValues = reverseKnots(list[list.length - 1].knotValues, list[list.length - 1].degreeOfSplineCurve);
				
				mergeSplinesDFS(entities, i, list, visited);
			} 
		}
	}

	return list;
}

function reverseKnots(knots, degree) {
	var reverseknots = [knots.length];
	var o = degree + 1;
	const c = knots[0] + knots[knots.length - 1];

	for(var i = 0; i < knots.length; i++) {
		if(i >= o && i <= knots.length - o - 1) {
			var s = knots[knots.length - 1 - i];
			reverseknots[i] = c - s;
		} else {
			reverseknots[i] = knots[i];
		}
	}

	return reverseknots;
}