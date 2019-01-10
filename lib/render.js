var util = require('util');
var crypto = require("crypto");


function makeRecord(handleList, levelMapper, levelName, message){
	
	//Create Log Record
	let logRecord = {
		"DateObj": new Date()
	};
	
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
			logRecord["stack"] = logObj["stack"].replace(/.+/i, "");;
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
	
	//Update Log Record
	logRecord["level"] = levelName;
	logRecord["levelNum"] = this.levelMappings[levelMapper][levelName];
	logRecord["message"] = message;
	
	return logRecord;
}

function render(logRecord, handle){
	
	//Only run active handles
	if (!handle.active){
		return;
	}
	
	//Check Handle's Level Filters
	let levelMap = this.levelMappings[handle["levelMapper"]];
	if (levelMap["_orderOfSeverity"] == -1 && logRecord["levelNum"] > levelMap[handle["level"]]){
		return;
	}
	else if (levelMap["_orderOfSeverity"] == 1 && logRecord["levelNum"] < levelMap[handle["level"]]){
		return;
	}
	
	//Run Handle's user attached filters
	if (handle.hasOwnProperty("_filters")){
		if (!this.runFilters(logRecord, handle["_filters"])){
			// if (handle["emitEvents"]){
				// this.emit("logged", {"filtered": true});
			// }
			return;
		}
	}
	
	//Format Log Record
	let formatterName = handle["formatter"];
	logRecord = this.format(logRecord, formatterName, handle["levelMapper"]);
	
	if(typeof(handle["target"]) === "function"){
		handle["target"].call(this, logRecord, handle);
		return;
	}
	// console.log(handle); process.exit();
	//Send Log Record to output target
	let targetName = handle["target"];
	if (handle["rotationType"] === "interval"){
		targetName = "rotateFileByInterval";
	}
	else if (handle["rotationType"] === "size"){
		targetName = "rotateFileBySize";
	}
	
	this.targets[targetName].call(this, logRecord, handle);
}


module.exports = {
	"render": render,
	"makeRecord": makeRecord,
};