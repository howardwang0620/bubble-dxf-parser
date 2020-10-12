var { mergeSplines } = require('./mergeSplines');
var { mergePolyLines } = require('./mergePolyLines');

/*
	Preprocessed--
	{
		Red: {
			entities: {
				SPLINE: [Array]
			},
		}
	}

	Postprocessed--
	{
		Red: {
			entities: {
				SPLINE: [
					{
						merged: [],
						closed: true
					},
					{
						merged: [],
						closed: false,
					}
				]
			},
		}
	}
*/
module.exports.mergeOnType = function mergeOnType(entities, type) {
    switch (type) {
        case 'SPLINE':
            return mergeSplines(entities);
        case 'LINE':
        case 'LWPOLYLINE':
        case 'POLYLINE':
            return mergePolyLines(entities);
        case 'CIRCLE':
        case 'ELLIPSE':
            return reformat(entities, true);
        case 'ARC':
            return reformat(entities, false);
        default:
            return { message: `${type} NOT SUPPORTED YET` };
    }
};

function reformat(entities, closed) {
    return entities.map(e => {
        return { merged: [e], closed: closed };
    });
}