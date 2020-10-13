var bspline = require('b-spline');

module.exports.lineCalculation = function lineCalculation(entity, dims) {
    const x1 = entity.vertices[0].x;
    const y1 = entity.vertices[0].y;

    const x2 = entity.vertices[1].x;
    const y2 = entity.vertices[1].y;

    var length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    var area = Math.abs(x1 * y2) - Math.abs(x2 * y1);

    // handle dimensions for coordinate1
    dims.min.x = Math.min(x1, dims.min.x);
    dims.max.x = Math.max(x1, dims.max.x);
    dims.min.y = Math.min(y1, dims.min.y);
    dims.max.y = Math.max(y1, dims.max.y);

    // handle dimensions for coordinate2
    dims.min.x = Math.min(x2, dims.min.x);
    dims.max.x = Math.max(x2, dims.max.x);
    dims.min.y = Math.min(y2, dims.min.y);
    dims.max.y = Math.max(y2, dims.max.y);

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
        dims.min.x = Math.min(x1, dims.min.x);
        dims.max.x = Math.max(x1, dims.max.x);
        dims.min.y = Math.min(y1, dims.min.y);
        dims.max.y = Math.max(y1, dims.max.y);
    }

    // handle dimensions for last coordinate
    dims.min.x = Math.min(vt[vt.length - 1].x, dims.min.x);
    dims.max.x = Math.max(vt[vt.length - 1].x, dims.max.x);
    dims.min.y = Math.min(vt[vt.length - 1].y, dims.min.y);
    dims.max.y = Math.max(vt[vt.length - 1].y, dims.max.y);

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
            dims.min.x = Math.min(x1, dims.min.x);
            dims.max.x = Math.max(x1, dims.max.x);
            dims.min.y = Math.min(y1, dims.min.y);
            dims.max.y = Math.max(y1, dims.max.y);
        }
        lastPoint = point;
    }

    // handle dimensions for last coordinate
    dims.min.x = Math.min(lastPoint[0], dims.min.x);
    dims.max.x = Math.max(lastPoint[0], dims.max.x);
    dims.min.y = Math.min(lastPoint[1], dims.min.y);
    dims.max.y = Math.max(lastPoint[1], dims.max.y);

    return {
        length: length,
        area: area,
    };
};

module.exports.circleCalculation = function circleCalculation(entity, dims) {
    dims.min.x = Math.min(entity.center.x - entity.radius, dims.min.x);
    dims.max.x = Math.max(entity.center.x + entity.radius, dims.max.x);
    dims.min.y = Math.min(entity.center.y - entity.radius, dims.min.y);
    dims.max.y = Math.max(entity.center.y + entity.radius, dims.max.y);

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
    const x = Math.sqrt(Math.pow(a, 2) * Math.pow(Math.cos(angle), 2) +
        Math.pow(b, 2) * Math.pow(Math.sin(angle), 2));

    // calc length of x limit
    const y = Math.sqrt(Math.pow(a, 2) * Math.pow(Math.sin(angle), 2) +
        Math.pow(b, 2) * Math.pow(Math.cos(angle), 2));

    dims.min.x = Math.min(entity.center.x - x, dims.min.x);
    dims.max.x = Math.max(entity.center.x + x, dims.max.x);
    dims.min.y = Math.min(entity.center.y - y, dims.min.y);
    dims.max.y = Math.max(entity.center.y + y, dims.max.y);

    return {
        length: circumference,
        area: area,
    };
};

module.exports.arcCalculation = function arcCalculation(entity, dims) {
    const center = entity.center;
    const radius = entity.radius;

    // set angle to calculate length
    var angle = (entity.angleLength < 0) ? 2 * Math.PI + entity.angleLength : entity.angleLength;

    // calculate extents here
    var start = entity.startAngle;
    var end = entity.endAngle;
    if(start < end) {
        var top = start < Math.PI / 2 && end > Math.PI / 2
        var left = start < Math.PI && end > Math.PI
        var bottom = start < 3 * Math.PI / 2 && end > 3 * Math.PI / 2
        var right = false
    } else {
        var top = start < Math.PI / 2 || end > Math.PI / 2
        var left = start < Math.PI || end > Math.PI
        var bottom = start < 3 * Math.PI / 2 || end > 3 * Math.PI / 2
        var right = start < 0 || end > 0
    }

    const x1 = center.x + radius * Math.cos(start);
    const y1 = center.y + radius * Math.sin(start);
    const x2 = center.x + radius * Math.cos(end);
    const y2 = center.y + radius * Math.sin(end);

    dims.min.x = left ? Math.min(dims.min.x, center.x - radius) : Math.min(dims.min.x, Math.min(x1, x2))
    dims.max.x = right ? Math.max(dims.max.x, center.x + radius) : Math.max(dims.max.x, Math.max(x1, x2))
    dims.min.y = bottom ? Math.min(dims.min.y, center.y - radius) : Math.min(dims.min.y, Math.min(y1, y2))
    dims.max.y = top ? Math.max(dims.max.y, center.y + radius) : Math.max(dims.max.y, Math.max(y1, y2))

    return {
        length: radius * angle,
        area: 0
    };
};