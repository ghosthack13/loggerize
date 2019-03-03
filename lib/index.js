/**//****************************************************************************
*	
*	@author ghosthack13 <13hackghost@gmail.com>
*	@file The main library api of LoggeriseJS
*	
*	This file is part of LoggerizeJS (also simply known as Loggerize).
*	
*	@license
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

const crypto = require("crypto");

var LoggerProxy = require('./loggerproxy.js'); //Proxy to logger instance
var subject = require("./logger.js"); //Singleton Logger Instance

//Construct Predetermined Loggers
Object.defineProperties(subject.loggers, {
	"root": 	 { value: new LoggerProxy("root"), writable: true, enumerable: true, configurable: false },
	"_anonymous": { value: new LoggerProxy("_anonymous"), writable: true, enumerable: true, configurable: false },
});
Object.defineProperties(subject.loggers["_anonymous"], {
	"level":	   { writable: true, enumerable: true, configurable: false,  value: "debug" },
	"levelMapper": { writable: true, enumerable: true, configurable: false,  value: "npm" },
	"propogate":   { writable: true, enumerable: true, configurable: false,  value: false },
	"hasHandles":  { writable: true, enumerable: true, configurable: false,  value: true },
	"handles": 	   { writable: true, enumerable: true, configurable: false,  value: ["default"] },
});
Object.defineProperties(subject.loggers["root"], {
	"levelMapper": { writable: true, enumerable: true, configurable: false,  value: subject.levelMapper },
});

/**
*	Creates a new user-defined levelMapper
*	@param {string} mapper - Unique name to identify the new levelMapper
*	@param {object.<string, number>} levelsObj - Unique name to identify the new levelMapper
*	@param {string} [orderOfSeverity=desc] - Set whether severity increases/decreases as level decreases/increases
*	@throws {TypeError} Argument mapper must be of type string
*	@throws {TypeError} Argument levelsObj must be of type object
*	@returns {undefined}
*/
function createLevelMap(mapper, levelsObj, orderOfSeverity){
	return subject.createLevelMap.call(subject, mapper, levelsObj, orderOfSeverity);
}
/**
*	Set the name of the default levelMapper to use within the library
*	@param {string} mapper - the name of a library-defined or user-defined levelMapper
*	@throws {TypeError} Argument mapper must be of type string
*	@returns {undefined}
*/
function setLevelMapper(mapper){
	return subject.setLevelMapper.call(subject, mapper);
}

/**
*	Get the name of the default severity level of the library
*	@returns {string} level
*/
function getLevel(){
	return subject.getLevel.call(subject);
}
/**
*	Set the default severity level of the library
*	@param {(string|number)} level - the desired default severity level
*	@throws {Error} throws if level is not compatible with the selected levelMapper
*	@returns {string} level
*/
function setLevel(level){
	return subject.setLevel.call(subject, level);
}

/**
*	Set colors corresponding to severity levels
*	@param {object.<string, string>} [colorMap] - configuration of severity level and corresponding style
*	@param {string} [levelMapper=loggerize.levelMapper] - name of the levelMapper to colorize
*	@throws {TypeError} Argument colorMap must be of type object
*	@throws {ReferenceError} throws error if selected levelMapper does not exists
*	@example
*	var Loggerize = require("../../lib/index.js");
*	var colorMap = {
*	"error": 	"redBright", 
*	"warn": 	"yellowBright", 
*	"info": 	"purpleBright", 
*	"verbose": 	"blueBright", 
*	"debug": 	"greenBright",
*	};
*	Loggerize.colorizeLevels(colorMap);
*/
function colorizeLevels(colorMap, levelMapper){
	return subject.colorizeLevels.call(subject, colorMap, levelMapper);
}
/**
*	Removes the colors on the levelMappers that enabled colorization
*	@param {string} [levelMapper] - name of the specific levelMapper to decolorize else decolorize all
*	@returns {undefined}
*/
function decolorizeLevels(levelMapper){
	return subject.decolorizeLevels.call(subject, levelMapper);
}

/**
*	Create a standard application logger
*	@param {(string|object)} opts - name of the logger or configuration
*	@returns {object} A standard application logger
*
*/
function createLogger(opts){
	
	//Validate Opts
	if (typeof(opts) == "string"){
		opts = {"name": opts};
	}
	else if (typeof(opts) != "object" || Array.isArray(opts)){
		let err = new Error("Expected parameter of type 'object'. Received type: " + (typeof(opts) == "object" ? "array" : typeof(opts)));
		throw err;
	}
	
	if (typeof(opts["name"]) != "string"){
		let err = new Error("Logger must have a valid name of type 'string'");
		throw err;
	}
	if (subject.loggers.hasOwnProperty(opts["name"])){
		let err = new Error("The logger " + opts["name"] + " is already defined");
		throw err;
	}
	
	//Validate or set handle defaults
	if (opts.hasOwnProperty("handle")){
		
		//Store handle as array
		if (!Array.isArray(opts["handle"])){
			opts["handle"] = [opts["handle"]];
		}
		
		let attachableHandles = [];
		let firstHandleName = opts["handle"][0];
		for (let i = 0; i < opts["handle"].length; ++i){
			
			//Set current handle name or add handle if is an object
			let currentHandle = opts["handle"][i];
			
			if (typeof(currentHandle) == "string"){
				
				//Set the name of the current handle
				let currentHandleName = currentHandle;
				
				//Check if handle was defined
				if (!subject.handles.hasOwnProperty(currentHandleName)){
					let err = new Error("The handle '" + currentHandleName + "' is not defined");
					throw err;
				}
				
				//Ensure all attached handles will have the same levelMapper
				if (subject.handles[currentHandleName]["levelMapper"] != subject.handles[firstHandleName]["levelMapper"]){
					let error = new Error("All attached handles must have the same levelMapper");
					throw error;
				}
				
				//Add handle name to list of attachable handles
				attachableHandles.push(currentHandleName);
			}
			else if (typeof(currentHandle) == "object" && !Array.isArray(currentHandle)){
				if (typeof(currentHandle["levelMapper"]) == "undefined"){
					currentHandle["levelMapper"] = opts["levelMapper"] || subject.levelMapper;
				}
				
				//Add handle name to list of attachable handles
				attachableHandles.push(currentHandle["name"]);
				subject.addHandle(currentHandle);
			}
			else{
				let err = new Error("Handle must be of type string or object");
				throw err;
			}
		}
		
		//Declare handle presence
		opts["handle"] = attachableHandles;
		opts["hasHandles"] = true;
		
	}
	else {
		if (opts["hasHandles"] === false){
			opts["handle"] = [];
		}
		else if (typeof(opts["levelMapper"]) == "undefined" || opts["levelMapper"] == "npm"){
			opts["handle"] = ["default"];
			opts["hasHandles"] = true;
		}
		else{
			
			let configObj = {
				"name": "_handle" + Date.now(),
				"target": "console",
				"formatter": "default",
				"levelMapper": "npm",
				// "level": <defaults to lowest severity of levelMapper>
			};
			
			//Adopt levelMapper of logger if available
			if (opts["levelMapper"]){
				configObj["levelMapper"] = opts["levelMapper"];
			}
			
			//Add handle and set it up for attachment
			opts["handle"] = subject.addHandle(configObj);
			
			//Declare handle presence
			opts["hasHandles"] = true;
		}
	}
	
	//Validate or set levelMapper defaults (Must come after setting handle opts)
	if (opts.hasOwnProperty("levelMapper")){
		if (!subject.levelMappings.hasOwnProperty(opts["levelMapper"])){
			let err = new TypeError("'" + opts["levelMapper"] + "' is not a valid level mapper. Use the `createLevelMap` method to create it.");
			throw err;
		}
	}
	else {
		//Adopt levelMapper of any attached handle
		if (opts["handle"].length == 0){
			opts["levelMapper"] = subject.levelMapper;
		}
		else{
			let sampleHandleName = opts["handle"][0];
			opts["levelMapper"] = subject.handles[sampleHandleName]["levelMapper"];
		}
	}
	
	//Validate or set level defaults
	if (opts.hasOwnProperty("level")){
		if (!subject.levelMappings[opts["levelMapper"]].hasOwnProperty(opts["level"])){
			let err = new Error("'" + opts["level"] + "' is an invalid level in the '" + opts["levelMapper"] + "' level mapping");
			throw err;
		}
	}
	else {
		if (subject.levelMappings[opts["levelMapper"]].hasOwnProperty("debug")){
			opts["level"] = "debug";
		}
		else{
			let minMaxTuple = subject.getMinMaxSeverity(opts["levelMapper"]);
			opts["level"] = subject.getLevelName(minMaxTuple[0], opts["levelMapper"]);
		}
	}
	
	//Validate or set emit options
	if (opts.hasOwnProperty("emitEvents")){
		if (typeof(opts["emitEvents"]) !== "boolean"){
			let err = new TypeError("emitEvents property must be of type 'boolean'");
			throw err;
		}
		
		//Ensure handle is emitting event for the logger
		if (opts["emitEvents"] === true){
			for (let i = 0; i < opts["handle"].length; ++i){
				let handleName = opts["handle"][i];
				subject.handles[handleName]["emitEvents"] = true;
			}
		}
	}
	else {
		opts["emitEvents"] = false;
	}
	
	//Validate or set propogation
	if (opts.hasOwnProperty("propogate")){
		if (typeof(opts["propogate"]) != "boolean"){
			let err = new TypeError("propogate property must be of type 'boolean'");
			throw err;
		}
	}
	else {
		opts["propogate"] = true;
	}
	
	//Create new Logger
	let newLogger = new LoggerProxy(opts["name"]);
	
	//Set Members
	newLogger.setLevelMapper(opts["levelMapper"]);
	newLogger.setLevel(opts["level"]);
	newLogger.handles = opts["handle"];
	newLogger.hasHandles = (opts["handle"].length == 0) ? false: true;
	newLogger.emitEvents = opts["emitEvents"];
	newLogger.propogate = opts["propogate"];
	
	//Track in master logger
	subject.loggers[opts["name"]] = newLogger;
	
	return subject.loggers[opts["name"]];
}

/**
*	Create a HTTP logger
*	@param {(string|object)} opts - name of the HTTP logger or configuration
*	@returns {object} An instance of a standard application logger
*
*/
function createHTTPLogger(opts){
	
	//Validate Opts
	if (typeof(opts) == "string"){
		opts = {"name": opts};
	}
	else if (typeof(opts) != "object" || Array.isArray(opts)){
		let err = new Error("Expected parameter of type 'object'. Received type: " + (typeof(opts) == "object" ? "array" : typeof(opts)));
		throw err;
	}
	
	if (typeof(opts["name"]) != "string"){
		let err = new Error("Logger must have a valid name of type 'string'");
		throw err;
	}
	if (subject.loggers.hasOwnProperty(opts["name"])){
		let err = new Error("The logger " + opts["name"] + " is already defined");
		throw err;
	}
	
	//Validate or set handle defaults
	if (opts.hasOwnProperty("handle")){
		
		//Store handle as array
		if (!Array.isArray(opts["handle"])){
			opts["handle"] = [opts["handle"]];
		}
		
		let attachableHandles = [];
		let firstHandleName = opts["handle"][0];
		for (let i = 0; i < opts["handle"].length; ++i){
			
			//Set current handle name or add handle if is an object
			let currentHandle = opts["handle"][i];
			
			if (typeof(currentHandle) == "string"){
				
				//Set the name of the current handle
				let currentHandleName = currentHandle;
				
				//Check if handle was defined
				if (!subject.handles.hasOwnProperty(currentHandleName)){
					let err = new Error("The handle '" + currentHandleName + "' is not defined");
					throw err;
				}
				
				//Ensure all attached handles will have the same levelMapper
				if (subject.handles[currentHandleName]["levelMapper"] != subject.handles[firstHandleName]["levelMapper"]){
					let error = new Error("All attached handles must have the same levelMapper");
					throw error;
				}
				
				//Add handle name to list of attachable handles
				attachableHandles.push(currentHandleName);
			}
			else if (typeof(currentHandle) == "object" && !Array.isArray(currentHandle)){
				if (typeof(currentHandle["levelMapper"]) == "undefined"){
					currentHandle["levelMapper"] = opts["levelMapper"] || "http";
				}
				
				//Add handle name to list of attachable handles
				attachableHandles.push(currentHandle["name"]);
				subject.addHandle(currentHandle);
			}
			else{
				let err = new Error("Handle must be of type string or object");
				throw err;
			}
		}
		
		//Declare handle presence
		opts["handle"] = attachableHandles;
		opts["hasHandles"] = true;
	}
	else{
		if (opts["hasHandles"] === false){
			opts["handle"] = [];
		}
		else if (typeof(opts["levelMapper"]) == "undefined" || opts["levelMapper"] == "http"){
			opts["handle"] = ["defaultHTTP"];
			opts["hasHandles"] = true;
		}
		else{
			
			let configObj = {
				"name": "_defaultHTTP" + Date.now(),
				"target": "console",
				"formatter": "common",
				"levelMapper": "http",
				// "level": <defaults to lowest severity of levelMapper>
			};
			
			//Adopt levelMapper of logger if available
			if (opts["levelMapper"]){
				configObj["levelMapper"] = opts["levelMapper"];
			}
			
			//Add handle and set it up for attachment
			opts["handle"] = subject.addHandle(configObj);
			
			//Declare handle presence
			opts["hasHandles"] = true;
		}
	}
	
	//Validate or set levelMapper defaults (Must come after setting handle opts)
	if (opts.hasOwnProperty("levelMapper")){
		if (!subject.levelMappings.hasOwnProperty(opts["levelMapper"])){
			let err = new TypeError("'" + opts["levelMapper"] + "' is not a valid level mapper. Use the `createLevelMap` method to create it.");
			throw err;
		}
	}
	else {
		//Adopt levelMapper of any attached handle
		if (opts["handle"].length == 0){
			opts["levelMapper"] = "http";
		}
		else{
			let sampleHandleName = opts["handle"][0];
			opts["levelMapper"] = subject.handles[sampleHandleName]["levelMapper"];
		}
	}
	
	//Validate or set level defaults
	if (opts.hasOwnProperty("level")){
		if (!subject.levelMappings[opts["levelMapper"]].hasOwnProperty(opts["level"])){
			let err = new Error("'" + opts["level"] + "' is an invalid level in the '" + opts["levelMapper"] + "' level mapping");
			throw err;
		}
	}
	else {
		if (subject.levelMappings[opts["levelMapper"]].hasOwnProperty("debug")){
			opts["level"] = "debug";
		}
		else{
			let minMaxTuple = subject.getMinMaxSeverity(opts["levelMapper"]);
			opts["level"] = subject.getLevelName(minMaxTuple[0], opts["levelMapper"]);
		}
	}
	
	//Validate or set emit options
	if (opts.hasOwnProperty("emitEvents")){
		if (typeof(opts["emitEvents"]) != "boolean"){
			let err = new TypeError("emitEvents property must be of type 'boolean'");
			throw err;
		}
		
		//Ensure handle is emitting event for the logger
		if (opts["emitEvents"] === true){
			for (let i = 0; i < opts["handle"].length; ++i){
				let handleName = opts["handle"][i];
				subject.handles[handleName]["emitEvents"] = true;
			}
		}
	}
	else {
		opts["emitEvents"] = false;
	}
	
	//Setup split/dual logging
	if (!opts.hasOwnProperty("logOnRequest")){
		opts["logOnRequest"] = false;
	}
	if (!opts.hasOwnProperty("logOnResponse")){
		opts["logOnResponse"] = true;
	}
	
	//Create new Logger
	let reqLogger = new LoggerProxy(opts["name"]);
	
	//Set Members
	reqLogger.logOnRequest = opts["logOnRequest"];
	reqLogger.logOnResponse = opts["logOnResponse"];
	reqLogger.setLevelMapper(opts["levelMapper"]);
	reqLogger.setLevel(opts["level"]);
	reqLogger.handles = opts["handle"];
	reqLogger.emitEvents = opts["emitEvents"];
	reqLogger.hasHandles = (opts["handle"].length == 0) ? false: true;
	reqLogger.propogate = false; //http loggers do not propogate
	
	// console.log(reqLogger);
	
	//Set Request Listener function
	reqLogger.httpListener =  function(req, res, next){
		
		let isMiddleware = (typeof next === 'function') ? true : false;
		
		//Create Log record and Attach request req/res object to logger
		let logRecord = Object.create(Object.prototype, {
			"DateObj": { value: new Date(), writable: false, enumerable: false, configurable: false },
			"req": { value: req, writable: true, enumerable: false, configurable: false },
			"res": { value: res, writable: true, enumerable: false, configurable: false },
			"_isHTTPRecord": { value: true, writable: false, enumerable: true, configurable: false },
		});
		
		//Create universal unique ID if designated in any formatter
		for (let i = 0; i < reqLogger.handles.length; ++i){
			
			let handle = subject.handles[reqLogger.handles[i]];
			let formatter = subject.formatters[handle.formatter];
			
			if ((formatter.hasOwnProperty("format") && formatter["format"].indexOf("%{uuid}") != -1)
			|| (formatter.hasOwnProperty("fields") && formatter["fields"].indexOf("uuid") != -1)){
				const id = crypto.randomBytes(16).toString("hex");
				logRecord["uuid"] = id.substr(0, 8) + "-" + id.substr(8, 4) + "-" + id.substr(12, 4) + "-" + id.substr(16, 4) + "-" + id.substr(20, 12);
			}
		}
		
		//Convert standard log record to a request log record
		logRecord = subject.makeRequestRecord.call(subject, req, logRecord, isMiddleware);
		
		//Log Request
		reqLogger.log(logRecord);
		
		//Wait for response to collect remaining log information
		res.on('finish', function(){
			//Convert request log record to a request/response log record
			logRecord = subject.makeResponseRecord.call(subject, res, logRecord, isMiddleware);
			
			//Log Response
			reqLogger.log(logRecord);
		});
		
		//Call next middleware
		if (isMiddleware){
			next();
		}
	};
	
	//Track in master logger
	subject.loggers[opts["name"]] = reqLogger;
	
	return subject.loggers[opts["name"]];
}
function getLogger(name){
	
	if (typeof(name) == "string"){
		if (!subject.loggers.hasOwnProperty(name)){
			subject.loggers[name] = new LoggerProxy(name);
		}
		// console.log(subject.loggers);
		return subject.loggers[name];
	}
	else{
		let err = new Error("Logger name must be of type 'string'");
		throw err;
	}
}
function getRootLogger(){
	return subject.loggers["root"];
}

/**
*	Create a HTTP logger and return its middleware
*	@param {(string|object)} opts - name of the HTTP logger or configuration
*	@returns {function} A connect/express compatible middleware function
*
*/
function mw(opts){
	
	if (typeof(opts) == "undefined"){
		opts = {
			// "name": "netMiddleware",
			"name": "__HTTPLogger" + Date.now(),
			"levelMapper": "http",
			"level": "information",
			"handle": ["defaultHTTP"],
		};
	}
	else if (typeof(opts) == "string"){
		opts = {"name": opts};
	}
	else if (typeof(opts) != "object" || Array.isArray(opts)){
		let err = new TypeError("mw() parameter must be of type object or type string");
		throw err;
	}
	
	return createHTTPLogger(opts).httpListener;
}
/**
*	A Node HTTP Request Listener for logging
*	@param {object} req - HTTP requst object
*	@param {object} res - HTTP response object
*	@param {object} [opts] - HTTP logger configuration
*	@returns {function} A node compatible request listener
*
*/
function requestListener(req, res, opts){
	
	if (typeof(opts) == "undefined"){
		opts = {
			// "name": "requestListener",
			"name": "__HTTPLogger" + Date.now(),
			"levelMapper": "http",
			"level": "information",
			"handle": ["defaultHTTP"],
		};
	}
	else if (typeof(opts) == "string"){
		opts = {"name": opts};
	}
	else if (typeof(opts) != "object" || Array.isArray(opts)){
		let err = new TypeError("reqListener() parameter must be of type object or type string");
		throw err;
	}
	
	//Create request listener if one does not exists
	if (!subject.loggers.hasOwnProperty(opts["name"])){
		subject.loggers[opts["name"]] = createHTTPLogger(opts);
	}
	
	//Run request listener
	return subject.loggers[opts["name"]].httpListener(req, res);
	
}

/**
*	Create user defined tokens
*	@param {object.<string,string|number>} tokens
*	@throws {Error} throws error if there is an attempt to overwrite a predefined library token
*/
function addTokens(){
	return subject.addTokens.apply(subject, arguments);
}

function addExceptionHandle(){
	return subject.addExceptionHandle.apply(subject, arguments);
}

/**
*	Add a handle configuration
*	@param {(object|array.<object>)} handle - an individual handle configuration or an array of handle configurations
*	@return {string[]} - names of the handles that were added
*/
function addHandle(){
	return subject.addHandle.apply(subject, arguments);
}

/**
*	Add a formatter configuration
*	@param {(object|array.<object>)} formatter - an individual formatter configuration or an array of formatter configurations
*/
function addFormatter(){
	return subject.addFormatter.apply(subject, arguments);
}

/**
*	Add a user-defined target
*	@param {(string|object.<{name: number, target: function}>)} name - a unique name to identify the target or object 
*	@param {function} func - the functional definition of the target
*	@throws {TypeError} Argument name must be of type object
*	@throws {TypeError} Argument func must be of type function
*	@return {string[]} - names of the targets that were added
*/
function addTarget(){
	return subject.addTarget.apply(subject, arguments);
}

/**
*	Add a user-defined filter
*	@param {(string|object.<{name: number, filter: function}>)} name - a unique name to identify the filter or object 
*	@param {function} func - the functional definition of the filter
*	@throws {TypeError} Argument name must be of type object
*	@throws {TypeError} Argument func must be of type function
*	@return {string[]} - names of the filters that were added
*/
function addFilter(){
	return subject.addFilter.apply(subject, arguments);
}

/**
*	Add a user-defined transformer
*	@param {(string|object.<{name: number, transformer: function}>)} name - a unique name to identify the transformer or object 
*	@param {function} func - the functional definition of the transformer
*	@throws {TypeError} Argument name must be of type object
*	@throws {TypeError} Argument func must be of type function
*	@return {string[]} - names of the transformers that were added
*/
function addTransformer(){
	return subject.addTransformer.apply(subject, arguments);
}

function removeFormatter(){
	return subject.removeFormatter.apply(subject, arguments);
}
function removeHandle(){
	return subject.removeHandle.apply(subject, arguments);
}
function removeTarget(){
	return subject.removeTarget.apply(subject, arguments);
}
function removeFilter(){
	return subject.removeFilter.apply(subject, arguments);
}
function removeTransformer(){
	return subject.removeTransformer.apply(subject, arguments);
}

/**
*	@param {string} eventName - the name of the event that is being listened
*	@param {logEventCallback} callback - the name of the event that is being listened
*/
function on(){
	return subject.on.apply(subject, arguments);
}

/**
*	@callback logEventCallback
*	@param {...object} logRecord - the logRecord or an error and logRecord
*/

/*eslint-disable no-unused-vars */
function error(message){
	subject.loggers["_anonymous"].log.apply(subject.loggers["_anonymous"], ["error"].concat(Array.prototype.slice.call(arguments)));
}
function warn(message){
	subject.loggers["_anonymous"].log.apply(subject.loggers["_anonymous"], ["warn"].concat(Array.prototype.slice.call(arguments)));
}
function info(message){
	subject.loggers["_anonymous"].log.apply(subject.loggers["_anonymous"], ["info"].concat(Array.prototype.slice.call(arguments)));
}
function verbose(message){
	subject.loggers["_anonymous"].log.apply(subject.loggers["_anonymous"], ["verbose"].concat(Array.prototype.slice.call(arguments)));
}
function debug(message){
	subject.loggers["_anonymous"].log.apply(subject.loggers["_anonymous"], ["debug"].concat(Array.prototype.slice.call(arguments)));
}
function silly(message){
	subject.loggers["_anonymous"].log.apply(subject.loggers["_anonymous"], ["silly"].concat(Array.prototype.slice.call(arguments)));
}
/*eslint-enable no-unused-vars */

function shutdown(){
	return subject.shutdown.call(subject);
}


//Export Module
module.exports = {
	
	"addTokens": 		addTokens,
	"colorizeLevels": 	colorizeLevels,
	"decolorizeLevels": decolorizeLevels,
	
	"createLogger":  	createLogger,
	"createHTTPLogger": createHTTPLogger,
	"getLogger": 	 	getLogger,
	"getRootLogger": 	getRootLogger,
	
	"mw": mw,
	"requestListener": 	requestListener,
	
	"getLevel": 		getLevel,
	"setLevel": 		setLevel,
	"createLevelMap": 	createLevelMap,
	"setLevelMapper": 	setLevelMapper,
	
	"addExceptionHandle": addExceptionHandle,
	"addHandle": 		addHandle,
	"addHandles": 		addHandle,
	"addFormatter": 	addFormatter,	
	"addFormatters": 	addFormatter,	
	"addFilter":	 	addFilter,
	"addTarget": 		addTarget,
	"addTransformer": 	addTransformer,
	
	"removeHandle": 	removeHandle,
	"removeFormatter": 	removeFormatter,	
	"removeFilter":	  	removeFilter,
	"removeTarget": 	removeTarget,
	"removeTransformer": removeTransformer,
	
	"error":	error,
	"warn":		warn,
	"info":		info,
	"verbose": 	verbose,
	"debug": 	debug,
	"silly": 	silly,
	
	"on": on,
	"shutdown": shutdown,
};




