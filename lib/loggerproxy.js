"use strict";

var subject = require('./logger.js'); //Singleton Logger Instance

//Proxy Logger Class
function LoggerProxy(name){
	
	this.name = name;
	
	this.propogate = true;
	this.isMuted = false;
	
	this.handles = [];
	this.hasHandles = false;
	
	this.filters = [];
	Object.defineProperty(this, "_filters", {
		value: [],
		writable: true, 
		enumerable: false, 
		configurable: false, 
	});
}

//Set publicly accessible logger methods
LoggerProxy.prototype.setLevelMap = function(levelMapper){
	
	if (typeof(levelMapper) != "string"){
		let err = new TypeError("The 1st paramater (the mapper) must be of type string'");
		throw err;
	}
	
	if (!subject.levelMappings.hasOwnProperty(levelMapper)){
		let err = new TypeError("'" + levelMapper + "' is not a valid level mapper. Use the `defineLevels` method to create it.");
		throw err;
	}
	
	if (levelMapper != this.levelMapper){
		this.handles = []; //detach all handles as they will be out of sync with new levelMapper
		delete this.level; //reset level as it will be out of sync with new levelMapper
	}
	
	this.levelMapper = levelMapper;
	
};
LoggerProxy.prototype.setLevel = function(levelName){
	
	//Ensure level is defined
	if (typeof(this.levelMapper) == "undefined"){
		let error = new Error("Logger must set a 'levelMapper' before it can set its own 'level'");
		throw error;
	}
	if (typeof(levelName) == "number"){
		levelName = subject.getLevelName(levelName);
		if (typeof(levelName) == "undefined"){
			let error = new Error("Log Level '" + levelName + "' could not be mapped to any known log level");
			throw error;
		}
	}
	else if (!subject.levelMappings[this.levelMapper].hasOwnProperty(levelName)){
		let error = new Error("'" + levelName + "' is not a valid log level under the '" + this.levelMapper + "' levelMapper");
		throw error;
	}
	
	//Ensure correct level is maintained within filter objects
	if (this.filters.length != 0){
		for (let i = 0; i < this._filters.length; ++i){
			if(this._filters[i].hasOwnProperty("level")){
				this._filters[i].level = levelName;
			}
		}
	}
	
	this.level = levelName;
};
LoggerProxy.prototype.getLevel = function(){
	return this.level;
};
LoggerProxy.prototype.getEffectiveLevel = function(){
	
	let tree = this.name.split(".");
	for (let i = tree.length; i > 0; --i){
		let ancestor = tree.slice(0, i).join(".");
		if(subject.loggers.hasOwnProperty(ancestor) && typeof(subject.loggers[ancestor].level) != "undefined"){
			return subject.loggers[ancestor].level;
		}
	}
	
	//Return root level if all other levels were undefined
	return subject.loggers["root"].level;
};

LoggerProxy.prototype.attachHandles = function(handleNames){
	
	if (Array.isArray(handleNames) && handleNames.length == 0){
		return;
	}
	
	//Create new handle then get the names to attach to current logger
	if (typeof(handleNames) == "object"){
		if (!Array.isArray(handleNames) || (Array.isArray(handleNames) && typeof(handleNames[0]) != "string")){
			handleNames = subject.addHandle.apply(subject, arguments);
		}
	}
	
	if(typeof(handleNames) != "string" && !Array.isArray(handleNames)){
		let error = new Error("The handle named '" + handleNames + "' is not defined");
		throw error;
	}
	
	// Append handle to logger's handle list if passed a string
	if (typeof(handleNames) == "string"){
		handleNames = [handleNames];
	}
	
	//Ensure all handles are defined and level mappers are the same
	handleNames.forEach(function(handleName){
		
		if (!subject.handles.hasOwnProperty(handleName)){
			let error = new Error("The handle named '" + handleName + "' is not defined");
			throw error;
		}
		
		if (subject.handles[handleName]["levelMapper"] != subject.handles[handleNames[0]]["levelMapper"]){
			let error = new Error("All attached handles must have the same levelMapper");
			throw error;
		}
	});
	
	//Let logger adopt the levelMapper of the handle(s) if it does not have one defined
	if (typeof(this.levelMapper) == "undefined"){
		this.levelMapper = subject.handles[handleNames[0]]["levelMapper"];
	}
	
	//Check that this logger's levelMapper matches those in the handles
	if (this.levelMapper != subject.handles[handleNames[0]]["levelMapper"]){
		let err = new Error("handle's levelMapper (" + subject.handles[handleNames[0]]["levelMapper"] + ") must match Logger's levelMapper (" + this.levelMapper + ")");
		throw err;
	}
	
	//Iterate handle names and add them to logger's handles list
	for (let i = 0; i < handleNames.length; ++i){
		
		//Skip handle if already exists
		if (this.handles.indexOf(handleNames[i]) != -1){
			continue;
		}
		this.handles.push(handleNames[i]);
	}
	
	if (this.handles.length != 0){
		this.hasHandles = true;
	}
	
};
LoggerProxy.prototype.detachHandles = function(handleNames){
	
	if(typeof(handleNames) != "string" && !Array.isArray(handleNames)){
		let error = new Error("The handle named '" + handleNames + "' is not defined");
		throw error;
	}
	
	// Append handle to logger's handle list if passed a string
	if (typeof(handleNames) == "string"){
		handleNames = [handleNames];
	}
	
	for (let i = 0; i < handleNames.length; ++i){
		let removalIndex = this.handles.indexOf(handleNames[i]);
		if (removalIndex != -1){
			this.handles.splice(removalIndex, 1);
		}
	}
	
	if (this.handles.length == 0){
		this.hasHandles = false;
	}
};

LoggerProxy.prototype.attachFilter = function(filterName, opts){
	
	if (typeof(filterName) != "string"){
		let error = new Error("FilterName must be of type 'string'");
		throw error;
	}
	if (!subject.filters.hasOwnProperty(filterName)){
		let error = new Error(filterName + " is not defined");
		throw error;
	}
	
	if (typeof(opts) == "undefined"){
		opts = {};
	}
	opts["filterName"] = filterName;
	
	this.filters.push(filterName);
	this._filters.push(subject.LogFilterFactory(subject.filters[filterName], opts, this));
};
LoggerProxy.prototype.detachFilter = function(filterNames){
	
	if (typeof(filterNames) == "string"){
		filterNames = [filterNames];
	}
	else if (typeof(filterNames) == "object" && !Array.isArray(filterNames)){
		let error = new Error("detachFilter expected type 'string' or array of strings");
		throw error;
	}
	
	for(let i = 0; i < filterNames.length; ++i){
		
		let removalIndex = this.filters.indexOf(filterNames[i]);
		if (removalIndex != -1){
			this.filters.splice(removalIndex, 1);
		}
		
		//Remove from both visibile and hidden filter fields
		removalIndex = this._filters.indexOf(filterNames[i]);
		if (removalIndex != -1){
			this._filters.splice(removalIndex, 1);
		}
	}
	
};

LoggerProxy.prototype.mute = function(){
	this.isMuted = true;
};
LoggerProxy.prototype.unmute = function(){
	this.isMuted = false;
};


//Proxy log calls to subject
LoggerProxy.prototype.log = function(){
	
	//If silent don't bother going through logging chain
	if(this.isMuted){
		return;
	}
	
	var logRecord;
	if (typeof(arguments[0]) == "object" && !Array.isArray(arguments[0]) && arguments[0]["_isHTTPRecord"]){
		logRecord = arguments[0];
	}
	else{
		let args = [this.handles, this.levelMapper].concat(Array.prototype.slice.call(arguments));
		logRecord = subject.makeRecord.apply(subject, args);
	}
	
	//Create ancestor tree and Iterate up the log ancestors
	let tree = this.name.split(".");
	for (let i = tree.length; i >= 0; --i){
		
		//The ancestor is the logger at the current hierarchy level
		let ancestorName = (i == 0) ? "root" : tree.slice(0, i).join(".");
		let ancestor = subject.loggers[ancestorName];
		if (typeof(ancestor) == "undefined"){
			continue;
		}
		
		//Set name of the current logger that is rendering the record
		logRecord["loggerName"] = ancestorName;
		
		//Check Logger's Level Filters
		let levelMap = subject.levelMappings[ancestor.levelMapper];
		if (!levelMap.hasOwnProperty(logRecord["level"])){
			continue;
		}
		if (levelMap["_orderOfSeverity"] == -1 && logRecord["levelNum"] > levelMap[ancestor.level]){
			continue;
		}
		else if (levelMap["_orderOfSeverity"] == 1 && logRecord["levelNum"] < levelMap[ancestor.level]){
			continue;
		}
		
		//Run Logger's user attached filters
		if (subject.loggers[ancestorName].hasOwnProperty("_filters")){
			if (!subject.runFilters(logRecord, subject.loggers[ancestorName]._filters)){
				if(!subject.loggers[ancestorName].propogate){
					break;
				}
				continue;
			}
		}
		
		//Log for each handle in logger at current hierarchial level
		subject.loggers[ancestorName].handles.forEach(function(handleName){
			subject.render(logRecord, subject.handles[handleName]);
		});
		
		//Halt logging at current hierarchial level if logger does not propogate 
		if(!subject.loggers[ancestorName].propogate){
			break;
		}
		
	}
	
};

/*eslint-disable no-unused-vars */
// npm Quick Log Interface
LoggerProxy.prototype.error = function(message){
	// message = (arguments.length == 1) ? message : util.format.apply(this, arguments); //Carry out string interpolation
	// this.log("error", message);
	this.log.apply(this, ["error"].concat(Array.prototype.slice.call(arguments)));
};
LoggerProxy.prototype.warn = function(message){
	// message = (arguments.length == 1) ? message : util.format.apply(this, arguments); //Carry out string interpolation
	// this.log("warn", message);
	this.log.apply(this, ["warn"].concat(Array.prototype.slice.call(arguments)));
};
LoggerProxy.prototype.info = function(message){
	// message = (arguments.length == 1) ? message : util.format.apply(this, arguments); //Carry out string interpolation
	// this.log("info", message);
	this.log.apply(this, ["info"].concat(Array.prototype.slice.call(arguments)));
};
LoggerProxy.prototype.verbose = function(message){
	// message = (arguments.length == 1) ? message : util.format.apply(this, arguments); //Carry out string interpolation
	// this.log("verbose", message);
	this.log.apply(this, ["verbose"].concat(Array.prototype.slice.call(arguments)));
};
LoggerProxy.prototype.debug = function(message){
	// message = (arguments.length == 1) ? message : util.format.apply(this, arguments); //Carry out string interpolation
	// this.log("debug", message);
	this.log.apply(this, ["debug"].concat(Array.prototype.slice.call(arguments)));
};
LoggerProxy.prototype.silly = function(message){
	// message = (arguments.length == 1) ? message : util.format.apply(this, arguments); //Carry out string interpolation
	// this.log("silly", message);
	this.log.apply(this, ["silly"].concat(Array.prototype.slice.call(arguments)));
};

// syslog Quick Log Interface (includes info and debug already defined above)
LoggerProxy.prototype.emerg = function(message){
	this.log.apply(this, ["emerg"].concat(Array.prototype.slice.call(arguments)));
};
LoggerProxy.prototype.alert = function(message){
	this.log.apply(this, ["alert"].concat(Array.prototype.slice.call(arguments)));
};
LoggerProxy.prototype.crit = function(message){
	this.log.apply(this, ["crit"].concat(Array.prototype.slice.call(arguments)));
};
LoggerProxy.prototype.err = function(message){
	this.log.apply(this, ["err"].concat(Array.prototype.slice.call(arguments)));
};
LoggerProxy.prototype.warning = function(message){
	this.log.apply(this, ["warning"].concat(Array.prototype.slice.call(arguments)));
};
LoggerProxy.prototype.notice = function(message){
	this.log.apply(this, ["notice"].concat(Array.prototype.slice.call(arguments)));
};

// python Quick Log Interface (includes error, warning, info, debug already defined above)
LoggerProxy.prototype.critical = function(message){
	this.log.apply(this, ["critical"].concat(Array.prototype.slice.call(arguments)));
};
/*eslint-enable no-unused-vars */

//Export Module
module.exports = LoggerProxy;

