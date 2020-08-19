var { getColor } = require('../Utilities/utilities.js');

module.exports.splitColorDict = function splitColorDict(colors, included, excluded) {
	// convert included string to array
    // NEED TO THINK ABOUT INPUT AS NUMBERS
    if(included)
    	// included = new Set(included.split(",").map(e => e.trim().toUpperCase()));
    	included = included.split(",").map(e => e.trim().getColor());
    else
    	included = new Set();

    if(excluded)
    	// excluded = new Set(excluded.split(",").map(e => e.trim().toUpperCase()));
    	excluded = excluded.split(",").map(e => e.trim().getColor());
    else
    	excluded = new Set();

    var includedColors = [];
   	var includedLength = 0;

   	var excludedColors = [];
   	var excludedLength = 0;

   	// start splitting colors to included and excluded colors
   	// if excluded contains current color, add to excluded
   	// if included is defined, add to included if it contains color
   	// if included is not defined, add to included 

   	/*
		exclude: [red, orange]
		include: []

		exclude: [red, orange]
		include: [blue]

		exclude: []
		include: [blue]

		exclude: []
		include: []

   	*/
    colors.forEach(function(e) {
    	if(excluded.size > 0 && excluded.has(e.name)) {
    		excludedColors.push(e);
    		excludedLength += e.length;
    	} else if(included.size > 0 && included.has(e.name)) {
    		includedColors.push(e);
    		includedLength += e.length;
    		included.delete(e.name);
    	} else if(included.size == 0) {
    		includedColors.push(e);
    		includedLength += e.length;
    	}
    });

    var missingColors = Array.from(included);

    // fill in empty payload for included and excluded colors
    // if(includedColors.length == 0) {
    // 	includedColors.push({
    // 		name: "Empty",
    // 		length: 0,
    // 		area: 0,
    // 	});
    // }
    // if(excludedColors.length == 0) {
    // 	excludedColors.push({
    // 		name: "Empty",
    // 		length: 0,
    // 		area: 0,
    // 	});
    // }

    return {
    	includedColors: {
    		colors: includedColors,
    		totalLength: includedLength,
    	},
    	excludedColors: {
    		colors: excludedColors,
    		totalLength: excludedLength,
    	},
    	missingColors: missingColors,
    };




};