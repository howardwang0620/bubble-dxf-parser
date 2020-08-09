const EntityCalculation = require('./EntityCalculation/Utilities.js');
const THREEdxf = require('./DXFImageConversion/three-dxf-node.js');
const namer = require('color-namer');

const DEFAULT_COLOR = "Black";

// Parses a DXF function taking a dxf object (read using module 'dxf-parser') and
// a unit variable that specifies the extent measurement (eg. cm, in, ft)
function parseDXF(dxf, unit, obj) {

    console.log("parsing...");

    // Get extents
    // var extents = "";
    const xExtent = roundTo3Dec(dxf.header.$EXTMAX.x - dxf.header.$EXTMIN.x);
    const yExtent = roundTo3Dec(dxf.header.$EXTMAX.y - dxf.header.$EXTMIN.y);

    if(!unit || unit == "") unit = "";
    obj.extents = `${xExtent}${unit} x ${yExtent}${unit}`;

    // layers will initially be an object to merge layers by colors
    var layerDict = {};     // layerDict stores layer -> color mapping
    var colorDict = {};     // colorDict stores length and areas for each color

    for (const layerNum in dxf.tables.layer.layers) {
        var layer = dxf.tables.layer.layers[layerNum];

        // Init to default color (black) if no color
        const color = layer.color ? getColor(layer.color) : DEFAULT_COLOR;

        // Map layer name to layer's color
        layerDict[layer.name] = color;

        // Initialize color within color dictionary
        colorDict[color] = {
            length: 0,
            area: 0,
        };
    }

    // Iterate through entities inside dxf.entities and perform calculations accordingly
    var totLength = 0;
    for (const entityNum in dxf.entities) {
        var entity = dxf.entities[entityNum];
        var calcs = EntityCalculation.handleEntityCalculation(entity);

        // Calcs.message occurs when entity calculation is not supported
        if(!calcs.message) {
            var color;

            // If entity has a color, apply calcs to that color 
            // rather than its layer's color
            if(entity.color != null) {
                color = getColor(entity.color);

                // Build color in colorDict if doesnt exist
                if(!colorDict[color]) {
                    colorDict[color] = {
                        length: 0,
                        area: 0,
                    };
                }

            } else color = layerDict[entity.layer];

            // Apply total length calculation
            obj.totLength += calcs.length;

            // Apply color specific area and length calculations
            colorDict[color].length += calcs.length;
            colorDict[color].area += calcs.area;

            console.log(`${color} ${entity.type} is length: ${roundTo3Dec(calcs.length)} , area: ${roundTo3Dec(calcs.area)}`);

        } else {

            // Errors array contains entity types that are not supported
            obj.errors.push(entity.type);
            console.log(`not possible for entity type: ${entity.type}\n`);
        }
    }

    // Fill out obj.layers with colors and respective lengths + areas
    for(const color in colorDict) {
        // If length and area properties are 0, don't use
        if(colorDict[color].length == 0 && colorDict[color].area == 0) continue;

        // Add color object into resulting object
        obj.layers.push({
            name: color,
            length: roundTo3Dec(colorDict[color].length),
            area: roundTo3Dec(colorDict[color].area),
        });
    }

    // Reformat total length + length and areas of layer array
    obj.totLength = roundTo3Dec(obj.totLength);

    // Draw dxf into a Base64 Encoded Image string
    obj.image = THREEdxf.drawDXF(dxf, 400, 400),
    // console.log(res);

    obj.message = "Success!"
    // Return resulting dxf object
    return obj;
}

// Converts color to hex then gets name of color
function getColor(col) {
    var hex = "#" + parseInt(col).toString(16).toUpperCase().padStart(6, '0');
    var name = namer(hex).html[0].name;
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function roundTo3Dec(num) {
    return Math.round((num) * 1000) / 1000;
}   

module.exports = { parseDXF }