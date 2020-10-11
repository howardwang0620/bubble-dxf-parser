var { roundToNDec } = require('../Utilities/utilities.js');

module.exports.mergePolyLines = function mergePolyLines(entities) {
    var visited = new Array(entities.length).fill(false);
    var merged = [];

    // iterate through all entities and add to merged
    for (var i = 0; i < entities.length; i++) {

        if (!visited[i]) {
            var mergedList = [];
            var closed;

            // if entity is already a shape, set mergedlist to it
            if (entities[i].closed || entities[i].shape) {
                visited[i] = true;
                mergedList.push(entities[i]);
                closed = true;

                // else group connected splines together
            } else {
                mergedList = mergePolyLinesDFS(entities, i, [], visited);
                if (mergedList.length == 1) closed = checkJointClosed(mergedList[0]);
                else closed = checkDisjointClosed(mergedList);
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


// check if a singular entity is closed if start and ends are connected
function checkJointClosed(entity) {
    var vertices = entity.vertices;
    var start = vertices[0];
    var end = vertices[vertices.length - 1];

    return start.x == end.x && start.y == end.y;
}


// can check if an entity is closed by adding all start and end control points to a set.
// it will be closed if set size is equal to entities length meaning all start and end points coincide at least once
function checkDisjointClosed(entities) {
    var set = new Set();
    for (var entity of entities) {
        var vt = entity.vertices;
        set.add(roundToNDec(vt[0].x, 6) + " " + roundToNDec(vt[0].y, 6));
        set.add(roundToNDec(vt[vt.length - 1].x, 6) + " " + roundToNDec(vt[vt.length - 1].y, 6));
    }

    return set.size == entities.length;
}

// DFS to traverse list by starting and ending nodes of each entity
// connects 2 entities by looking at end node of one and start node of another
// goal of merging is to have every node's vertices look like (start:end->start:end->...->start:end)
function mergePolyLinesDFS(entities, pos, list, visited) {
    list.push(entities[pos]);
    visited[pos] = true;

    var vt = entities[pos].vertices;
    let start = {
        x: roundToNDec(vt[0].x, 6),
        y: roundToNDec(vt[0].y, 6),
    };
    let end = {
        x: roundToNDec(vt[vt.length - 1].x, 6),
        y: roundToNDec(vt[vt.length - 1].y, 6),
    };

    for (var i = 0; i < entities.length; i++) {
        var currVt = entities[i].vertices;
        var currStart = {
            x: roundToNDec(currVt[0].x, 6),
            y: roundToNDec(currVt[0].y, 6),
        };
        var currEnd = {
            x: roundToNDec(currVt[currVt.length - 1].x, 6),
            y: roundToNDec(currVt[currVt.length - 1].y, 6),
        };

        // don't check visited nodes
        if (!visited[i]) {

            // check where entity's may connect
            // x:x -> y:y where x:x is the entity passed, y:y is the entity iterating thru
            if (end.x == currStart.x && end.y == currStart.y) {

                // in order
                mergePolyLinesDFS(entities, i, list, visited); // recursive call
            } else if (end.x == currEnd.x && end.y == currEnd.y) {

                // start:end -> end:start | start:end -> start:end
                // reverse second node
                entities[i].vertices = entities[i].vertices.reverse(); // if end matches next nodes end, reverse the vertices so end matches start
                mergePolyLinesDFS(entities, i, list, visited);
            } else if (start.x == currStart.x && start.y == currStart.y) {

                // end:start -> start:end | start:end -> start:end
                // reverse first node
                list[list.length - 1].vertices = list[list.length - 1].vertices.reverse();
                mergePolyLinesDFS(entities, i, list, visited);
            } else if (start.x == currEnd.x && start.y == currEnd.y) {

                // end:start -> end:start | start:end -> start:end
                // reverse both nodes
                entities[i].vertices = entities[i].vertices.reverse();
                list[list.length - 1].vertices = list[list.length - 1].vertices.reverse();
                mergePolyLinesDFS(entities, i, list, visited);
            }
        }
    }

    return list;
}