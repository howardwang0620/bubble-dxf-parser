var { mergeOnType } = require('../MergeUtils/mergeHandler.js');
const { calculate } = require('../CalculationUtils/handleCalculation.js');


module.exports.processColorCalculation = function processColorCalculation(colorDict, unsupportedTypes) {
    // Will be an array of length, area calculations for each color
    var colorCalcs = [];

    // total length of all entities
    var totalLength = 0;

    // iterate by colors in color dict
    for (const color in colorDict) {

        // iterate through each type
        // 2 steps  -> merge entities that are connected
        //          -> calculate lengths and areas of entities and append calculations to colorCalcs
        for (const type in colorDict[color].entities) {

            // entities variable contains all entities associated with given type
            let entities = colorDict[color].entities;

            // with the given type, mergeOnType merges all connected entities into an array
            var merged = mergeOnType(entities[type], type);

            // if an entity type is not supported, it will be caught here
            // delete entities[type] so it doesn't mess with next calculation step
            // add to unsupportedTypes set
            if (!merged.message) entities[type] = merged;
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
        if (!calcs.message) {

            // append color name and length + area calculations to colorCalcs
            colorCalcs.push({
                name: color,
                length: calcs.length,
                area: calcs.area,
                x_extents: calcs.x_extents,
                y_extents: calcs.y_extents,
            });
            totalLength += calcs.length;
        }
    }

    return {
        colors: colorCalcs,
        total_length: totalLength,
    };
};