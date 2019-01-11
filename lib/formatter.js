//Manage formatters

const crypto = require("crypto");
var parser = require('./parser.js');
var styler = require('./styler.js');

function loadFormatters(){
	
	// Common/Combined Log Format. See https://httpd.apache.org/docs/1.3/logs.html
	
	//Set Formatters
	this.formatters = {
		"_level": {
			
		},
		"default": {
			"format": "%{level} %{message}"
		},
		"simple": {
			"format": "%{timestamp} %{level} %{message}"
		},
		"common": {
			"defaultSubstitution": "-",
			"timestamp": {"pattern": "%d/%b/%Y:%H:%M:%S %z"},
			"format": '%{remoteIPv4} %{RFC1413identity} %{user} [%{timestamp}] "%{method} %{url} %{protocol}/%{version}" %{statusCode} %{req.contentLength}'
		},
		"combined": {
			"defaultSubstitution": "-",
			"timestamp": {"pattern": "%d/%b/%Y:%H:%M:%S %z"},
			"format": '%{remoteIPv4} %{RFC1413identity} %{user} [%{timestamp}] "%{method} %{url} %{protocol}/%{version}" %{statusCode} %{res.contentLength} %{referer} %{userAgent}'
		}
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
	
	//Create deep copy of logRecord
	// let logRecord = JSON.parse(JSON.stringify(logRecord));
	
	//Return unaltered logRecord if formatter is not defined
	if (!this.formatters.hasOwnProperty(formatterName)){
		return logRecord;
	}
	
	//Color Field Using Color Value Map
	if (this.formatters.hasOwnProperty("statusCode")){
		logRecord["statusCode"] = styler.ANSIStyler(this.formatters["statusCode"], this.formatters["_level"]["style"][levelMapper][logRecord["statusCode"]]);
	}
	if (this.formatters.hasOwnProperty("_level") &&  this.formatters["_level"].hasOwnProperty("style")){
		logRecord["level"] = styler.ANSIStyler(logRecord["level"], this.formatters["_level"]["style"][levelMapper][logRecord["level"]]);
	}
	
	
	//No processing necessary for predefined formatters
	if (formatterName == "default"){
		logRecord["output"] = logRecord["level"] + " " + logRecord["message"];
		return logRecord;
	}
	if (formatterName == "simple"){
		logRecord["output"] = logRecord["DateObj"].toString() + " " + logRecord["level"] + " " + logRecord["message"];
		// logRecord["output"] = logRecord["DateObj"].toString().concat(" ", logRecord["level"], " ", logRecord["message"]);
		return logRecord;
	}
	
	
	//Set Default replacement if token does not map to a value
	let defaultSubstitution = "";
	if (this.formatters[formatterName].hasOwnProperty("defaultSubstitution")){
		defaultSubstitution = this.formatters[formatterName]["defaultSubstitution"];
	}
	
	//Color Line/Background
	if (this.formatters[formatterName].hasOwnProperty("font")){
		this.formatters[formatterName]["format"] = styler.ANSIStyler(this.formatters[formatterName]["format"], this.formatters[formatterName]);
	}
	if (this.formatters[formatterName].hasOwnProperty("background")){
		this.formatters[formatterName]["format"] = styler.ANSIStyler(this.formatters[formatterName]["format"], this.formatters[formatterName]);
	}
	
	
	//Style default Placeholder values
	if (this.formatters[formatterName].hasOwnProperty("stack")){
		logRecord["stack"] = styler.ANSIStyler(logRecord["stack"], this.formatters[formatterName]["stack"]);
	}
	
	if (this.formatters[formatterName].hasOwnProperty("level")){
		let levelName = logRecord["level"];
		logRecord["level"] = styler.ANSIStyler(levelName, this.formatters[formatterName]["level"]);
		if (this.formatters[formatterName]["level"].hasOwnProperty("colorMap")){
			logRecord["level"] = styler.ANSIStyler(levelName, this.formatters[formatterName]["level"]["colorMap"][levelName]);
		}
	}
	
	if (this.formatters[formatterName].hasOwnProperty("message")){
		logRecord["message"] = styler.ANSIStyler(logRecord["message"], this.formatters[formatterName]["message"]);
	}
	
	//Create timestamp token from Javascript Date Object
	logRecord["timestamp"] = logRecord["DateObj"].toLocaleString();
	if (this.formatters[formatterName].hasOwnProperty("timestamp")){
		// console.log("timezone: ", this.formatters[formatterName]["timestamp"]);
		//Formate timestamp according to pattern
		if (this.formatters[formatterName]["timestamp"].hasOwnProperty("pattern")){
			if (this.formatters[formatterName]["timestamp"]["pattern"] == "ISO"){
				logRecord["timestamp"] = logRecord["DateObj"].toISOString();
			}
			else{
				let timezone = this.formatters[formatterName]["timestamp"]["timezone"];
				logRecord["timestamp"] = parser.strptime(this.formatters[formatterName]["timestamp"]["pattern"], timezone, logRecord["DateObj"]);
			}
		}
		
		//Style Datetime string
		logRecord["timestamp"] = styler.ANSIStyler(logRecord["timestamp"], this.formatters[formatterName]["timestamp"]);
	}
	
	//Add and Style user defined tokens
	for (token in this.customTokens){
		if (this.customTokens.hasOwnProperty(token)){
			logRecord[token] = parser.parsePlaceholders(this.customTokens[token], logRecord, defaultSubstitution);
			logRecord[token] = styler.ANSIStyler(logRecord[token], this.formatters[formatterName][token]);
		}
	}
	
	//Fields property overrides and dictates what will appear in logRecord
	if(this.formatters[formatterName].hasOwnProperty("fields")){
		for (key in logRecord){
			if (!this.formatters[formatterName]["fields"].includes(key) && key != "DateObj"){
				delete logRecord[key];
			}
		}
	}
	
	
	//Transform individual Tokens
	for (token in this.formatters[formatterName]){
		
		if (this.formatters[formatterName][token].hasOwnProperty("transformer") && logRecord.hasOwnProperty(token)){
			if (typeof(this.formatters[formatterName][token]["transformer"]) == "function"){
				logRecord[token] = this.formatters[formatterName][token].transformer(logRecord[token]);
			}
			else if (typeof(this.formatters[formatterName]["transformer"]) == "string"){
				transformerName = this.formatters[formatterName]["transformer"];
				logRecord[token] = this.transformers[transformerName].call(this, logRecord[token]);
			}
		}
	}	
	
	
	//If json ignore replacing tokens in format string
	if(this.formatters[formatterName].hasOwnProperty("json")){
		//Delete DateObj to prevent stringification
		let temp = logRecord["DateObj"];
		delete logRecord["DateObj"];
		logRecord["output"] = JSON.stringify(logRecord);
		
		//Add DateObj back to logRecord of type 'Javascript Object'
		logRecord["DateObj"] = temp;
	}
	else if(this.formatters[formatterName].hasOwnProperty("format")){
		logRecord["output"] = parser.parsePlaceholders(this.formatters[formatterName]["format"], logRecord, defaultSubstitution);
	}
	
	//Transform formatted output
	if (this.formatters[formatterName].hasOwnProperty("transformer")){
		
		//Convert string to array
		if (typeof(this.formatters[formatterName]["transformer"]) == "string"){
			this.formatters[formatterName]["transformer"] = [this.formatters[formatterName]["transformer"]];
		}
		
		if (Array.isArray(this.formatters[formatterName]["transformer"])){
			for (let i = 0; i < this.formatters[formatterName]["transformer"].length; ++i){
				let transformerName = this.formatters[formatterName]["transformer"][i];
				logRecord["output"] = this.transformers[transformerName].call(this, logRecord);
			}
		}
	}
	
	//Return Log Record
	return logRecord;
}


function addTokens(tokens){
	
	if (typeof(tokens) != "object" || Array.isArray(tokens)){
		let error = new TypeError("tokens to add must be of type 'object' in the form:\n {'tokenName': 'tokenValue'}");
		throw error;
	}
	
	var immutableTokens = ["timestamp", "level", "message", "uuid"];
	
	//Validate Tokens
	for (token in tokens){
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
	
	for (key in this.formatters){
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