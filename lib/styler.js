/**//****************************************************************************
*	
*	@author ghosthack13 <13hackghost@gmail.com>
*	
*	This file is part of LoggerizeJS (also simply known as Loggerize).
*	
*	Loggerize is free software: you can redistribute it and/or modify
*	it under the terms of the GNU Affero General Public License as published by
*	the Free Software Foundation, either version 3 of the License, or
*	(at your option) any later version.
*	
*	Loggerize is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU Affero General Public License for more details.
*	
*	You should have received a copy of the GNU Affero General Public License
*	along with Loggerize.  If not, see <https://www.gnu.org/licenses/>.
*
********************************************************************************/

"use strict";

let ANSIColorCodes = {
	
	"black": 30,
	"red": 31,
	"green": 32,
	"yellow": 33,
	"blue": 34,
	"purple": 35,
	"cyan": 36,
	"white": 37,
	
	"foreground": {
		"black": 30,
		"red": 31,
		"green": 32,
		"yellow": 33,
		"blue": 34,
		"purple": 35,
		"cyan": 36,
		"white": 37,
	},	
	"background": {
		"black": 40,
		"red": 41,
		"green": 42,
		"yellow": 43,
		"blue": 44,
		"purple": 45,
		"cyan": 46,
		"white": 47,
	}
};

let ANSIModifierCodes = {
	"reset": 0,  //everything back to normal
	
	"bold": 1,  //often a brighter shade of the same colour
	"faint": 2,  //often a brighter shade of the same colour
	"underline": 4,
	"slowBlink": 5,
	"fastBlink": 6,
	"inverse": 7,  //swap foreground and background colours
	
	"boldOff": 21,
	"underlineOff": 24,
	"inverseOff": 27
};


function parseStyle(styles){
	
	let ANSIModifiers = ["underline", "bold"];
	
	let colorPatt = "(bg)?(black|red|green|yellow|blue|purple|cyan|white)(bright)?";
	let colorRegExObj = new RegExp(colorPatt, "i");
	
	if (typeof(styles) == "string"){
		styles = styles.split(" ");
	}
	
	//Format this value's font/background as defined by styles
	let colorObj = {};
	for (let i = 0; i < styles.length; ++i){
		styles[i] = styles[i].toLowerCase();
		if(ANSIModifiers.indexOf(styles[i]) != -1){
			if(!colorObj.hasOwnProperty("font")){
				colorObj["font"] = {"modifiers": []};
			}
			else if(!colorObj["font"].hasOwnProperty("modifiers")){
				colorObj["font"]["modifiers"] = [];
			}
			colorObj["font"]["modifiers"].push(styles[i]);
		}
		
		let matchArray = colorRegExObj.exec(styles[i]);
		if (typeof(matchArray) == "undefined" || matchArray == null){
			continue;
		}
		
		//Check if mattch has color and no background
		if (matchArray[2] && !matchArray[1]){
			if(!colorObj.hasOwnProperty("font")){
				colorObj["font"] = {"color": matchArray[2]};
			}
			else{
				colorObj["font"]["color"] = matchArray[2];
			}
			if (matchArray[3] != null){
				if(!colorObj["font"].hasOwnProperty("modifiers")){
					colorObj["font"]["modifiers"] = [];
				}
				colorObj["font"]["modifiers"].push("bold");
			}
		}
		else if (matchArray[2] && matchArray[1]){
			if(!colorObj.hasOwnProperty("background")){
				colorObj["background"] = {"color": matchArray[2]};
			}
			else{
				colorObj["background"]["color"] = matchArray[2];
			}
			if (matchArray[3] != null){
				if(!colorObj["background"].hasOwnProperty("modifiers")){
					colorObj["background"]["modifiers"] = [];
				}
				colorObj["background"]["modifiers"].push("bold");
			}
		}
	}
	
	return colorObj;
}

function ANSIStyler(input, styleOpts, enclosedBy){
	
	if (typeof(styleOpts) == "undefined" || typeof(styleOpts) != "object" || Object.keys(styleOpts).length == 0 || Array.isArray(styleOpts)){
		return input;
	}
	
	if (!styleOpts.hasOwnProperty("font") && !styleOpts.hasOwnProperty("background")){
		return input;
	}
	
	
	let textDecorators = [];
	
	if (styleOpts["font"]){
		
		//Get designated color code
		let color = styleOpts["font"]["color"];
		if (ANSIColorCodes[color]){
			textDecorators.push(ANSIColorCodes[color]);
		}
		
		//Check for text modifiers
		if (styleOpts["font"]["modifiers"]){
			let boldOffset = 0;
			for(let i = 0; i < styleOpts["font"]["modifiers"].length; ++i){
				let modifier = styleOpts["font"]["modifiers"][i];								
				if (modifier == "bold" || modifier == "bright"){
					boldOffset = 60;
				}
				textDecorators.push(ANSIModifierCodes[modifier]);
			}
			textDecorators[0] += boldOffset;
		}
	}
	
	if (styleOpts["background"]){
		let backgroundOffset = 10;
		let color = styleOpts["background"]["color"];
		textDecorators.push(ANSIColorCodes[color] + backgroundOffset);
		
		//Check for intensity intensity
		if (styleOpts["background"]["intensity"]){
			let intensity = styleOpts["background"]["intensity"];			
			if (intensity == "bold" || intensity == "bright"){
				textDecorators[textDecorators.length - 1] += 60;
			}
		}
	}
	
	enclosedBy = enclosedBy || "";
	let sequenceIntroducer = "\u001b["; 	// Alternative --> "\033[";
	let sequenceTerminator = "\u001b[0m" + enclosedBy; 	// Alternative --> "\033[0m";
	let styleDirective = sequenceIntroducer + textDecorators.join(';') + "m";
	
	let result = styleDirective + input + sequenceTerminator;
	return result;
}


module.exports = {
	"parseStyle":	parseStyle,
	"ANSIStyler":	ANSIStyler,
};


/*
let s = {
	
	"background": {
		"color": "blue", 
		// "intensity": "bright"
	},
	
	"font": {
		"color": "yellow",
		"modifiers": [
			"bold",
			// "underline",
			// "inverse"
		],
	}
	
};
var result = ANSIStyler("Coloured Text", s);

console.log(result + " | Normal Text");
/**/

// console.log(ANSIStyler("Coloured Output", s));
// console.log("\[\033[0m\]"); //reset
// console.log("\033[0m"); 

// module.exports.parseStyle = parseStyle;
// module.exports.ANSIStyler = ANSIStyler;


















