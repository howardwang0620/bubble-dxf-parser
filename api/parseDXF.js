const EntityCalculation = require('./EntityCalculation/Utilities.js');
const THREEdxf = require('./DXFImageConversion/three-dxf-node.js');
const namer = require('color-namer');

const DEFAULT_COLOR = "Black";
//Parses a DXF function taking a dxf object (read using module 'dxf-parser') and
//a unit variable that specifies the extent measurement (eg. cm, in, ft)
function parseDXF(dxf, unit) {

    //get extents
    const xExtent = roundTo3Dec(dxf.header.$EXTMAX.x - dxf.header.$EXTMIN.x);
    const yExtent = roundTo3Dec(dxf.header.$EXTMAX.y - dxf.header.$EXTMIN.y);
    if(!unit) unit = "";
    const extents = `${xExtent}${unit} x ${yExtent}${unit}`;

    //returning object
    //layers will initially be an object to merge layers by colors
    var res = {
        layers: {},
        totLength: 0,
        image: THREEdxf.drawDXF(dxf, 400, 400),
        extents: extents,
        errors: [],
    };
    var totLength = 0;

    //fill colors object using layers in table section
    var colorDict = {};
    for (const layerNum in dxf.tables.layer.layers) {
        var layer = dxf.tables.layer.layers[layerNum];

        //init to default color (black) if no color
        const color = layer.color ? getColor(layer.color) : DEFAULT_COLOR;

        // layerDictionary[layer.name] = i;
        // res.layers.push([layer.name, color, colorIndex, 0, 0]);
        // i++;

        //below code is for objectfying layers in return object
        //bubbleio doesnt handle well so were building array and storing
        //layer indices within layerDictionary

        //add layer -> color mapping
        colorDict[layer.name] = color;

        //initialize color object in res
        res.layers[color] = {
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
            var color;

            //entity color may be different than entity's layer color
            if(entity.color != null) {
                color = getColor(entity.color);

                //build color in res if doesnt exist
                if(!res.layers[color]) {
                    res.layers[color] = {
                        length: 0,
                        area: 0,
                    };
                }
            }
            else color = colorDict[entity.layer];
            //get index of layer within res' layer array
            // var layerIndex = layerDictionary[entity.layer];
            // var layerArray = res.layers[layerIndex];



            // layerArray[3] += calcs.length;
            // layerArray[4] += calcs.area;
            // console.log(entity.type, ":", calcs.length);

            //apply total length calculation
            res.totLength += calcs.length;

//          //apply layer specific area and length calculations
            res.layers[color].length += calcs.length;
            res.layers[color].area += calcs.area;

            console.log(`${color} ${entity.type} is length: ${roundTo3Dec(calcs.length)} , area: ${roundTo3Dec(calcs.area)}`);

        } else {

            //errors array contains entity types that are not supported
            res.errors.push(entity.type);
            console.log(`not possible for entity type: ${entity.type}\n`);
        }
    }

    var layers = res.layers;
    var modifiedLayers = [];
    for(const color in layers) {
        //extract length and area
        const length = roundTo3Dec(layers[color].length);
        const area = roundTo3Dec(layers[color].area);

        if(length == 0 && area == 0) continue;

        //object payload for layers
        modifiedLayers.push({
            name: color,
            length: length,
            area: area,
        });
    }

    //reformat total length + length and areas of layer array
    res.layers = modifiedLayers;
    res.totLength = roundTo3Dec(res.totLength);
    // console.log(res);

    //return resulting dxf object
    return res;
}

//convert color to hex then get name of color
function getColor(col) {
    var hex = "#" + parseInt(col).toString(16).toUpperCase().padStart(6, '0');
    var name = namer(hex).html[0].name;
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function roundTo3Dec(num) {
    return Math.round((num) * 1000) / 1000;
}   

module.exports = { parseDXF }