"use strict";

var parser = require('./parser.js');
var styler = require('./styler.js');

var immutableTokens = [
	"timestamp", "level", "levelNum", "message", "uuid"
];

var nonTokens = {
	"format": true, 
	"output": true,
	"json": true,
	"fields": true,
	"transformer": true,
	"font": true,
	"background": true,
};

var monthsTerse	= [
	'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
];


function loadFormatters(){
	
	// Common/Combined Log Format. See https://httpd.apache.org/docs/1.3/logs.html
	
	//Set Formatters
	this.formatters = {
		"default": {
			"format": "%{level} %{message}"
		},
		"simple": {
			"format": "%{timestamp} %{level} %{message}"
		},
		"common": {
			"defaultSubstitution": "-",
			"timestamp": {"pattern": "%d/%b/%Y:%H:%M:%S %z"},
			"format": '%{remoteIPv4} %{RFC1413identity} %{user} [%{timestamp}] "%{method} %{path} %{protocol}/%{version}" %{statusCode} %{res.contentLength}'
		},
		"combined": {
			"defaultSubstitution": "-",
			"timestamp": {"pattern": "%d/%b/%Y:%H:%M:%S %z"},
			"format": '%{remoteIPv4} %{RFC1413identity} %{user} [%{timestamp}] "%{method} %{path} %{protocol}/%{version}" %{statusCode} %{res.contentLength} %{referer} %{userAgent}'
		},
		"exceptFmt": {
			"format": "%{timestamp} %{level} (%{errorName}) %{message} %{stack}"
		},
		"_level": {
			
		},
	};		
	
	//Object.freeze(this.formatters["_level"]);
	Object.freeze(this.formatters["default"]);
	Object.freeze(this.formatters["simple"]);
	Object.freeze(this.formatters["common"]);
	Object.freeze(this.formatters["combined"]);
	
	Object.defineProperties(this.formatters, {
		"_level": 	{writable: false, enumerable:false, configurable: false},
		"default": 	{writable: false, enumerable:true, configurable: false},
		"simple": 	{writable: false, enumerable:true, configurable: false},
		"common": 	{writable: false, enumerable:true, configurable: false},
		"combined": {writable: false, enumerable:true, configurable: false},
	});
	
	this.predefinedFormatters = Object.keys(this.formatters);
	// console.log(this.formatters); 
	// process.exit();
}

function format(logRecord, formatterName, levelMapper){
	
	//Set Default replacement if token does not map to a value
	let defaultSubstitution = "";
	if (this.formatters[formatterName].hasOwnProperty("defaultSubstitution")){
		defaultSubstitution = this.formatters[formatterName]["defaultSubstitution"];
	}
	
	//Format datetime object according to RFC 3339 (Date and Time on the Internet: Timestamps)
	let rfc3339 = logRecord["DateObj"].getDate() 
		+ " " + monthsTerse[logRecord["DateObj"].getMonth()] 
		+ " " + logRecord["DateObj"].getFullYear() 
		+ " " + logRecord["DateObj"].toTimeString().slice(0, 17).replace("GMT", "");
	
	//No processing necessary for predefined formatters
	if (formatterName == "default"){
		logRecord["output"] = logRecord["level"] + " " + logRecord["message"];
		return logRecord;
	}
	if (formatterName == "simple"){
		logRecord["output"] = rfc3339 + " " + logRecord["level"] + " " + logRecord["message"];
		return logRecord;
	}
	if (formatterName == "common"){
		// logRecord["output"] = logRecord["DateObj"].toString() + " " + logRecord["level"] + " " + logRecord["message"];
		// return logRecord;
	}
	if (formatterName == "combined"){
		// logRecord["output"] = logRecord["DateObj"].toString() + " " + logRecord["level"] + " " + logRecord["message"];
		// return logRecord;
	}
	
	
	//Colorize Severity Levels
	if (this.formatters.hasOwnProperty("_level") &&  this.formatters["_level"].hasOwnProperty("style")){
		logRecord["level"] = styler.ANSIStyler(logRecord["level"], this.formatters["_level"]["style"][levelMapper][logRecord["level"]]);
	}
	
	
	//The timestamp token modifier is a special case
	if (this.formatters[formatterName].hasOwnProperty("timestamp")){
		if (this.formatters[formatterName]["timestamp"]["pattern"].toUpperCase() == "ISO"){
			logRecord["timestamp"] = logRecord["DateObj"].toISOString();
		}
		else{
			let timezone = this.formatters[formatterName]["timestamp"]["timezone"];
			logRecord["timestamp"] = parser.strptime(this.formatters[formatterName]["timestamp"]["pattern"], timezone, logRecord["DateObj"]);
		}
	}
	else{
		logRecord["timestamp"] = rfc3339;
	}
	
	//Process token modifiers
	for (let token in this.formatters[formatterName]){
		
		//Skip formatter commands (i.e. non tokens)
		if (nonTokens.hasOwnProperty(token)){
			continue;
		}
		
		//Check for token transformers
		if (this.formatters[formatterName][token].hasOwnProperty("transformer") && logRecord.hasOwnProperty(token)){
			if (typeof(this.formatters[formatterName][token]["transformer"]) == "function"){
				logRecord[token] = this.formatters[formatterName][token].transformer(logRecord[token]);
			}
			else if (typeof(this.formatters[formatterName]["transformer"]) == "string"){
				let transformerName = this.formatters[formatterName]["transformer"];
				logRecord[token] = this.transformers[transformerName].call(this, logRecord[token]);
			}
		}
		
		//Check for token stylers if output is text string and NOT JSON
		if(this.formatters[formatterName]["json"] == true){
			continue;
		}
		
		if (this.formatters[formatterName][token].hasOwnProperty("font") 
		|| this.formatters[formatterName][token].hasOwnProperty("background")){
			logRecord[token] = styler.ANSIStyler(logRecord[token], this.formatters[formatterName][token]);
		}
	}
	
	//Do custom token substitution
	for (let token in this.customTokens){
		if (this.customTokens.hasOwnProperty(token)){
			logRecord[token] = parser.parsePlaceholders(this.customTokens[token], logRecord, defaultSubstitution);
		}
	}
	
	
	//Create output string
	if(this.formatters[formatterName]["json"] == true){
		//Create JSON output
		logRecord["output"] = JSON.stringify(logRecord, this.formatters[formatterName]["fields"]);
	}
	else if(this.formatters[formatterName].hasOwnProperty("format")){
		//Create text output
		logRecord["output"] = parser.parsePlaceholders(this.formatters[formatterName]["format"], logRecord, defaultSubstitution);
	}
	
	//Run output stylers
	if (this.formatters[formatterName].hasOwnProperty("font") 
	|| this.formatters[formatterName].hasOwnProperty("background")){
		this.formatters[formatterName]["output"] = styler.ANSIStyler(this.formatters[formatterName]["format"], this.formatters[formatterName]);
	}
	
	//Run output Transformers
	if (this.formatters[formatterName].hasOwnProperty("transformer")){
		
		//Convert string to array
		if (typeof(this.formatters[formatterName]["transformer"]) == "string"){
			this.formatters[formatterName]["transformer"] = [this.formatters[formatterName]["transformer"]];
		}
		
		if (Array.isArray(this.formatters[formatterName]["transformer"])){
			for (let i = 0; i < this.formatters[formatterName]["transformer"].length; ++i){
				let transformerName = this.formatters[formatterName]["transformer"][i];
				logRecord["output"] = this.transformers[transformerName].call(this, logRecord["output"]);
			}
		}
	}
	
	return logRecord;
}


function addTokens(tokens){
	
	if (typeof(tokens) != "object" || Array.isArray(tokens)){
		let error = new TypeError("tokens to add must be of type 'object' in the form:\n {'tokenName': 'tokenValue'}");
		throw error;
	}
	
	//Validate Tokens
	for (let token in tokens){
		if (immutableTokens.includes(token)){
			let error = new Error("'" + token + "' is a reserved token and cannot be overridden");
			throw error;
		}
	}
	
	this.customTokens = Object.assign(this.customTokens, tokens);
}

function addFormatter(formatter, parentName){
	
	if (!Array.isArray(formatter)){
		formatter = [formatter];
	}
	
	for (let i = 0; i < formatter.length; ++i){
		
		//Inherit properties from another formatter
		if (typeof(parentName) != "undefined"){
			
			if (typeof(parentName) != "string"){
				let error = new TypeError("Parent formatter must be of type 'string'");
				throw error;
			}
			
			if (this.formatters.hasOwnProperty(parentName)){
				for (let formatterProperty in this.formatters[parentName]){
					if (formatter[i].hasOwnProperty(formatterProperty)){
						continue; //Skip values where child formatter is more recent
					}
					formatter[i][formatterProperty] = this.formatters[parentName][formatterProperty];
				}
			}
			else{
				let error = new Error("'" + parentName + "' is not a valid formatter");
				throw error;
			}
		}
		
		//Validate options
		if(this.validateFormatterOpts(formatter[i])){
			//Save formatter to formatters list
			this.formatters[formatter[i]["name"]] = formatter[i];
			delete formatter[i]["name"];
		}
	}
	
}

function removeFormatter(formatterNames){
	
	if (typeof(formatterNames) == "undefined"){
		return true;
	}
	else if (Array.isArray(formatterNames)){
		for(let i = 0; i < formatterNames.length; ++i){
			if (this.formatters.hasOwnProperty(formatterNames[i])){
				delete this.formatters[formatterNames[i]];
			}
		}
		return true;
	}
	else if (typeof(formatterNames) == "string" && this.formatters.hasOwnProperty(formatterNames)){
		delete this.formatters[formatterNames];
		return true;
	}
	
	return false;
}


function clearFormatters(){
	
	for (let key in this.formatters){
		if (this.formatters.hasOwnProperty(key) && this.predefinedFormatters.indexOf(key) == -1){
			delete this.formatters[key];
		}
	}
	
}


module.exports = {
	
	"loadFormatters": loadFormatters,
	
	"format":			format,
	"addTokens": 		addTokens,
	"addFormatter":		addFormatter,
	"removeFormatter":	removeFormatter,
	"clearFormatters":	clearFormatters,
};