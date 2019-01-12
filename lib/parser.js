"use strict";

let daysTerse	= ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
let days		= ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
let monthsTerse	= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
let months 		= ['January','February','March','April','May','June','July','August','September','October','November','December'];

function secondsToHM(seconds){
	
	let prefix = "-";
	
	if (seconds < 0){
		prefix = "+";
		seconds = -seconds;
	}
	
	return prefix + (new Date(seconds * 1000).toISOString().substr(11, 5).replace(":", "")); // clf format
	// return prefix + (new Date(seconds * 60000).toISOString().substr(11, 8)); // python format
}

function strptime(patternStr, timezone, dateObj){
	
	if (typeof(patternStr) != "string"){
		return patternStr;
	}
	
	dateObj = dateObj || new Date();
	let timezoneOffset = secondsToHM(dateObj.getTimezoneOffset() * 60);
	
	if(timezone == "GMT" || timezone == "UTC"){
		return patternStr.replace(/([^%])%Y|^(%Y)/gm, "$1" + dateObj.getUTCFullYear())
			.replace(/([^%])%y|^(%Y)/gm, "$1" + dateObj.getUTCFullYear().toString().substr(2,2))
			.replace(/([^%])%m|^(%Y)/gm, "$1" + (dateObj.getUTCMonth() + 1).toString().padStart(2, '0'))
			.replace(/([^%])%d|^(%Y)/gm, "$1" + dateObj.getUTCDate().toString().padStart(2, '0'))
			.replace(/([^%])%w|^(%Y)/gm, "$1" + dateObj.getUTCDay().toString().padStart(2, '0'))
			.replace(/([^%])%H|^(%Y)/gm, "$1" + dateObj.getUTCHours().toString().padStart(2, '0'))
			.replace(/([^%])%I|^(%I)/gm, "$1" + ((dateObj.getUTCHours() <= 12) ? dateObj.getUTCHours() : dateObj.getUTCHours() % 12).toString().padStart(2, '0'))
			.replace(/([^%])%M|^(%Y)/gm, "$1" + dateObj.getUTCMinutes().toString().padStart(2, '0'))
			.replace(/([^%])%S|^(%Y)/gm, "$1" + dateObj.getUTCSeconds().toString().padStart(2, '0'))	
			.replace(/([^%])%B|^(%B)/gm, "$1" + months[dateObj.getUTCMonth()])
			.replace(/([^%])%b|^(%b)/gm, "$1" + monthsTerse[dateObj.getUTCMonth()])
			.replace(/([^%])%A|^(%A)/gm, "$1" + days[dateObj.getUTCDay()])
			.replace(/([^%])%a|^(%a)/gm, "$1" + daysTerse[dateObj.getUTCDay()])
			.replace(/([^%])%z|^(%z)/gm, "$1" + "+0000")
			.replace(/%%/gm, "%");
	}
	
	return patternStr.replace(/([^%])%Y|^(%Y)/gm, "$1" + dateObj.getFullYear())
		.replace(/([^%])%y|^(%y)/gm, "$1" + dateObj.getFullYear().toString().substr(2,2))
		.replace(/([^%])%m|^(%m)/gm, "$1" + (dateObj.getMonth() + 1).toString().padStart(2, '0'))
		.replace(/([^%])%d|^(%d)/gm, "$1" + dateObj.getDate().toString().padStart(2, '0'))
		.replace(/([^%])%w|^(%w)/gm, "$1" + dateObj.getDay().toString().padStart(2, '0'))
		.replace(/([^%])%H|^(%H)/gm, "$1" + dateObj.getHours().toString().padStart(2, '0'))
		.replace(/([^%])%I|^(%I)/gm, "$1" + ((dateObj.getHours() <= 12) ? dateObj.getHours() : dateObj.getHours() % 12).toString().padStart(2, '0'))
		.replace(/([^%])%M|^(%M)/gm, "$1" + dateObj.getMinutes().toString().padStart(2, '0'))
		.replace(/([^%])%S|^(%S)/gm, "$1" + dateObj.getSeconds().toString().padStart(2, '0'))
		.replace(/([^%])%B|^(%B)/gm, "$1" + months[dateObj.getMonth()])
		.replace(/([^%])%b|^(%b)/gm, "$1" + monthsTerse[dateObj.getMonth()])
		.replace(/([^%])%A|^(%A)/gm, "$1" + days[dateObj.getDay()])
		.replace(/([^%])%a|^(%a)/gm, "$1" + daysTerse[dateObj.getDay()])
		.replace(/([^%])%z|^(%z)/gm, "$1" + timezoneOffset)
		.replace(/%%/gm, "%");
		
}

function parsePlaceholders(patternStr, obj, defaultSubstitution){
	
	if (typeof(patternStr) != "string" || (typeof(obj) != "object" || Array.isArray(obj))){
		return patternStr;
	}
	
	defaultSubstitution = defaultSubstitution || "";
	
	//Create copy of obj (so the actual logRecord is not altered)
	let tokenObj = {};
	for (let token in obj){
		tokenObj[token] = obj[token];
	}
	
	let patt = /%{(.+?)}/g;
	let placeholdersInString = [];
	
	let result;
	while((result = patt.exec(patternStr)) != null){
		let token = result[1]; // eslint-disable-line
		if(placeholdersInString.indexOf(token) == -1){
			placeholdersInString.push(token);
			if (!tokenObj.hasOwnProperty(token) || typeof(tokenObj[token]) == "undefined"){
				tokenObj[token] = defaultSubstitution;
			}
		}
	}
	
	//Check tokenObj for tokens to replace or until there are no more placeholders
	for (let token in tokenObj){
		let tokenIndex = placeholdersInString.indexOf(token);		
		if (tokenIndex != -1){
			
			/*/Parse dotted tokens
			if (token.indexOf(".") != -1){
				console.log(token);
				let matches = /(re(?:q|s))\.([a-z]+)([A-Z]\w+)?/.exec(token);
				if (matches[2] && tokenObj.hasOwnProperty(matches[1])){
					let header = matches[2].replace(matches[2].charAt(0), matches[2].charAt(0).toUpperCase());
					header += "-" + matches[3];
					console.log(matches[1]);
					console.log(matches);
					tokenObj[token] = tokenObj[matches[1]][header]
				}
				
				console.log(tokenObj[matches[1]]); 
				console.log(matches); 
				console.log(token, header, tokenObj[token]); 
				process.exit();
				tokenObj[token] = 
			}
			/**/
			
			patternStr = patternStr.replace(new RegExp("([^%])%{"+token+"}|^%{"+token+"}", "g"), "$1" + tokenObj[token]);
			placeholdersInString.splice(tokenIndex, 1);
		}
		if (placeholdersInString.length == 0){ break; }
	}
	
	//Remove any left over double %% and return
	return patternStr.replace(/%%/gm, "%");
}


module.exports = {
	"strptime": strptime,
	"parsePlaceholders": parsePlaceholders
};





