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

var util = require('util');
var crypto = require("crypto");


var statusMap = {
	// 1×× Informational
	100: "Continue",
	101: "Switching Protocols",
	102: "Processing",

	// 2×× Success
	200: "OK",
	201: "Created",
	202: "Accepted",
	203: "Non-authoritative Information",
	204: "No Content",
	205: "Reset Content",
	206: "Partial Content",
	207: "Multi-Status",
	208: "Already Reported",
	226: "IM Used",

	// 3×× Redirection
	300: "Multiple Choices",
	301: "Moved Permanently",
	302: "Found",
	303: "See Other",
	304: "Not Modified",
	305: "Use Proxy",
	307: "Temporary Redirect",
	308: "Permanent Redirect",

	// 4×× Client Error
	400: "Bad Request",
	401: "Unauthorized",
	402: "Payment Required",
	403: "Forbidden",
	404: "Not Found",
	405: "Method Not Allowed",
	406: "Not Acceptable",
	407: "Proxy Authentication Required",
	408: "Request Timeout",
	409: "Conflict",
	410: "Gone",
	411: "Length Required",
	412: "Precondition Failed",
	413: "Payload Too Large",
	414: "Request-URI Too Long",
	415: "Unsupported Media Type",
	416: "Requested Range Not Satisfiable",
	417: "Expectation Failed",
	418: "I'm a teapot",
	421: "Misdirected Request",
	422: "Unprocessable Entity",
	423: "Locked",
	424: "Failed Dependency",
	426: "Upgrade Required",
	428: "Precondition Required",
	429: "Too Many Requests",
	431: "Request Header Fields Too Large",
	444: "Connection Closed Without Response",
	451: "Unavailable For Legal Reasons",
	499: "Client Closed Request",

	// 5×× Server Error
	500: "Internal Server Error",
	501: "Not Implemented",
	502: "Bad Gateway",
	503: "Service Unavailable",
	504: "Gateway Timeout",
	505: "HTTP Version Not Supported",
	506: "Variant Also Negotiates",
	507: "Insufficient Storage",
	508: "Loop Detected",
	510: "Not Extended",
	511: "Network Authentication Required",
	599: "Network Connect Timeout Error",
};


function cloneRecord(logRecord){
	
	//Clone standard info
	let record = {
		"DateObj": new Date(logRecord["DateObj"].valueOf()),
		"level": 	logRecord["level"],
		"levelNum": logRecord["levelNum"],
		"message": 	logRecord["message"],
		"timestamp": logRecord["timestamp"],
		"uuid": 	logRecord["uuid"],
		"loggerName": logRecord["loggerName"],
		"output": logRecord["output"],
	};
	
	//Clone HTTP info
	if (logRecord["_isHTTPRecord"] == true){
		record["_isHTTPRecord"] = logRecord["_isHTTPRecord"];
		record["remoteIPv4"] = logRecord["remoteIPv4"];
		record["method"] = logRecord["method"];
		record["user"] = logRecord["user"];
		record["protocol"] = logRecord["protocol"];
		record["version"] = logRecord["version"];
		record["hostname"] = logRecord["hostname"];
		record["path"] = logRecord["path"];
		record["url"] = logRecord["url"];
		record["referer"] = logRecord["referer"];
		record["referrer"] = logRecord["referrer"];
		record["userAgent"] = logRecord["userAgent"];
		record["statusCode"] = logRecord["statusCode"];
		record["levelGroup"] = logRecord["levelGroup"];
		record["levelGroupNum"] = logRecord["levelGroupNum"];
		record["responseTime"] = logRecord["responseTime"];
		record["req.contentLength"] = logRecord["req.contentLength"];
		record["res.contentLength"] = logRecord["res.contentLength"];
	};
	
	//Clone custom tokens
	for (let token in this.customTokens){
		if (this.customTokens.hasOwnProperty(token)){
			record[token] = this.customTokens[token];
		}
	}
	
	return record;
}

function makeRecord(handleList, levelMapper, levelName, message){
	
	//Create Log Record
	let logRecord = Object.create(Object.prototype, {
		"DateObj": { value: new Date(), writable: false, enumerable: false, configurable: false }
	});
	
	//Create universal unique ID if designated in formatter
	for (let i = 0; i < handleList.length; ++i){
		let handle = this.handles[handleList[i]];
		let formatter = this.formatters[handle.formatter];
		if ((formatter.hasOwnProperty("format") && formatter["format"].indexOf("%{uuid}") != -1)
		|| (formatter.hasOwnProperty("fields") && formatter["fields"].indexOf("uuid") != -1)){
			const id = crypto.randomBytes(16).toString("hex");
			logRecord["uuid"] = id.substr(0, 8) + "-" + id.substr(8, 4) + "-" + id.substr(12, 4) + "-" + id.substr(16, 4) + "-" + id.substr(20, 12);
		}
	}
	
	//Check if user passed single argument object
	if (arguments.length == 3 && typeof(arguments[2]) == "object"){
		
		//Check if parameter is an Error object
		let logObj = arguments[2];
		if (logObj instanceof Error){
			message = logObj["message"];
			logRecord["errorName"] = logObj["name"];
			logRecord["stack"] = logObj["stack"].replace(/.+/i, "");
			
			//Guess Level
			if (this.levelMappings[levelMapper].hasOwnProperty("error")){
				levelName = "error";
			}
			else if (this.levelMappings[levelMapper].hasOwnProperty("err")){
				levelName = "err";
			}
			else if (this.levelMappings[levelMapper].hasOwnProperty("defcon1")){
				levelName = "defcon1";
			}
			else{
				let error = new TypeError("Could not determine level and message or string interpolation from log parameters");
				throw error;
			}
		}
		else if (!Array.isArray(logObj)){
			//Try to extract a message from the passed object
			if (!logObj.hasOwnProperty("level")){
				let error = new TypeError("Could not determine level and message or string interpolation from log parameters");
				throw error;
			}
			
			levelName = logObj["level"];
			if (logObj.hasOwnProperty("message")){
				message = logObj["message"];
			}
		}
		else{
			let error = new TypeError("Could not determine level and message or string interpolation from log parameters");
			throw error;
		}
	}
	
	//Check if user passed level and object
	if ((typeof(levelName) == "string" || typeof(levelName) == "number") && typeof(message) == "object"){
		let logObj = message;
		if (logObj instanceof Error){
			message = logObj["message"];
			logRecord["errorName"] = logObj["name"];
			logRecord["stack"] = logObj["stack"].replace(/.+/i, "");
		}
		else if (!Array.isArray(logObj)){
			//Try to extract a message from the passed object
			if (logObj.hasOwnProperty("message")){
				message = logObj["message"];
			}
		}
		else{
			let error = new TypeError("Could not determine level and message or string interpolation from log parameters");
			throw error;
		}
	}
	
	//Carry out string interpolation
	if(arguments.length > 4){
		if (typeof(message) == "string"){
			let args = Array.prototype.slice.call(arguments);
			message = util.format.apply(this, args.slice(3, args.length + 1));
		}
		else{
			let error = new TypeError("Could not determine level and message or string interpolation from log parameters");
			throw error;
		}
	}
	
	//Ensure level is defined (Throws error if not found)
	if (typeof(levelName) == "number"){
		levelName = this.getLevelName(levelName, levelMapper);
	}
	
	//Ensure levelName is part of the levelmapper
	if (!this.levelMappings[levelMapper].hasOwnProperty(levelName)){
		let err = new Error("'" + levelName + "' is not a valid level under the '" + levelMapper + "' level mapping");
		throw err;
	}
	
	//Update Log Record
	logRecord["level"] = levelName;
	logRecord["levelNum"] = this.levelMappings[levelMapper][levelName];
	logRecord["message"] = message;
	
	return logRecord;
}

function makeRequestRecord(req, logRecord, isMiddleware){
	
	if (isMiddleware){
		
		// check for basic auth header
		let authorizationHeader = req.header("Authorization") || req.header("authorization");
		if (typeof(authorizationHeader) != "undefined"){
			const base64Credentials = authorizationHeader.split(' ')[1];
			const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
			let userPassArray = credentials.split(':');
			logRecord["user"] = userPassArray[0]; // logRecord["password"] = userPassArray[1];
		}
		
		logRecord["remoteIPv4"] = req.ip.replace(/^.*:/, "");
		logRecord["method"] = req.method;
		logRecord["protocol"] = req.protocol.toUpperCase();
		logRecord["version"] = req.httpVersion;
		logRecord["hostname"] = req.hostname;
		logRecord["path"] = req.originalUrl,
		logRecord["url"] = req.protocol + "://" + req.hostname + req.originalUrl,
		logRecord["referer"] = req.header("referer") || req.header("referrer");
		logRecord["referrer"] = req.header("referrer") || req.header("referer");
		logRecord["userAgent"] = req.header("User-Agent");
		logRecord["req.contentLength"] = req.header("Content-Length");
	}
	else{
		
		// check for basic auth header
		let authorizationHeader = req.headers["Authorization"] || req.headers["authorization"];
		if (typeof(authorizationHeader) != "undefined"){
			const base64Credentials = authorizationHeader.split(' ')[1];
			const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
			let userPassArray = credentials.split(':');
			logRecord["user"] = userPassArray[0]; // logRecord["password"] = userPassArray[1];
		}
		
		logRecord["version"] = req.httpVersion;
		logRecord["method"] = req.method;
		logRecord["protocol"] = req.headers['x-forwarded-proto'] || (req.connection.encrypted) ? 'HTTPS' : 'HTTP';
		logRecord["hostname"] = req.headers["host"].replace(/:\d+/, "");
		logRecord["path"] = req.url;
		logRecord["url"] = logRecord["protocol"] + "://" + logRecord["hostname"] + req.url;
		logRecord["referer"] = req.headers["referer"] || req.headers["referrer"];
		logRecord["referrer"] = req.headers["referrer"] || req.headers["referer"];
		logRecord["userAgent"] = req.headers["user-agent"];
		logRecord["req.contentLength"] = req.headers["content-length"];
		
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
		
	}
	
	return logRecord;
}

function makeResponseRecord(res, logRecord, isMiddleware){
	
	if (isMiddleware){
		logRecord["statusCode"] = res["statusCode"];
		logRecord["levelNum"] = res["statusCode"];
		logRecord["message"] = statusMap[res["statusCode"]];
		logRecord["levelGroup"] = this.getLevelName(res["statusCode"], "http");
		logRecord["levelGroupNum"] = Math.floor(res["statusCode"] / 100) * 100;
		logRecord["responseTime"] = Math.abs(new Date() - logRecord["DateObj"]);
		
		let matches = /Content-Length\W+(\d+)/.exec(res._header);
		if (matches){
			logRecord["res.contentLength"] = parseFloat(matches[1]);
		}
		
	}
	else{
		logRecord["statusCode"] = res.statusCode;
		logRecord["levelNum"] = res["statusCode"];
		logRecord["message"] = statusMap[res["statusCode"]]; //res.statusMessage;
		logRecord["levelGroup"] = this.getLevelName(res.statusCode, "http");
		logRecord["levelGroupNum"] = Math.floor(res.statusCode / 100) * 100;
		logRecord["responseTime"] = Math.abs(new Date() - logRecord["DateObj"]);
		
		let matches = /Content-Length\W+(\d+)/.exec(res._header);
		if (matches){
			logRecord["res.contentLength"] = parseFloat(matches[1]);
		}
	}
	
	return logRecord;
}


module.exports = {
	"cloneRecord": cloneRecord,
	"makeRecord": makeRecord,
	"makeRequestRecord": makeRequestRecord,
	"makeResponseRecord": makeResponseRecord,
};