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
	if (!opts.hasOwnProperty("levelMapper")){
		opts["levelMapper"] = "npm";
	}
	
	if (!opts.hasOwnProperty("level")){
		if (subject.levelMappings[opts["levelMapper"]].hasOwnProperty("debug")){
			opts["level"] = "debug";
		}
		else{
			let minMaxTuple = subject.getMinMaxSeverity(opts["levelMapper"]);
			let index = (subject.levelMappings[opts["levelMapper"]]["_orderOfSeverity"] == -1) ? 1:0;
			opts["level"] = subject.getLevelName(minMaxTuple[index], opts["levelMapper"]);
		}
	}
	
	if (!opts.hasOwnProperty("handle")){
		opts["handle"] = ["default"];
	}
	
	
	//Create new Logger
	subject.loggers[opts["name"]] = new LoggerProxy(opts["name"]);
	subject.loggers[opts["name"]].setLevelMap(opts["levelMapper"]);
	subject.loggers[opts["name"]].setLevel(opts["level"]);
	subject.loggers[opts["name"]].handles = opts["handle"];
	subject.loggers[opts["name"]].hasHandles = true;
	
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

function createMiddleware(opts){
	
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
	if (!opts.hasOwnProperty("levelMapper")){
		opts["levelMapper"] = "http";
	}
	if (!opts.hasOwnProperty("level")){
		if (subject.levelMappings[opts["levelMapper"]].hasOwnProperty("debug")){
			opts["level"] = "debug";
		}
		else{
			let minMaxTuple = subject.getMinMaxSeverity(opts["levelMapper"]);
			let index = (subject.levelMappings[opts["levelMapper"]]["_orderOfSeverity"] == -1) ? 1:0;
			opts["level"] = subject.getLevelName(minMaxTuple[index], opts["levelMapper"]);
		}
	}
	if (!opts.hasOwnProperty("handle")){
		if (!subject.handles.hasOwnProperty("netMiddleware")){
			opts.handle = subject.addHandle({
				"name": "netMiddleware",
				"target": "console",
				"formatter": "combined",
				"level": "information",
				"levelMapper": "http",
			}); 
		}
		else{
			opts.handles = ["netMiddleware"];
		}
	}
	if (!opts.hasOwnProperty("logOnRequest")){
		opts.logOnRequest = false;
	}
	if (!opts.hasOwnProperty("logOnResponse")){
		opts.logOnResponse = true;
	}
	
	//Create new Logger
	let mwLogger = new LoggerProxy(opts["name"]);
	
	//Set Members
	mwLogger.logOnRequest = opts["logOnRequest"];
	mwLogger.logOnResponse = opts["logOnResponse"];
	mwLogger.setLevelMap(opts["levelMapper"]);
	mwLogger.setLevel(opts["level"]);
	mwLogger.handles = opts["handle"];
	mwLogger.hasHandles = true;
	mwLogger.propogate = false; //http loggers do not propogate
	
	//Set Middleware function
	mwLogger.getMiddleware =  function(req, res, next){
		
		//Create Log record and Attach request req/res object to logger
		let logRecord = {};
		Object.defineProperties(logRecord, {
			"DateObj": { value: new Date() },
			"req": { value: req, writable: true, enumerable: true, configurable: false },
			"res": { value: res, writable: true, enumerable: true, configurable: false },
		});
		
		if (mwLogger.logOnRequest){
			req.on("end", function(){
				// console.log("Logging request");
				
				// check for basic auth header
				let authorizationHeader = req.header("Authorization") || req.header("authorization");
				if (typeof(authorizationHeader) != "undefined"){
					const base64Credentials = authorizationHeader.split(' ')[1];
					const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
					let userPassArray = credentials.split(':');
					logRecord["user"] = userPassArray[0]; // logRecord["password"] = userPassArray[1];
				}
				
				//Create universal unique ID if designated in formatter
				for (let i = 0; i < mwLogger.handles.length; ++i){
					let handle = subject.handles[mwLogger.handles[i]];
					let formatter = subject.formatters[handle.formatter];
					if ((formatter.hasOwnProperty("format") && formatter["format"].indexOf("%{uuid}") != -1)
					|| (formatter.hasOwnProperty("fields") && formatter["fields"].indexOf("uuid") != -1)){
						const id = crypto.randomBytes(16).toString("hex");
						logRecord["uuid"] = id.substr(0, 8) + "-" + id.substr(8, 4) + "-" + id.substr(12, 4) + "-" + id.substr(16, 4) + "-" + id.substr(20, 12);
					}
				}
				
				//Merge request values into logRecord
				Object.assign(logRecord, {
					"loggerName": mwLogger.name,
					"remoteIPv4": req["ip"].replace(/^.*:/, ""),
					"method": 	req["method"],
					"protocol": req["protocol"].toUpperCase(),
					"version": 	req["httpVersion"],
					"hostname": req["hostname"],
					"url": 		req["protocol"] + "://" + req["hostname"] + req["originalUrl"],
					"referer": 	req.header("referer"),
					"referrer": req.header("referrer"),
					"userAgent":req.header("User-Agent"),
					"req.contentLength": req.header("Content-Length"),
				});
				
				//Check Middleware's Level Filters
				let levelMap = subject.levelMappings[mwLogger.levelMapper];
				if (levelMap["_orderOfSeverity"] == -1 && logRecord["levelNum"] > levelMap[mwLogger.level]){
					return;
				}
				else if (levelMap["_orderOfSeverity"] == 1 && logRecord["levelNum"] < levelMap[mwLogger.level]){
					return;
				}
				
				//Check Middleware's user attached Filters
				if (mwLogger.hasOwnProperty("_filters")){
					if (!subject.runFilters(logRecord, mwLogger._filters)){
						return;
					}
				}
				
				//Log for each handle
				mwLogger.handles.forEach(function(handleName){
					subject.render(logRecord, subject.handles[handleName]);
				});
				
			});
		}
		
		if (mwLogger.logOnResponse){
			res.on('finish', function(){
				// console.log("Logging response");
				logRecord["statusCode"] = res["statusCode"];
				logRecord["levelGroup"] = subject.getLevelName(res["statusCode"], "http");
				logRecord["levelGroupNum"] = Math.floor(res["statusCode"] / 100) * 100;
				logRecord["responseTime"] = Math.abs(new Date() - logRecord["DateObj"]);
				
				let matches = /Content-Length\W+(\d+)/.exec(res._header);
				if (matches){
					logRecord["res.contentLength"] = parseFloat(matches[1]);
				}
				
				//Create universal unique ID if designated in formatter
				for (let i = 0; i < mwLogger.handles.length; ++i){
					let handle = subject.handles[mwLogger.handles[i]];
					let formatter = subject.formatters[handle.formatter];
					if ((formatter.hasOwnProperty("format") && formatter["format"].indexOf("%{uuid}") != -1)
					|| (formatter.hasOwnProperty("fields") && formatter["fields"].indexOf("uuid") != -1)){
						const id = crypto.randomBytes(16).toString("hex");
						logRecord["uuid"] = id.substr(0, 8) + "-" + id.substr(8, 4) + "-" + id.substr(12, 4) + "-" + id.substr(16, 4) + "-" + id.substr(20, 12);
					}
				}
				
				//If values were not set on request end above, set them here
				if (!logRecord.hasOwnProperty("url")){
					Object.assign(logRecord, {
						"loggerName": mwLogger.name,
						"remoteIPv4": req["ip"].replace(/^.*:/, ""),
						"method": 	req["method"],
						"protocol": req["protocol"].toUpperCase(),
						"version": 	req["httpVersion"],
						"hostname": req["hostname"],
						"url": 		req["originalUrl"],
						"referer": 	req.header("referer"),
						"referrer": req.header("referrer"),
						"userAgent":req.header("User-Agent"),
						"req.contentLength": req.header("Content-Length"),
					});
				}
				
				//Check Middleware's Level Filters
				let levelMap = subject.levelMappings[mwLogger.levelMapper];
				if (levelMap["_orderOfSeverity"] == -1 && logRecord["levelNum"] > levelMap[mwLogger.level]){
					return;
				}
				else if (levelMap["_orderOfSeverity"] == 1 && logRecord["levelNum"] < levelMap[mwLogger.level]){
					return;
				}
				
				//Check Middleware's user attached Filters
				if (mwLogger.hasOwnProperty("_filters")){
					if (!subject.runFilters(logRecord, mwLogger._filters)){
						return;
					}
				}
				
				//Log for each handle
				mwLogger.handles.forEach(function(handleName){
					subject.render(logRecord, subject.handles[handleName]);
				});
				
			});
		}
		
		//Pass to next handler
		next();
	};
	
	//Track in master logger
	subject.loggers[opts["name"]] = mwLogger;
	
	if (opts["returnFunc"]){
		return subject.loggers[opts["name"]].getMiddleware;
	}
	
	return subject.loggers[opts["name"]];
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
		opts = {"name": opts, "returnFunc" : true};
	}
	else if (typeof(opts) != "object" || Array.isArray(opts)){
		let err = new TypeError("mw() parameter must be of type object or type string");
		throw err;
	}
	
	return createMiddleware(opts);
}
function createRequestListener(opts){
	
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
	if (!opts.hasOwnProperty("levelMapper")){
		opts["levelMapper"] = "http";
	}
	if (!opts.hasOwnProperty("level")){
		if (subject.levelMappings[opts["levelMapper"]].hasOwnProperty("debug")){
			opts["level"] = "debug";
		}
		else{
			let minMaxTuple = subject.getMinMaxSeverity(opts["levelMapper"]);
			let index = (subject.levelMappings[opts["levelMapper"]]["_orderOfSeverity"] == -1) ? 1:0;
			opts["level"] = subject.getLevelName(minMaxTuple[index], opts["levelMapper"]);
		}
	}
	if (!opts.hasOwnProperty("handle")){
		if (!subject.handles.hasOwnProperty("reqListener")){
			opts.handle = subject.addHandle({
				"name": "reqListener",
				"target": "console",
				"formatter": "combined",
				"level": "information",
				"levelMapper": "http",
			}); 
		}
		else{
			opts.handles = ["reqListener"];
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
	reqLogger.hasHandles = true;
	reqLogger.propogate = false; //http loggers do not propogate
	
	//Set Request Listener function
	reqLogger.requestListener =  function(req, res){
		
		//Create Log record and Attach request req/res object to logger
		let logRecord = {};
		Object.defineProperties(logRecord, {
			"DateObj": { value: new Date() },
			"req": { value: req, writable: true, enumerable: false, configurable: false },
			"res": { value: res, writable: true, enumerable: false, configurable: false },
		});
		
		if (reqLogger.logOnRequest){
			
			req.on("end", function(){
				
				// check for basic auth header
				let authorizationHeader = req.headers["Authorization"] || req.headers["authorization"];
				if (typeof(authorizationHeader) != "undefined"){
					const base64Credentials = authorizationHeader.split(' ')[1];
					const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
					let userPassArray = credentials.split(':');
					logRecord["user"] = userPassArray[0]; // logRecord["password"] = userPassArray[1];
				}
				
				//Create universal unique ID if designated in formatter
				for (let i = 0; i < reqLogger.handles.length; ++i){
					let handle = subject.handles[reqLogger.handles[i]];
					let formatter = subject.formatters[handle.formatter];
					if ((formatter.hasOwnProperty("format") && formatter["format"].indexOf("%{uuid}") != -1)
					|| (formatter.hasOwnProperty("fields") && formatter["fields"].indexOf("uuid") != -1)){
						const id = crypto.randomBytes(16).toString("hex");
						logRecord["uuid"] = id.substr(0, 8) + "-" + id.substr(8, 4) + "-" + id.substr(12, 4) + "-" + id.substr(16, 4) + "-" + id.substr(20, 12);
					}
				}
				
				//Merge request values into logRecord
				Object.assign(logRecord, {
					"loggerName": reqLogger.name,
					"method": 	req.method,
					"protocol": req.headers['x-forwarded-proto'] || (req.connection.encrypted) ? 'HTTPS' : 'HTTP',
					"version": 	req.httpVersion,
					"hostname": req.headers["host"].replace(/:\d+/, ""),
					"url":		req.url,
					"referer": 	req.headers["referer"],
					"referrer": req.headers["referrer"],
					"userAgent":req.headers["user-agent"],
					"req.contentLength": req.headers["content-length"],
				});
				
				//Get client ip
				if (req.headers.hasOwnProperty("x-originating-ip")){
					logRecord["remoteIPv4"] = req.headers["x-originating-ip"].split(',')[0];
				}
				else if (req.headers.hasOwnProperty("x-forwarded-for")){
					logRecord["remoteIPv4"] = req.headers["x-forwarded-for"].split(',')[0];
				}
				else if (req.headers.hasOwnProperty("x-remote-ip")){
					logRecord["remoteIPv4"] = req.headers["x-remote-ip"].split(',')[0];
				}
				else {
					logRecord["remoteIPv4"] = req.connection.remoteAddress.replace(/^.*:/, "");
				}
				
				//Check Request Listener's Level Filters
				let levelMap = subject.levelMappings[reqLogger.levelMapper];
				if (levelMap["_orderOfSeverity"] == -1 && logRecord["levelNum"] > levelMap[reqLogger.level]){
					return;
				}
				else if (levelMap["_orderOfSeverity"] == 1 && logRecord["levelNum"] < levelMap[reqLogger.level]){
					return;
				}
				
				//Check Request Listener's user attached Filters
				if (reqLogger.hasOwnProperty("_filters")){
					if (!subject.runFilters(logRecord, reqLogger._filters)){
						return;
					}
				}
				
				//Log for each handle
				reqLogger.handles.forEach(function(handleName){
					subject.render(logRecord, subject.handles[handleName]);
				});
				
			});
		}
		
		if (reqLogger.logOnResponse){
			res.on('finish', function(){
				
				// console.log("Logging response");
				logRecord["message"] = res.statusMessage;
				logRecord["statusCode"] = res.statusCode;
				logRecord["levelGroup"] = subject.getLevelName(res.statusCode, "http");
				logRecord["levelGroupNum"] = Math.floor(res.statusCode / 100) * 100;
				logRecord["responseTime"] = Math.abs(new Date() - logRecord["DateObj"]);
				
				let matches = /Content-Length\W+(\d+)/.exec(res._header);
				if (matches){
					logRecord["res.contentLength"] = parseFloat(matches[1]);
				}
				
				//Create universal unique ID if designated in formatter
				for (let i = 0; i < reqLogger.handles.length; ++i){
					let handle = subject.handles[reqLogger.handles[i]];
					let formatter = subject.formatters[handle.formatter];
					if ((formatter.hasOwnProperty("format") && formatter["format"].indexOf("%{uuid}") != -1)
					|| (formatter.hasOwnProperty("fields") && formatter["fields"].indexOf("uuid") != -1)){
						const id = crypto.randomBytes(16).toString("hex");
						logRecord["uuid"] = id.substr(0, 8) + "-" + id.substr(8, 4) + "-" + id.substr(12, 4) + "-" + id.substr(16, 4) + "-" + id.substr(20, 12);
					}
				}
				
				//If values were not set on request end above, set them here
				if (!logRecord.hasOwnProperty("url")){
					Object.assign(logRecord, {
						"loggerName": reqLogger.name,
						"method": 	req.method,
						"protocol": req.headers['x-forwarded-proto'] || (req.connection.encrypted) ? 'HTTPS' : 'HTTP',
						"version": 	req.httpVersion,
						"hostname": req.headers["host"].replace(/:\d+/, ""),
						"url":		req.url,
						"referer": 	req.headers["referer"],
						"referrer": req.headers["referrer"],
						"userAgent":req.headers["user-agent"],
						"req.contentLength": req.headers["content-length"],
					});
				}
				
				//Get client ip
				if (req.headers.hasOwnProperty("x-originating-ip")){
					logRecord["remoteIPv4"] = req.headers["x-originating-ip"].split(',')[0];
				}
				else if (req.headers.hasOwnProperty("x-forwarded-for")){
					logRecord["remoteIPv4"] = req.headers["x-forwarded-for"].split(',')[0];
				}
				else if (req.headers.hasOwnProperty("x-remote-ip")){
					logRecord["remoteIPv4"] = req.headers["x-remote-ip"].split(',')[0];
				}
				else {
					logRecord["remoteIPv4"] = req.connection.remoteAddress.replace(/^.*:/, "");
				}
				
				//Check Request Listener's Level Filters
				let levelMap = subject.levelMappings[reqLogger.levelMapper];
				if (levelMap["_orderOfSeverity"] == -1 && logRecord["levelNum"] > levelMap[reqLogger.level]){
					return;
				}
				else if (levelMap["_orderOfSeverity"] == 1 && logRecord["levelNum"] < levelMap[reqLogger.level]){
					return;
				}
				
				//Check Request Listener's user attached Filters
				if (reqLogger.hasOwnProperty("_filters")){
					if (!subject.runFilters(logRecord, reqLogger._filters)){
						return;
					}
				}
				
				//Log for each handle
				reqLogger.handles.forEach(function(handleName){
					subject.render(logRecord, subject.handles[handleName]);
				});
				
			});
		}
		
	};
	
	//Track in master logger
	subject.loggers[opts["name"]] = reqLogger;
	return subject.loggers[opts["name"]];
	
}
function reqListener(req, res, opts){
	
	//Create request listener if one does not exists
	if (!subject.loggers.hasOwnProperty("requestListener")){
		
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
		
		subject.loggers["requestListener"] = createRequestListener(opts);
	}
	
	//Run request listener
	return subject.loggers["requestListener"].requestListener(req, res);
	
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
	
	"mw": mw,
	"createMiddleware": createMiddleware,
	"reqListener": reqListener,
	"createRequestListener": createRequestListener,
	
	"createLogger":  createLogger,
	"getLogger": 	 getLogger,
	"getRootLogger": getRootLogger,
	
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


