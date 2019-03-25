/**//****************************************************************************
*	
*	@author ghosthack13 <13hackghost@gmail.com>
*	@file http.js
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

"use strict"

var querystring = require('querystring');

module.exports.http = function (logRecord, handle){
	
	//Append user defined payload to logRecord
	for (let key in handle["body"]){
		logRecord[key] = handle["body"][key];
	}
	
	//Stringify Payload
	delete logRecord["DateObj"]; //remove javascript object, only strings allowed
	let payload = querystring.stringify(logRecord);
	
	let params = "";
	if (handle["method"] == "GET"){
		let prefix = "?";
		if (/\/\w*\?/.test(handle["url"])){
			prefix = "&";
		}
		params = prefix + payload;
	}
	
	//Set Headers
	if (handle["method"] == "POST"){
		handle["headers"]["Content-Length"] = Buffer.byteLength(payload);		
		handle["headers"]["Content-Type"] = "application/x-www-form-urlencoded";
		if (handle["json"] === true){
			handle["headers"]["Content-Type"] = "application/json";
		}
		else if (handle["xml"] === true){
			handle["headers"]["Content-Type"] = "application/xml";
		}
	}
	
	//Set request options
	let options = {
		"path": 	handle["path"] + params,
		"host": 	handle["host"],
		"port": 	handle["port"],
		"method": 	handle["method"],
		"headers":	handle["headers"],
		"keepAlive": handle["keepAlive"]
	};
	
	//Setup Request if POST or Make Request if GET
	const req = handle["connection"].request(options, function(res){
		let data = "";
		res.setEncoding('utf8');		
		res.on('data', function(chunk){
			// console.log('PARTIAL BODY: ' + chunk);
			data += chunk;
		});
		res.on('end', function(){
			logRecord["response"] = data;
			if (handle["emitEvents"]){
				handle["_emitter"].emit("logged", logRecord, data);
			}
		});
	});
	
	//Emit Error
	req.on('error', function(err) {
		//console.log('problem with request: ' + err.message);
		if (handle["emitEvents"]){
			handle["_emitter"].emit("error", err, logRecord);
		}
	});
	
	//Send POST data
	if(options["method"] == "POST"){
		req.write(payload);
	}
	
	//End Request
	req.end();
};
