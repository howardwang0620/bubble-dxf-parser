var { processDXFByColor } = require('./processToColors.js');
var { processColorCalculation } = require('./processColorCalculation.js');
const { calculate } = require('../CalculationUtils/handleCalculation.js');
var { splitColorDict } = require('./splitColors.js');
const THREEdxf = require('../DXFImageConversion/three-dxf-node.js');
var { roundTo3Dec } = require('../Utilities/utilities.js');

// Parses a DXF function taking a dxf object (read using module 'dxf-parser') and
// a unit variable that specifies the extent measurement (eg. cm, in, ft)
module.exports.parseDXF = function parseDXF(dxf, obj, unit, includedColors, excludedColors) {

    console.log("parsing...");

    // Get extents and set extents for obj
    const xExtent = roundTo3Dec(dxf.header.$EXTMAX.x - dxf.header.$EXTMIN.x);
    const yExtent = roundTo3Dec(dxf.header.$EXTMAX.y - dxf.header.$EXTMIN.y);

    if(!unit || unit == "") unit = "";
    obj.extents = `${xExtent}${unit} x ${yExtent}${unit}`;

    //  convert includedColors string to array
    // includedColors = includedColors.split(",").map(e => e.toUpperCase().trim());

    // stores mapping of includedcolors -> entities and excludedcolors -> entities
    var colorDict = processDXFByColor(dxf);

    // any unsupportedTypes will be added to here
    var unsupportedTypes = new Set();

    // will return length and area calculations for entities in respective included colors
    var colorCalcs = processColorCalculation(colorDict, unsupportedTypes);

    var splitColors = splitColorDict(colorCalcs.colors, includedColors, excludedColors);

    obj.includedColors = splitColors.includedColors;
    obj.excludedColors = splitColors.excludedColors;

    obj.missingColors = splitColors.missingColors;

    obj.image = THREEdxf.drawDXF(dxf, 400, 400);
    obj.unSupportedTypes = Array.from(unsupportedTypes);
    obj.message = "Success!";

    return obj;
};