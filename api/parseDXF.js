const DxfParser = require('dxf-parser');
const EntityCalculation = require('./EntityUtilities/Utilities.js');

function parseDXF(fileText) {
	var parser = new DxfParser();
    try {
     	//parse dxf into readable object
    	var dxf = parser.parseSync(fileText);

    	//returning object
    	var res = {
    		layers: {},
    		totLength: 0,
    		image: null,
    		xExtent: dxf.header.$EXTMAX.x - dxf.header.$EXTMIN.x,
    		yExtent: dxf.header.$EXTMAX.y - dxf.header.$EXTMIN.y,
    		errors: [],
    	};
    	var totLength = 0;

    	//fill colors object using layers in table secion
    	for (const layerNum in dxf.tables.layer.layers) {
    		var layer = dxf.tables.layer.layers[layerNum];
    		res.layers[layer.name] = {
    			color: layer.color ? layer.color : null,
    			colorIndex: layer.colorIndex ? layer.colorIndex : null,
    			length: 0,
    			area: 0,
    		};
    	}

    	// Iterate through entities inside dxf.entities and perform calculations accordingly
    	for (const entityNum in dxf.entities) {
    		var entity = dxf.entities[entityNum];
    		var calcs = EntityCalculation.handleEntityCalculation(entity);

    		//calcs.message occurs when entity calculation is not supported
    		if(!calcs.message) {

    			//apply total length calculation
        		res.totLength += calcs.length;

        		//apply layer specific area and length calculations
        		res.layers[entity.layer].length += calcs.length;
				res.layers[entity.layer].area += calcs.area;

        	} else {

        		//errors array contains entity types that are not supported
        		errors.push(entity.type);
        		console.log(`not possible for entity type: ${entity.type}\n`);
        	}
    	}

    	//return resulting dxf object
    	return res;

    } catch(err) {

    	//error reading dxf file, throw error
    	throw new Error(err.message);
    }
}

module.exports = { parseDXF }