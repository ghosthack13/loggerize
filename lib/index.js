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

function defineLevels(mapper, levelsObj, orderOfSeverity){
	return subject.defineLevels.call(subject, mapper, levelsObj, orderOfSeverity);
}
function getLevel(){
	return subject.getLevel.call(subject);
}
function setLevel(level){
	return subject.setLevel.call(subject, level);
}
function setLevelMap(mapper){
	return subject.setLevelMap.call(subject, mapper);
}
function colorizeLevels(colorMap, levelMapper){
	return subject.colorizeLevels.call(subject, colorMap, levelMapper);
}
function decolorizeLevels(levelMapper){
	return subject.decolorizeLevels.call(subject, levelMapper);
}

function createLogger(opts){
	
	//Validate Opts
	if (typeof(opts) == "string"){
		opts = {"name": opts};
	}
	else if (typeof(opts) != "object" || Array.isArray(opts)){
		let err = new Error("Expected parameter of type 'object'. Received type: " + (typeof(opts) == "object" ? "array" : typeof(opts)));
		throw err;
	}
	
	if (!opts.hasOwnProperty("name") || typeof(opts["name"]) != "string"){
		let err = new Error("Logger must have a valid name of type 'string'");
		throw err;
	}
	
	if (subject.loggers.hasOwnProperty(opts["name"])){
		let err = new Error("The logger " + opts["name"] + " is already defined");
		throw err;
	}
	
	if (opts.hasOwnProperty("handle")){
		
		if (typeof(opts["handle"]) == "string"){
			if (!subject.handles.hasOwnProperty(opts["handle"])){
				let err = new Error("The handle " + opts["handle"] + " is not defined");
				throw err;
			}
			opts["handle"] = [opts["handle"]];
		}
		else if (typeof(opts["handle"]) == "object" && !Array.isArray(opts["handle"])){
			opts["handle"] = subject.addHandle(opts["handle"]);
		}
		else if (Array.isArray(opts["handle"])){
			opts["handle"].forEach(function(handleName){
				if (!subject.handles.hasOwnProperty(handleName)){
					let err = new Error("The handle '" + handleName + "' is not defined");
					throw err;
				}
			});
		}
		else{
			let err = new Error("Handle must be of type string, array of strings or object");
			throw err;
		}
	}
	
	
	//Set Default Opts
	if (!opts.hasOwnProperty("handle")){
		if (subject.levelMapper != "npm" || (typeof(opts["hasHandles"]) != "undefined" && !opts["hasHandles"])){
			opts["handle"] = [];
		}
		else{
			opts["handle"] = ["default"];
		}
	}
	
	if (!opts.hasOwnProperty("levelMapper")){
		if (opts["handle"].length == 0){
			opts["levelMapper"] = subject.levelMapper;
		}
		else{
			let sampleHandleName = opts["handle"][0];
			opts["levelMapper"] = subject.handles[sampleHandleName]["levelMapper"];
		}
	}
	
	if (!opts.hasOwnProperty("level")){
		// let minHandleLevel;
		// for (let i = 0; i < opts["handles"].length; ++i){
			
		// }
		// else 
		if (subject.levelMappings[opts["levelMapper"]].hasOwnProperty("debug")){
			opts["level"] = "debug";
		}
		else{
			let minMaxTuple = subject.getMinMaxSeverity(opts["levelMapper"]);
			opts["level"] = subject.getLevelName(minMaxTuple[0], opts["levelMapper"]);
		}
	}
	
	//Create new Logger
	subject.loggers[opts["name"]] = new LoggerProxy(opts["name"]);
	subject.loggers[opts["name"]].setLevelMap(opts["levelMapper"]);
	subject.loggers[opts["name"]].setLevel(opts["level"]);
	subject.loggers[opts["name"]].handles = opts["handle"];
	subject.loggers[opts["name"]].hasHandles = (opts["handle"].length == 0) ? false: true;
	
	return subject.loggers[opts["name"]];
}
function createHTTPLogger(opts){
	
	//Validate Opts
	if (typeof(opts) == "string"){
		opts = {"name": opts};
	}
	else if (typeof(opts) != "object" || Array.isArray(opts)){
		let err = new Error("Expected parameter of type 'object'. Received type: " + (typeof(opts) == "object" ? "array" : typeof(opts)));
		throw err;
	}
	
	if (!opts.hasOwnProperty("name") || typeof(opts["name"]) != "string"){
		let err = new Error("Logger must have a valid name of type 'string'");
		throw err;
	}
	if (subject.loggers.hasOwnProperty(opts["name"])){
		let err = new Error("The logger " + opts["name"] + " is already defined");
		throw err;
	}
	
	
	if (opts.hasOwnProperty("handle")){
		
		if (typeof(opts["handle"]) == "string"){
			if (!subject.handles.hasOwnProperty(opts["handle"])){
				let err = new Error("The handle " + opts["handle"] + " is not defined");
				throw err;
			}
			opts["handle"] = [opts["handle"]];
		}
		else if (typeof(opts["handle"]) == "object" && !Array.isArray(opts["handle"])){
			opts["handle"] = subject.addHandle(opts["handle"]);
		}
		else if (Array.isArray(opts["handle"])){
			opts["handle"].forEach(function(handleName){
				if (!subject.handles.hasOwnProperty(handleName)){
					let err = new Error("The handle '" + handleName + "' is not defined");
					throw err;
				}
			});
		}
		else{
			let err = new Error("Handle must be of type string, array of strings or object");
			throw err;
		}
	}
	
	//Set Default Opts
	if (!opts.hasOwnProperty("handle")){
		if (typeof(opts["hasHandles"]) != "undefined" && !opts["hasHandles"]){
			opts["handle"] = [];
		}
		else if (!subject.handles.hasOwnProperty("reqListener")){
			opts.handle = subject.addHandle({
				"name": "reqListener",
				"target": "console",
				"formatter": "combined",
				"level": "information",
				"levelMapper": "http",
			});
			opts["handle"] = ["reqListener"];
		}
		else{
			opts.handle = ["reqListener"];
		}
	}
	
	if (!opts.hasOwnProperty("levelMapper")){
		opts["levelMapper"] = "http";
	}
	if (!opts.hasOwnProperty("level")){
		if (subject.levelMappings[opts["levelMapper"]].hasOwnProperty("debug")){
			opts["level"] = "debug";
		}
		else{
			let minMaxTuple = subject.getMinMaxSeverity(opts["levelMapper"]);
			opts["level"] = subject.getLevelName(minMaxTuple[0], opts["levelMapper"]);
		}
	}
	
	if (!opts.hasOwnProperty("logOnRequest")){
		opts.logOnRequest = false;
	}
	if (!opts.hasOwnProperty("logOnResponse")){
		opts.logOnResponse = true;
	}
	
	//Create new Logger
	let reqLogger = new LoggerProxy(opts["name"]);
	
	//Set Members
	reqLogger.logOnRequest = opts["logOnRequest"];
	reqLogger.logOnResponse = opts["logOnResponse"];
	reqLogger.setLevelMap(opts["levelMapper"]);
	reqLogger.setLevel(opts["level"]);
	reqLogger.handles = opts["handle"];
	reqLogger.hasHandles = (opts["handle"].length == 0) ? false: true;
	reqLogger.propogate = false; //http loggers do not propogate
	
	
	//Set Request Listener function
	let isMiddleware = opts["isMiddleware"];
	reqLogger.httpListener =  function(req, res, next){
		
		//Create Log record and Attach request req/res object to logger
		let logRecord = Object.create(Object.prototype, {
			"DateObj": { value: new Date() },
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
		
		//Only log on request if explicitly needed 
		if (reqLogger.logOnRequest){
			reqLogger.log(logRecord);
		}
		
		//Wait for response to collect remaining log information
		res.on('finish', function(){
			//Convert request log record to a request/response log record
			logRecord = subject.makeResponseRecord.call(subject, res, logRecord, isMiddleware);
			
			//Log on response by default
			if (reqLogger.logOnResponse){
				reqLogger.log(logRecord);
			}
		});
		
		//Call next middleware
		typeof next === 'function' && next();
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

function mw(opts){
	
	if (typeof(opts) == "undefined"){
		opts = {
			"name": "netMiddleware",
			"levelMapper": "http",
			"level": "information",
			"handle": {
				"name": "netMiddleware",
				"target": "console",
				"level": "information",
				"levelMapper": "http",
				"formatter": "combined",
			},
			"returnFunc" : true,
		};
	}
	else if (typeof(opts) == "string"){
		opts = {"name": opts};
	}
	else if (typeof(opts) != "object" || Array.isArray(opts)){
		let err = new TypeError("mw() parameter must be of type object or type string");
		throw err;
	}
	
	opts["isMiddleware"] = true;
	return createHTTPLogger(opts).httpListener;
}
function reqListener(req, res, opts){
	
	if (typeof(opts) == "undefined"){
		opts = {
			"name": "requestListener",
			"levelMapper": "http",
			"level": "information",
			"handle": {
				"name": "reqListener",
				"target": "console",
				"level": "information",
				"levelMapper": "http",
				"formatter": "combined",
			},
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

function addTokens(){
	return subject.addTokens.apply(subject, arguments);
}

function addExceptionHandle(){
	return subject.addExceptionHandle.apply(subject, arguments);
}
function addHandle(){
	return subject.addHandle.apply(subject, arguments);
}
function addFormatter(){
	return subject.addFormatter.apply(subject, arguments);
}
function addTarget(){
	return subject.addTarget.apply(subject, arguments);
}
function addFilter(){
	return subject.addFilter.apply(subject, arguments);
}
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

function on(){
	return subject.on.apply(subject, arguments);
}

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
	
	"addTokens": addTokens,
	"colorizeLevels": colorizeLevels,
	"decolorizeLevels": decolorizeLevels,
	
	"createLogger":  createLogger,
	"createHTTPLogger": createHTTPLogger,
	"getLogger": 	 getLogger,
	"getRootLogger": getRootLogger,
	
	"mw": mw,
	"reqListener": reqListener,
	
	"defineLevels": defineLevels,
	"getLevel": 	getLevel,
	"setLevel": 	setLevel,
	"setLevelMap": 	setLevelMap,
	
	"addExceptionHandle": addExceptionHandle,
	
	"addTarget": 		addTarget,
	"addHandle": 		addHandle,
	"addFormatter": 	addFormatter,	
	"addFilter":	 	addFilter,
	"addTransformer": 	addTransformer,
	
	"removeTarget": 	removeTarget,
	"removeHandle": 	removeHandle,
	"removeFormatter": 	removeFormatter,	
	"removeFilter":	  	removeFilter,
	"removeTransformer": removeTransformer,
	
	"on": on,
	
	"error":	error,
	"warn":		warn,
	"info":		info,
	"verbose": 	verbose,
	"debug": 	debug,
	"silly": 	silly,
	
	"shutdown": shutdown,
};


