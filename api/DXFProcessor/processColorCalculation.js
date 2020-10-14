var { mergeOnType } = require('../MergeUtils/mergeHandler.js');
const { calculate } = require('../CalculationUtils/handleCalculation.js');


module.exports.processColorCalculation = function processColorCalculation(colorDict, unsupportedTypes) {
    // Will be an array of length, area calculations for each color
    var colorCalcs = [];

    // total length of all entities
    var totalLength = 0;

    // contains min,max values for x and y for determining overall extents
    var overall_dimensions = {
        min: {
            x: Number.MAX_SAFE_INTEGER,
            y: Number.MAX_SAFE_INTEGER,
        },
        max: {
            x: Number.MIN_SAFE_INTEGER,
            y: Number.MIN_SAFE_INTEGER,
        }
    }

    // iterate by colors in color dict
    for(const color in colorDict) {

        // iterate through each type
        // 2 steps  -> merge entities that are connected
        //          -> calculate lengths and areas of entities and append calculations to colorCalcs
        for(const type in colorDict[color].entities) {

            // entities variable contains all entities associated with given type
            let entities = colorDict[color].entities;

            // with the given type, mergeOnType merges all connected entities into an array
            var merged = mergeOnType(entities[type], type);

            // if an entity type is not supported, it will be caught here
            // delete entities[type] so it doesn't mess with next calculation step
            // add to unsupportedTypes set
            if(!merged.message) entities[type] = merged;
            else {

                // remove unsupported type from entities obj and add to unsupportedTypes set
                delete entities[type];
                unsupportedTypes.add(type);
            }

            // console.log(`${color}/${type} with ${entities[type].length} merged:`);
            // console.log(entities[type]);
        }

        // Calculate lengths and areas for each type within respective color
        var calcs = calculate(colorDict[color].entities);
        if(!calcs.message) {

            // set global extents
            overall_dimensions.min.x = Math.min(overall_dimensions.min.x, calcs.dimensions.min.x)
            overall_dimensions.max.x = Math.max(overall_dimensions.max.x, calcs.dimensions.max.x)
            overall_dimensions.min.y = Math.min(overall_dimensions.min.y, calcs.dimensions.min.y)
            overall_dimensions.max.y = Math.max(overall_dimensions.max.y, calcs.dimensions.max.y)

            // append color name and length + area calculations to colorCalcs
            colorCalcs.push({
                name: color,
                length: calcs.length,
                area: calcs.area,
                x_extents: calcs.dimensions.max.x - calcs.dimensions.min.x,
                y_extents: calcs.dimensions.max.y - calcs.dimensions.min.y,
            });
            totalLength += calcs.length;
        }
    }

    return {
        colors: colorCalcs,
        total_length: totalLength,
        dimensions: overall_dimensions,
    };
};