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


function implementStyle(formatterName){
	
	//Create base format to transmutate
	let _format = this.formatters[formatterName]["format"];
	
	//Create output wide style enclosure (should be moved to styler.js)
	let enclosure = "";
	if (this.formatters[formatterName].hasOwnProperty("font") 
	|| this.formatters[formatterName].hasOwnProperty("background")){
		//style ONLY if format is not JSON
		let ANSISequenceTerminator = "\u001b[0m";
		if(this.formatters[formatterName]["json"] != true){
			enclosure = styler.ANSIStyler(enclosure, this.formatters[formatterName]).replace("\u001b[0m", "");
			_format = _format.replace("%{level}", "%{level}" + enclosure);
			_format = enclosure + _format + ANSISequenceTerminator;
		}
	}
	
	//Create style for individual token
	for (let token in this.formatters[formatterName]){
		
		//Do not style json output
		if(this.formatters[formatterName]["json"] == true){
			break;
		}
		
		//Skip formatter commands (i.e. non tokens)
		if (nonTokens.hasOwnProperty(token)){
			continue;
		}
		
		if (this.formatters[formatterName][token].hasOwnProperty("font") 
		|| this.formatters[formatterName][token].hasOwnProperty("background")){
			_format = _format.replace("%{" + token + "}", styler.ANSIStyler("%{" + token + "}", this.formatters[formatterName][token], enclosure));
		}
	}
	
	return _format;
}

function substituteTokens(targetFormat){
	
	// prepared string uses single quotes, therefore user defined single quotes MUST be escaped
	targetFormat = targetFormat.replace(/'/gm, "\\'");

	//Prepare format to be used for raw evaluation via eval()
	let substitutionPatt = /(?<=[^%]|^)%{(.+?)}/gm;
	let substituted = '\'' + targetFormat.replace(substitutionPatt, "' + logRecord['$1'] + '") + '\'';
	substituted = substituted.replace("%%", "%");
	
	return substituted;
}

function bindTransformers(formatterName, targetStr){
	
	for (let token in this.formatters[formatterName]){
		if (this.formatters[formatterName][token].hasOwnProperty("transformer")){
			if (typeof(this.formatters[formatterName][token]["transformer"]) == "function"){
				targetStr = targetStr.replace(
					RegExp("\\+\\s(logRecord\\['" + token + "'\\])", "g"), 
					"+ this.formatters[formatterName]['" + token + "']['transformer'].call(this, $1)"
				);
			}
			else if (Array.isArray(this.formatters[formatterName][token]["transformer"])){
				this.formatters[formatterName][token]["transformer"].forEach(function(transformerName){
					targetStr = targetStr.replace(
					RegExp("\\+\\s(logRecord\\['" + token + "'\\])", "g"), 
						"+ this.transformers['" + transformerName + "'].call(this, $1)"
					);
				});
			}
		}
	}
	
	return targetStr;
}

function compile(formatterName){
	
	let styled = this.implementStyle(formatterName);
	let substituted = this.substituteTokens(styled);
	let binded = this.bindTransformers(formatterName, substituted);;
	let result = binded;
	
	return result;
}


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
		"_levelStyle": {
			
		},
	};		
	
	//Object.freeze(this.formatters["_level"]);
	Object.freeze(this.formatters["default"]);
	Object.freeze(this.formatters["simple"]);
	Object.freeze(this.formatters["common"]);
	Object.freeze(this.formatters["combined"]);
	
	Object.defineProperties(this.formatters, {
		"_levelStyle": {writable: true, enumerable:true, configurable: false},
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
	
	//Merge custom tokens into logRecord
	Object.assign(logRecord, this.customTokens);
	
	//Defined default Substitute undefined variables
	let defaultSubstitution = this.formatters[formatterName]["defaultSubstitution"] || "";
	
	//Check logRecord for missing/expected values
	let tokenCheck = null;
	let patt = /(?<=[^%]|^)%{(.+?)}/gm; //patt must not be dedined in loop else will run continuously
	while ((tokenCheck = patt.exec(this.formatters[formatterName]["format"])) != null){
		logRecord[tokenCheck[1]] = logRecord[tokenCheck[1]] || defaultSubstitution;
	}
	
	//The timestamp token modifier is a special case
	if (this.formatters[formatterName].hasOwnProperty("timestamp") 
	&& this.formatters[formatterName]["timestamp"].hasOwnProperty("pattern")){
		if (this.formatters[formatterName]["timestamp"]["pattern"].toUpperCase() == "ISO"){
			logRecord["timestamp"] = logRecord["DateObj"].toISOString();
		}
		else{
			let timezone = this.formatters[formatterName]["timestamp"]["timezone"];
			logRecord["timestamp"] = parser.strptime(this.formatters[formatterName]["timestamp"]["pattern"], timezone, logRecord["DateObj"]);
		}
	}
	else{
		//Format datetime object according to RFC 3339 (Date and Time on the Internet: Timestamps)
		let rfc3339 = logRecord["DateObj"].getDate()
			+ " " + monthsTerse[logRecord["DateObj"].getMonth()]
			+ " " + logRecord["DateObj"].getFullYear() 
			+ " " + logRecord["DateObj"].toTimeString().slice(0, 17).replace("GMT", "");
		logRecord["timestamp"] = rfc3339;
	}
	
	let compiled = this.compile(formatterName);
	
	//Colorize Severity Levels
	if (this.formatters["_levelStyle"][levelMapper]){ 
		if (typeof(this.formatters[formatterName]["level"]) == "undefined"
		|| (typeof(this.formatters[formatterName]["level"]["font"]) == "undefined" 
		&& typeof(this.formatters[formatterName]["level"]["background"]) == "undefined")){
			let rawStyle = styler.ANSIStyler("<dummy>", this.formatters["_levelStyle"][levelMapper][logRecord["level"]]);
			let enclosure = rawStyle.split("<dummy>");
			let levelStyle = "'" + enclosure[0] + "' + logRecord['level'] + '" + enclosure[0] + "\u001b[0m'";
			compiled = compiled.replace("logRecord['level']", levelStyle);
		}
	}
	
	//Create JSON or Text output
	if(this.formatters[formatterName]["json"] == true){
		logRecord["output"] = JSON.stringify(logRecord, this.formatters[formatterName]["fields"]);
	}
	else if(this.formatters[formatterName].hasOwnProperty("format")){
		
		//Create Text Output
		logRecord["output"] = eval(compiled);
		
		//Run output Transformers
		if (Array.isArray(this.formatters[formatterName]["transformer"])){
			let self = this;
			this.formatters[formatterName]["transformer"].forEach(function(transformerName){
				//Transformers that cause uppercase causes errors with colors. Convert them back to lowercase via regex
				let reg = /(?<=\[\d+|;\d+)M/g; 
				logRecord["output"] = self.transformers[transformerName].call(self, logRecord["output"]).replace(reg, "m");
			});
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

function removeTokens(tokenNames){
	
	if (typeof(tokenNames) == "undefined"){
		return true;
	}
	else if (Array.isArray(tokenNames)){
		for(let i = 0; i < tokenNames.length; ++i){
			if (this.customTokens.hasOwnProperty(tokenNames[i])){
				delete this.customTokens[tokenNames[i]];
			}
		}
		return true;
	}
	else if (typeof(tokenNames) == "string" && this.customTokens.hasOwnProperty(tokenNames)){
		delete this.customTokens[tokenNames];
		return true;
	}
	
	return false;
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
			let formatterName = formatter[i]["name"]
			this.formatters[formatterName] = formatter[i];
			
			//No longer need name
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
	
	"compile": compile,
	"substituteTokens": substituteTokens,
	"bindTransformers": bindTransformers,
	"implementStyle": implementStyle,
	"loadFormatters": loadFormatters,
	
	"format":			format,
	"addTokens": 		addTokens,
	"addFormatter":		addFormatter,
	"removeFormatter":	removeFormatter,
	"clearFormatters":	clearFormatters,
};