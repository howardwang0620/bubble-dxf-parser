var { getColor, getHex, roundToNDec } = require('../Utilities/utilities.js');

module.exports.splitColorDict = function splitColorDict(colors, included) {
    // convert included string to array
    // included will either be empty or filled
    if(included)
        included = new Set(included.split(",").map(e => {
            if(!isNaN(e)) return getHex(e.trim());
            else return e.trim().toUpperCase();
        }));
    else
        included = new Set();

    var includedColors = [];
    var includedLength = 0;

    var excludedColors = [];
    var excludedLength = 0;

    // start splitting colors to included and excluded colors
    // if included is not defined, add to included
    // if included is defined, add to included if it contains color
    // if included is defined and not in included, add to excluded
    var usedColors = new Set();
    colors.forEach(function(e) {
        e.length = roundToNDec(e.length, 3);
        e.area = roundToNDec(e.area, 3);
        e.x_extents = roundToNDec(e.x_extents, 2);
        e.y_extents = roundToNDec(e.y_extents, 2);

        if(included.size == 0) {
            includedColors.push(e);
            includedLength += e.length;
        } else if(included.size > 0 && included.has(e.name)) {
            includedColors.push(e);
            includedLength += e.length;
            usedColors.add(e.name);
        } else {
            excludedColors.push(e);
            excludedLength += e.length;
        }
    });

    // delete used colors from included to find missing colors
    usedColors.forEach(function(e) {
        included.delete(e);
    });
    var missingColors = Array.from(included);

    // fill in empty payload for included and excluded colors
    if(includedColors.length == 0) {
        includedColors.push({
            name: "None",
            length: 0,
            area: 0,
            x_extents: 0,
            y_extents: 0,
        });
    }
    if(excludedColors.length == 0) {
        excludedColors.push({
            name: "None",
            length: 0,
            area: 0,
            x_extents: 0,
            y_extents: 0,
        });
    }

    return {
        includedColors: {
            colors: includedColors,
            total_length: roundToNDec(includedLength, 3),
        },
        excludedColors: {
            colors: excludedColors,
            total_length: roundToNDec(excludedLength, 3),
        },
        missingColors: missingColors,
    };
};