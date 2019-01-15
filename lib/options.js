"use strict";

var path = require('path');
var http = require('http');
var https = require('https');
var urlUtil = require("url");

var tool = require("./tools");
var styler = require('./styler.js');

//Set Defaults
var DEFAULT_TARGET = "console";	
var DEFAULT_EXTENSION = ".log";
var DEFAULT_USER_AGENT = "Remote Logger";

//Set range of valid option values
var validFormatterOpts = [
	"name", "transformer", "colorMap", "background", "font", "style",
	"defaultSubstitution", "format", "json", "fields",
	"uuid", "timestamp", "message", "level",
];
var validHandleOpts = [
	"name", "active","level", "levelMapper", "formatter", "filter", "target", 
	"path", "directory", "fileName", "fileExtension", "fileNamePattern",
	"rotationType", "interval", "rotateDay",
	"maxFiles", "maxSize",
	"url", "port", "method", "headers",
	"emitEvents", 
];
var validIntervals = [
	"year", "month", "week", "day", "hour", "minute", "second"
];
var validRotationTypes = [
	"interval", "size"
];

var predefinedTargets = [
	null, "console", "file", "rotatingFile", "http"
];

//Validate Options
function validateHandleOpts(opts){
	
	//Check if handle is valid (Misses case when handle is {"handleName": []})
	if (typeof(opts) != "object" || Array.isArray(opts)){
		let error = new Error('Handle must be of type object in the form --> {name: handleName, "handleProperty1": "value1", "handleProperty2": "value2"}');
		throw error;
	}
	
	//Check if handle option names are valid if NOT using a custom target
	if (predefinedTargets.indexOf(opts["target"]) != -1){
		for (let key in opts){
			if (opts.hasOwnProperty(key) && !validHandleOpts.includes(key)){
				let error = new Error("'" + key + "' is not a valid handle option. Suggestion: Check your spelling or homepage for list of valid options");
				throw error;
			}
		}
	}
	
	//Check if handle option values are valid
	if (!opts.hasOwnProperty("name")){
		let error = new Error("Handle must have a 'name' option defined");
		throw error;
	}
	else{
		if (typeof(opts["name"]) != "string"){
			let error = new TypeError("handle name must be of type 'string'");
			throw error;
		}
		if (opts["name"] == "default"){
			let error = new Error("Cannot alter properties of 'default' handler");
			throw error;
		}
	}
	
	if (opts.hasOwnProperty("active")){
		if (typeof(opts.active) == "string"){
			if (opts["active"] == "true"){
				opts["active"] = true;
			}
			else if (opts["active"] == "false"){
				opts["active"] = false;
			}
		}
		if (typeof(opts.active) != "boolean" && typeof(opts.active) != "number" ){
			let err = new TypeError("Expected 'active' option to be of type 'Boolean' or type 'Number'");
			throw err;
		}
	}
	
	if (opts.hasOwnProperty("levelMapper")){
		if (!this.levelMappings.hasOwnProperty(opts["levelMapper"])){
			let err = new TypeError("'" + opts["levelMapper"] + "' does not have a valid levels mapping");
			throw err;
		}
	}
	
	if (opts.hasOwnProperty("level")){
		if (typeof(opts.level) == "number"){ /* To Code */ }
		if (opts.hasOwnProperty("levelMapper") && !this.levelMappings[opts["levelMapper"]].hasOwnProperty(opts["level"])){
			let err = new TypeError("'" + opts["level"] + "' is not a valid level for the '" + opts["levelMapper"] + "' mapper");
			throw err;
		}
		else if (!opts.hasOwnProperty("levelMapper") && !this.levelMappings[this.levelMapper].hasOwnProperty(opts["level"])){
			let err = new TypeError("'" + opts["level"] + "' is not a valid log level.\nUse a custom or predefined level mapping value.");
			throw err;
		}
	}
	
	if (opts.hasOwnProperty("formatter")){
		if (typeof(opts["formatter"]) == "string"){
			if (!this.formatters.hasOwnProperty(opts["formatter"])){
				let error = new Error("Formatter '" + opts["formatter"] + "' is not defined");
				throw error;
			}
		}
		else if ((typeof(opts["formatter"]) != "object" || Array.isArray(opts["formatter"]))){
			let error = new Error("Formatter must be a named formatter of type 'string' or defined on the fly via an 'object' definition.");
			throw error;
		}
		else{
			let formatterName = opts["formatter"]["name"];
			this.addFormatter(opts["formatter"]);
			opts["formatter"] = formatterName;
		}
	}
	
	
	if (opts.hasOwnProperty("path")){
		
		if (typeof(opts["path"]) != "string"){
			let err = new TypeError("Expected path option to be of type 'string'");
			throw err;
		}
		
		opts["path"] = opts["path"].trim();
	}
	
	if (opts.hasOwnProperty("directory")){
		
		if (typeof(opts["directory"]) != "string"){
			let err = new TypeError("Expected directory option to be of type 'string'");
			throw err;
		}
		
		opts["directory"] = opts["directory"].trim();
		if (opts["directory"].charAt(0) == "."){
			opts["directory"] = path.join(process.cwd(), opts["directory"] + path.sep);
		}
		else if (opts["directory"].charAt(0) != path.sep){
			opts["directory"] = path.join(process.cwd(), opts["directory"] + path.sep);
		}
		
		if (opts["directory"].charAt(opts["directory"].length - 1) != path.sep){
			opts["directory"] += path.sep;
		}
		
		//Make Directory if it doesn't exists
		tool.mkDirByPathSync(opts["directory"]);
	}
	
	if (opts.hasOwnProperty("fileName")){
		
		if (typeof(opts["fileName"]) != "string"){
			let err = new TypeError("Expected fileName option to be of type 'string'");
			throw err;
		}
		
		opts["fileName"] = opts["fileName"].trim();
		if (opts["fileName"].indexOf(" ") != -1){
			let error = new Error("The option 'fileName' cannot contain spaces/blanks");
			throw error;
		}
		
	}
	
	if (opts.hasOwnProperty("fileNamePattern")){
		
		if (typeof(opts["fileNamePattern"]) != "string"){
			let err = new TypeError("Expected fileNamePattern option to be of type 'string'");
			throw err;
		}
		
		opts["fileNamePattern"] = opts["fileNamePattern"].trim();
		if (opts["fileNamePattern"].indexOf(" ") != -1){
			let error = new Error("The option 'fileNamePattern' cannot contain spaces/blanks");
			throw error;
		}
	}
	
	if (opts.hasOwnProperty("fileExtension")){
		if (typeof(opts["fileExtension"]) != "string"){
			let err = new TypeError("fileExtension must be of type 'string'");
			throw err;
		}
		
		opts["fileExtension"] = opts["fileExtension"].trim();
		if (opts["fileExtension"].indexOf(".") == -1){
			let err = new Error("fileExtension must include a '.' (period/dot)");
			throw err;
		}
	}
	
	if (opts.hasOwnProperty("target")){
		
		//Assign 'function' target a name and register it using addTarget
		if (typeof(opts["target"]) == "function"){
			let targetName = "_" + opts["name"];
			this.addTarget(targetName, opts["target"]);
			opts["target"] = targetName;
		}
		else if (typeof(opts["target"]) == "string"){
			opts["target"] = (opts["target"].toLowerCase() == "null") ? null : opts["target"];
		}
		// console.log(!this.targets.hasOwnProperty(opts["target"]), predefinedTargets.indexOf(opts["target"]) == -1);
		if (!this.targets.hasOwnProperty(opts["target"]) && predefinedTargets.indexOf(opts["target"]) == -1){
			let err = new Error("'" + opts["target"] + "' is not a valid target");
			throw err;
		}
		
		if (opts["target"] == "rotatingFile"){
			if (!opts.hasOwnProperty("rotationType")){
				
				let err = Error(
					"Rotation options too ambiguous. \n" +
					"Please select options specific to a rotation type (e.g. interval or maxFiles/maxSize) or explicitly use the 'rotationType' option\n"
				);
				
				if (!opts.hasOwnProperty("interval") && !opts.hasOwnProperty("maxSize") && !opts.hasOwnProperty("maxFiles")){
					throw err;
				}
				if (opts.hasOwnProperty("interval") && (opts.hasOwnProperty("maxSize") || opts.hasOwnProperty("maxFiles"))){
					throw err;
				}
			}
		}
		
		if (opts["target"] == "http"){
			
			if (!opts.hasOwnProperty("url")){
				let err = Error("the HTTP target requires a url to be defined");
				throw err;
			}
			
			if (opts.hasOwnProperty("port")){
				opts["port"] = parseInt(opts["port"]);
				if (typeof(opts["port"]) != "number" || isNaN(opts["port"])){
					let err = Error("http port must be of type 'number'");
					throw err;
				}
			}
			
			if (opts.hasOwnProperty("method")){
				
				if (typeof(opts["method"]) != "string"){
					let err = Error("http method must be of type string");
					throw err;
				}
				
				opts["method"] = opts["method"].toUpperCase();
				if (opts["method"] != "GET" && opts["method"] != "POST"){
					let err = Error("http method must be either GET or POST");
					throw err;
				}
			}
			
			if (opts.hasOwnProperty("headers")){
				if (typeof(opts["headers"]) != "object" || Array.isArray(opts["headers"])){
					let err = Error("headers must be of type 'object'");
					throw err;
				}
			}
		}
	}
	
	if (opts.hasOwnProperty("rotationType")){
		if (!validRotationTypes.includes(opts.rotationType)){
			let err = new Error("Invalid rotation type: '" + opts["rotationType"] + "'");
			throw err;
		}
	}
	
	if (opts.hasOwnProperty("interval")){
		
		let dayIndex = {
			"sunday": 0, "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4,"friday": 5, "saturday": 6,
			"sun": 0, "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6,
		};
		
		if (!validIntervals.includes(opts["interval"])){
			let err = new Error("Invalid rotation interval: '" + opts["interval"] + "'");
			throw err;
		}
		
		if (opts["interval"] == "week" && opts.hasOwnProperty("rotateDay")){
			if (!Object.keys(dayIndex).includes(opts["rotateDay"].toLowerCase())){
				let err = new Error("Invalid rotation day: '" + opts["rotateDay"] + "'");
				throw err;
			}
		}
	}
	
	if (opts.hasOwnProperty("maxSize")){
		
		// eslint-disable-next-line no-useless-escape
		var sizePatt = /([\d\.]+)\s*([KMGT]?B)?/i;
		let matches = sizePatt.exec(opts["maxSize"]);

		let units = "B";
		if (typeof(matches[2]) != "undefined"){
			units = matches[2].toUpperCase();
		}

		let size = matches[1];
		if (typeof(matches[1]) == "undefined"){
			let err = new Error("Expected maxSize to be of type 'number' for Bytes or type 'string' with size and units");
			throw err;
		}

		let unitsScaler = {
			"B" : 1,
			"KB": 1024,
			"MB": 1048576,
			"GB": 1073741824,
			"TB": 1099511627776,
		};

		opts["maxSize"] = parseFloat(size) * unitsScaler[units];
	}
	
	if (opts.hasOwnProperty("maxFiles")){
		if(typeof(opts["maxFiles"]) == "string"){
			opts["maxFiles"] = parseInt(opts["maxFiles"]);
		}
		if (typeof(opts["maxFiles"]) != "number"){
			let err = new Error("Expected 'maxFiles' to be of type 'number'");
			throw err;
		}
	}
	
	if (opts.hasOwnProperty("filter")){
		
		if(typeof(opts["filter"]) == "string"){
			opts["filter"] = opts["filter"].split(" ");
		}
		
		if (!Array.isArray(opts["filter"]) && typeof(opts["filter"]) != "function" && typeof(opts["filter"]) != "object"){
			let errMsg = "Expected filter of type 'function' or of type 'string' or an array of string types\n" + 
						"Instead received type: " + typeof(opts["filter"]);
			let error = new TypeError(errMsg);
			throw error;
		}
		
		if (typeof(opts["filter"]) == "object" && !Array.isArray(opts["filter"])){
			let keys = Object.keys(opts["filter"]);
			if (keys.length != 1){
				let err = new Error("Expected filter property to have a single property defined");
				throw err;
			}
			else{
				let filterName = keys[0];
				if(!this.filters.hasOwnProperty(filterName)){
					let error = new Error("The filter '" + filterName + "' has not been defined!");
					throw error;
				}
			}
		}
		
		if(Array.isArray(opts["filter"])){
			opts["filter"].forEach(function(filter){
				if(!this.filters.hasOwnProperty(filter)){
					let error = new Error("The filter '" + filter + "' has not been defined!");
					throw error;
				}
			}, this);
		}
	}
	
	return true;
}

function validateFormatterOpts(opts){
	
	if (typeof(opts) != "object" || Array.isArray(opts)){
		let error = new Error('formatter must be of type object in the form --> {name: formatterName, "formatterProperty1": "value1", "formatterProperty2": "value2"}');
		throw error;
	}
	
	//Check if formatter option names are valid
	for (let key in opts){
		if (opts.hasOwnProperty(key) && !validFormatterOpts.includes(key)){
			let error = new Error("'" + key + "' is not a valid formatter option. Suggestion: Check your spelling or homepage for list of valid options");
			throw error;
		}
	}
	
	//Ensure the formatter has an appropriate name
	if (!opts.hasOwnProperty("name")){
		let error = new Error("The formatter must have a 'name' option defined");
		throw error;
	}
	else {
		if (typeof(opts["name"]) != "string"){
			let error = new TypeError("formatter name must be of type 'string'");
			throw error;
		}
		if (opts["name"] == "default"){
			let error = new Error('The default formatter is internally defined and CANNOT be altered');
			throw error;
		}
	}
	
	if (opts.hasOwnProperty("style")){
		Object.assign(opts, styler.parseStyle(opts["style"]));
		delete opts["style"];
	}
	
	
	if (opts.hasOwnProperty("format")){
		if (typeof(opts["format"]) != "string"){
			let err = new TypeError("Format must be of type 'string'");
			throw err;
		}
	}
	
	if (opts.hasOwnProperty("json") && !opts.hasOwnProperty("fields")){
		let error = new TypeError(
			"When using JSON format, a list of desired fields must be stated in the formatter's fields property. " +
			"\nE.g. {name: formatterName, 'json': true, fields: [timestamp, level, message]"
		);
		throw error;
	}
	
	if (opts.hasOwnProperty("transformer")){
		
		if (typeof(opts["transformer"]) == "function"){
			let transformerName = "_" + opts["name"];
			this.addTransformer(transformerName, opts["transformer"]);
			opts["transformer"] = transformerName;
		}
		
		if(typeof(opts["transformer"]) != "string" && !Array.isArray(opts["transformer"])){
			let errMsg = "Expected transformer to be of type 'function' or type 'string' or array of string types\n" + 
						"Instead received type: " + typeof(opts["transformer"]);
			let error = new TypeError(errMsg);
			throw error;
		} 
		
		if(typeof(opts["transformer"]) == "string"){
			opts["transformer"] = opts["transformer"].split(" ");
		}
		
		if(Array.isArray(opts["transformer"])){
			opts["transformer"].forEach(function(transformer){
				if(!this.transformers.hasOwnProperty(transformer)){
					let error = new Error("The transformer '" + transformer + "' has not been defined!");
					throw error;
				}
			}, this);
		}
		
	}
	
	
	//Validate Individual Token Transformers
	for (let token in opts){
		if (opts[token].hasOwnProperty("transformer")){
			
			if(typeof(opts[token]["transformer"]) != "string" && typeof(opts[token]["transformer"]) != "function" && !Array.isArray(opts[token]["transformer"])){
				let errMsg = "Expected transformer to be of type 'function' or type 'string' or array of string types\n" + 
							"Instead received type: " + typeof(opts[token]["transformer"]);
				let error = new TypeError(errMsg);
				throw error;
			}
			
			if(typeof(opts[token]["transformer"]) == "string"){
				opts[token]["transformer"] = opts[token]["transformer"].split(" ");
			}
			
			if(Array.isArray(opts[token]["transformer"])){
				opts[token]["transformer"].forEach(function(transformer){
					if(!this.transformers.hasOwnProperty(transformer)){
						let error = new Error("The transformer '" + transformer + "' has not been defined!");
						throw error;
					}
				}, this);
			}
		}
	}
	
	return true;
}

//Set/Modify Options
function setHandleOpts(opts, handleNames){
	
	if (typeof(opts) != "object" || Array.isArray(opts)){
		let error = new TypeError("expected 1st parameter of type 'object'");
		throw error;
	}
	
	if (Object.keys(opts).length === 0 && opts.constructor === Object){
		return;
	}
	
	//Recursively call setHandleOpts if given a list of handles
	if (Array.isArray(handleNames)){
		
		//Let the name be defined through array loop
		if (opts.hasOwnProperty("name")){
			if(!handleNames.includes(opts["name"])){
				handleNames.push(opts["name"]);
			}
			delete opts["name"];
		}
		
		for (let i = 0; i < handleNames.length; ++i){
			this.setHandleOpts(opts, handleNames[i]);
		}
		return;
	}
	
	let handleName = handleNames;
	if (opts.hasOwnProperty("name")){
		handleName = opts["name"];
	}
	
	if (typeof(handleName) == "undefined"){
		let error = new Error('Desired handle to change is ambiguous. Specify the handle(s) to change in the second argument');
		throw error;
	}
	
	
	//Validate options
	opts["name"] = handleName; //Opts must have a name to pass validator
	if(this.validateHandleOpts(opts)){
		//name is not needed when saved to handles list
		delete opts["name"]; 
		
		//Modify designated options
		for (let key in opts){
			this.handles[handleName][key] = opts[key];
		}
		
		this.setHandleDefaults(this.handles[handleName]);
	}
	
}

function setFormatterOpts(opts, formatterNames){
	
	//Recursively call setHandleOpts if given a list of formatters
	if (Array.isArray(formatterNames)){
		
		//Let the name be defined through array loop
		if (opts.hasOwnProperty("name")){
			if(!formatterNames.includes(opts["name"])){
				formatterNames.push(opts["name"]);
			}
			delete opts["name"];
		}
		
		for (let i = 0; i < formatterNames.length; ++i){
			this.setFormatterOpts(opts, formatterNames[i]);
		}
		return;
	}
	
	let formatterName = formatterNames;
	if (opts.hasOwnProperty("name")){
		formatterName = opts["name"];
	}
	
	if (typeof(formatterName) == "undefined"){		
		let error = new Error('Please specify the name of the formatter you will like to set options on');
		throw error;
	}
	
	//Validate options
	opts["name"] = formatterName; //Opts must have a name to pass validator
	if(this.validateFormatterOpts(opts)){
		//name is not needed when saved to formatters list
		delete opts["name"];
		
		//Modify designated options
		for (let key in opts){
			this.formatters[formatterName][key] = opts[key];
		}
	}
}

//Set Default Options (Formatters have no defaults)
function setHandleDefaults(opts){
	
	if (!opts.hasOwnProperty("active")){
		opts["active"] = true;
	}
	
	if (!opts.hasOwnProperty("levelMapper")){
		
		let defaultLevelMapper = this.levelMapper;
		
		Object.defineProperty(opts, "levelMapper", {
			value: defaultLevelMapper, 
			writable: true,
			enumerable: true, 
			configurable: false
		});
	}
	
	if (!opts.hasOwnProperty("level")){
		let levelMap = this.levelMappings[opts["levelMapper"]];
		
		if (levelMap.hasOwnProperty(this.level)){
			opts["level"] = this.level;
		}
		else{
			let minMaxTuple = this.getMinMaxSeverity(opts["levelMapper"]);
			let index = (this.levelMappings[opts["levelMapper"]]["_orderOfSeverity"] == -1) ? 1:0;
			opts["level"] = this.getLevelName(minMaxTuple[index], opts["levelMapper"]);
		}
	}
	
	if (!opts.hasOwnProperty("target")){
		opts["target"] = DEFAULT_TARGET;
		if (opts.hasOwnProperty("path")){
			opts["target"] = "file";
		}
	}
	
	if (!opts.hasOwnProperty("formatter")){
		opts["formatter"] = "default";
	}
	
	if (opts["target"] == "file" || opts["target"] == "rotatingFile"){
		
		if (!opts.hasOwnProperty("directory")){
			if (opts.hasOwnProperty("path")){
				
				opts["path"] = opts["path"].trim();
				if (opts["path"].charAt(0) == "."){
					opts["path"] = path.join(process.cwd(), opts["path"]);
				}
				else if (opts["path"].charAt(0) != path.sep){
					opts["path"] = path.join(process.cwd(), opts["path"]);
				}
				
				opts["directory"] = path.dirname(opts["path"]) + path.sep;
				if (opts["path"].charAt(opts["path"].length - 1) == path.sep){
					opts["directory"] = opts["path"];
				}
			}
			else{
				opts["directory"] = path.join(process.cwd(), "logs" + path.sep);
			}
			
			//Make Directory if it doesn't exists
			tool.mkDirByPathSync(opts["directory"]);
		}
		
		if (!opts.hasOwnProperty("fileName")){
			
			if (opts.hasOwnProperty("path") && opts["path"].charAt(opts["path"].length - 1) != path.sep){
				opts["fileName"] = path.basename(opts["path"]);
				if (opts["fileName"].indexOf(".") != -1){
					let fileNameAndExt = opts["fileName"].split(".");
					opts["fileName"] = fileNameAndExt[0];
					if (!opts.hasOwnProperty("fileExtension")){
						opts["fileExtension"] = "." + fileNameAndExt[1];
					}
				}
			}
			else{
				
				let stackFrames = tool.getStackInfo();
				for (let i = 0; i < stackFrames.length; ++i){
					if (/lib\/.+\.js/.test(stackFrames[i]["path"]) == false){
						opts["fileName"] = stackFrames[i]["file"].slice(0, stackFrames[i]["file"].lastIndexOf("."));
						break;
					}
				}
				
				// console.log(tool.getStackInfo());
				// throw new Error();
				// let srcFileName = tool.getStackInfo()[3]["file"];
				// opts["fileName"] = srcFileName.slice(0, srcFileName.lastIndexOf("."));
			}
		}
		else{
			
			//Extract basename 
			if (opts["fileName"].indexOf(".") != -1){
				let fileNameAndExt = opts["fileName"].split(".");
				opts["fileName"] = fileNameAndExt[0];
				if (!opts.hasOwnProperty("fileExtension")){
					opts["fileExtension"] = "." + fileNameAndExt[1];
				}
			}
		}
		
		if (!opts.hasOwnProperty("fileExtension")){
			if (opts.hasOwnProperty("path")){
				let baseName = path.basename(opts["path"]);
				if (baseName.indexOf(".") != -1){
					opts["fileExtension"] = "." + baseName.split(".")[1];
				}
				else{
					opts["fileExtension"] = DEFAULT_EXTENSION;
				}
			}
			else{
				opts["fileExtension"] = DEFAULT_EXTENSION;
			}
		}
		
		if (opts["target"] == "rotatingFile"){
			
			//Set Default to rotation type
			if (!opts.hasOwnProperty("rotationType")){
				
				if (!opts.hasOwnProperty("maxSize") && !opts.hasOwnProperty("maxFiles")){
					opts["rotationType"] = "interval";
				}
				else if (!opts.hasOwnProperty("interval")){
					opts["rotationType"] = "size";
				}
				else{
					let err = Error(
						"Options too ambiguous. \n" +
						"Please select options specific to a rotation type or explicitly use the 'rotationType' option"
					);
					throw err;
				}
			}
			
			if (opts["rotationType"] == "interval"){
				if (!opts.hasOwnProperty("interval")){
					opts["interval"] = "day";
				}
				if (opts["interval"] == "week" && !opts.hasOwnProperty("rotateDay")){
					opts["rotateDay"] = "sunday";
				}
			}
			
			if (opts["rotationType"] == "size"){
				
				//Silently monitor logNum
				Object.defineProperty(opts, "logNum", {
					writable: true, 
					enumerable: false, 
					configurable: false, 
					value: -1
				});
				
				if (!opts.hasOwnProperty("maxSize")){
					// opts["maxSize"] = 20 * Math.pow(2, 20); //default = 20 MB
					opts["maxSize"] = Number.POSITIVE_INFINITY;
				}
				if (!opts.hasOwnProperty("maxFiles")){
					// opts["maxFiles"] = 5;
					opts["maxFiles"] = Number.POSITIVE_INFINITY;
				}
			}
		}
	}
	
	if (opts["target"] == "http"){
		
		//Set Request Options
		let urlObj 		= urlUtil.parse(opts["url"]);
		opts["method"] 	= opts["method"] || "GET";
		opts["host"] 	= urlObj["hostname"];
		opts["path"] 	= urlObj["path"];
		opts["keepAlive"] = true;
		
		if (!opts.hasOwnProperty("port")){
			if (typeof(urlObj["port"]) != "undefined" && urlObj["port"] != null){
				opts["port"] = parseInt(urlObj["port"]);
			}
			else{
				opts["port"] = (urlObj["protocol"].indexOf("https") == -1) ? 80 : 443;
			}
		}
		
		if (typeof(opts["headers"]) != "undefined"){
			opts["headers"] = Object.assign({"User-Agent": DEFAULT_USER_AGENT}, opts["headers"]);
		}
		else{
			opts["headers"] = {"User-Agent": DEFAULT_USER_AGENT};
		}
		
		// Set up the request connection
		Object.defineProperty(opts, "connection", {
			writable: true, 
			enumerable: false, 
			configurable: false, 
			value: (urlObj["protocol"].indexOf("https") == -1) ? http : https
		});
	}
	
}


module.exports = {
	"validateFormatterOpts": validateFormatterOpts,
	"validateHandleOpts":	validateHandleOpts,
	"setFormatterOpts":		setFormatterOpts,
	"setHandleOpts":		setHandleOpts,
	"setHandleDefaults":	setHandleDefaults,
};





