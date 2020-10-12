var { processDXFByColor } = require('./processToColors.js');
var { processColorCalculation } = require('./processColorCalculation.js');
const { calculate } = require('../CalculationUtils/handleCalculation.js');
var { splitColorDict } = require('./splitColors.js');
const THREEdxf = require('../DXFImageConversion/three-dxf-node.js');
var { roundToNDec } = require('../Utilities/utilities.js');

// Parses a DXF function taking a dxf object (read using module 'dxf-parser')
// a unit parameter specifying the measurement (eg. cm, in, ft)
// an includedColors specifying which colors to include (color code or color name)
module.exports.parseDXF = function parseDXF(dxf, obj, includedColors) {

    console.log("Parsing DXF...");

    // Get extents and set extents for obj
    const xExtent = roundToNDec(dxf.header.$EXTMAX.x - dxf.header.$EXTMIN.x, 3);
    const yExtent = roundToNDec(dxf.header.$EXTMAX.y - dxf.header.$EXTMIN.y, 3);

    // Units deprecated
    // if(!unit || unit == "") unit = "";
    // obj.extents = `${xExtent}${unit} x ${yExtent}${unit}`;

    obj.x_extents = xExtent;
    obj.y_extents = yExtent;

    // stores mapping of includedcolors -> entities and excludedcolors -> entities
    var colorDict = processDXFByColor(dxf);

    // any unsupportedTypes will be added to here
    var unsupportedTypes = new Set();

    // will return length and area calculations for entities in respective included colors
    var colorCalcs = processColorCalculation(colorDict, unsupportedTypes);

    // split colors based on included parameter
    var splitColors = splitColorDict(colorCalcs.colors, includedColors);

    // set obj fields to included and exluded color objects
    obj.included_colors = splitColors.includedColors;
    obj.excluded_colors = splitColors.excludedColors;

    // missingColors toString if necessary
    if(splitColors.missingColors.length > 0)
        obj.missing_colors = splitColors.missingColors.join(", ");

    // unsupportedTypes toString if necessary
    if(unsupportedTypes.size > 0)
        obj.unsupported_types = Array.from(unsupportedTypes).join(", ");

    // generate Base64 Encoded Image from dxf
    obj.image = THREEdxf.drawDXF(dxf, 400, 400);

    obj.message = "Success!";
    return obj;
};