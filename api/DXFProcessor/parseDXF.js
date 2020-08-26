var { processDXFByColor } = require('./processToColors.js');
var { processColorCalculation } = require('./processColorCalculation.js');
const { calculate } = require('../CalculationUtils/handleCalculation.js');
var { splitColorDict } = require('./splitColors.js');
const THREEdxf = require('../DXFImageConversion/three-dxf-node.js');
var { roundTo3Dec } = require('../Utilities/utilities.js');

// Parses a DXF function taking a dxf object (read using module 'dxf-parser')
// a unit parameter specifying the measurement (eg. cm, in, ft)
// an includedColors specifying which colors to include (color code or color name)
module.exports.parseDXF = function parseDXF(dxf, obj, unit, includedColors) {

    console.log("parsing...");

    // Get extents and set extents for obj
    const xExtent = roundTo3Dec(dxf.header.$EXTMAX.x - dxf.header.$EXTMIN.x);
    const yExtent = roundTo3Dec(dxf.header.$EXTMAX.y - dxf.header.$EXTMIN.y);

    if(!unit || unit == "") unit = "";
    obj.extents = `${xExtent}${unit} x ${yExtent}${unit}`;

    // stores mapping of includedcolors -> entities and excludedcolors -> entities
    var colorDict = processDXFByColor(dxf);

    // any unsupportedTypes will be added to here
    var unsupportedTypes = new Set();

    // will return length and area calculations for entities in respective included colors
    var colorCalcs = processColorCalculation(colorDict, unsupportedTypes);

    // split colors based on included parameter
    var splitColors = splitColorDict(colorCalcs.colors, includedColors, excludedColors);

    // set obj fields to included and exluded color objects
    obj.includedColors = splitColors.includedColors;
    obj.excludedColors = splitColors.excludedColors;

    // missingColors toString if necessary
    if(splitColors.missingColors.length > 0)
        obj.missingColors = splitColors.missingColors.join(", ");

    // unsupportedTypes toString if necessary
    if(unsupportedTypes.size > 0)
        obj.unSupportedTypes = Array.from(unsupportedTypes).join(", ");

    // generate Base64 Encoded Image from dxf
    obj.image = THREEdxf.drawDXF(dxf, 400, 400);

    obj.message = "Success!";
    return obj;
};
