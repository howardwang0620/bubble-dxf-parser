var { getColor, roundTo3Dec } = require('../Utilities/utilities.js');

module.exports.splitColorDict = function splitColorDict(colors, included) {
	// convert included string to array
	// included will either be empty or filled
    if(included)
    	// included = new Set(included.split(",").map(e => e.trim().toUpperCase()));
    	// included = new Set(included.split(",").map(e => getColor(e.trim())));
    	included = new Set(included.split(",").map(e => {
    		if(!isNaN(e)) return getColor(e.trim());
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
    	e.length = roundTo3Dec(e.length);
		e.area = roundTo3Dec(e.area);
		if(included.size == 0) {
    		console.log(`${e.name} INCLUDED`);
    		includedColors.push(e);
    		includedLength += e.length;
    	} else if(included.size > 0 && included.has(e.name)) {
    		console.log(`${e.name} INCLUDED`);
    		includedColors.push(e);
    		includedLength += e.length;
    		usedColors.add(e.name);
    	} else {
    		console.log(`${e.name} EXCLUDED`);
    		excludedColors.push(e);
    		excludedLength += e.length;
    	}
    });

    usedColors.forEach(function(e) {
    	included.delete(e);
    });

    var missingColors = Array.from(included);

    // fill in empty payload for included and excluded colors
    if(includedColors.length == 0) {
    	includedColors.push({
    		name: "Empty",
    		length: 0,
    		area: 0,
    	});
    }
    if(excludedColors.length == 0) {
    	excludedColors.push({
    		name: "Empty",
    		length: 0,
    		area: 0,
    	});
    }

    return {
    	includedColors: {
    		colors: includedColors,
    		totalLength: roundTo3Dec(includedLength),
    	},
    	excludedColors: {
    		colors: excludedColors,
    		totalLength: roundTo3Dec(excludedLength),
    	},
    	missingColors: missingColors,
    };




};