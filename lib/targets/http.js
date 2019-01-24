/**
*
* @filename http.js
*
*
*
*
**************************************************/

var querystring = require('querystring');

module.exports.http = function (logRecordRef, handle){
	
	//Create a deep copy of logRecord or it may be overritten by another logger 
	//before it is written to a file
	let logRecord = JSON.parse(JSON.stringify(logRecordRef));
	
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
