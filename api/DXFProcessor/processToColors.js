var { getColor, getHex } = require('../Utilities/utilities.js');

// const DEFAULT_COLOR = "BLACK";
const DEFAULT_COLOR = "#000000";

module.exports.processDXFByColor = function processDXFByColor(dxf) {

    // layers will initially be an object to merge layers by colors
    var layerDict = {}; // layerDict stores layer -> color mapping
    var colorDict = {}; // colorDict stores color -> entities mapping

    // init colors in layers
    for (const layerNum in dxf.tables.layer.layers) {
        var layer = dxf.tables.layer.layers[layerNum];

        // Init to default color (black) if no color
        const color = layer.color ? getHex(layer.color) : DEFAULT_COLOR;

        // Map layer name to layer's color
        layerDict[layer.name] = color;

        // Initialize color within color dictionary
        colorDict[color] = { entities: {} };
    }

    // init entity colors and entity types in color dict
    for (const entityNum in dxf.entities) {
        let entity = dxf.entities[entityNum];
        var color;

        // if entity has its own color, prioritize that color in insertion to colordict
        if (entity.color != null) {
            color = getHex(entity.color);

            // init color to colorDict
            if (!colorDict[color]) {
                colorDict[color] = { entities: {} };
            }
        } else {

            // grab color from layerDict
            color = layerDict[entity.layer];
        }

        // append type to corresponding colors in colorDict
        if (!colorDict[color].entities[entity.type]) {
            colorDict[color].entities[entity.type] = [];
        }
        colorDict[color].entities[entity.type].push(entity);
    }

    // remove colors with no entities from included colors
    for (const color in colorDict) {
        if (Object.keys(colorDict[color].entities).length == 0) delete colorDict[color];
    }

    return colorDict;
};