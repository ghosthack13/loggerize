/**//****************************************************************************
*	
*	@author ghosthack13 <13hackghost@gmail.com>
*	@file rotatefilebyinterval.js
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

var fs = require('fs');
var os = require('os');

var parser = require('../parser.js');

var dayIndex = {
	"sunday": 0, "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4,"friday": 5, "saturday": 6,
	"sun": 0, "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6,
};

module.exports.rotateFileByInterval = function (logRecord, handle){
	
	let targetFile = "";
	if(handle.hasOwnProperty("fileNamePattern")){
		let tempStr = parser.strptime(handle["fileNamePattern"], null, logRecord["DateObj"]);
		targetFile = parser.parsePlaceholders(tempStr, handle);
	}
	else{
		//Format Date
		let dateObj = logRecord["DateObj"];
		let isoDateStr = dateObj.toISOString().substr(0, 19);
		
		//Special case for week log rotation
		if (handle.interval == "week"){
			let diff = dateObj.getDay() - dayIndex[handle.rotateDay];
			if (dateObj.getDay() < dayIndex[handle.rotateDay]){ diff = diff + 7; }
			dateObj.setDate(dateObj.getDate() - diff);
			isoDateStr = dateObj.toISOString().substr(0, 10);
		}
		
		//Set portion of UTC Date to extract as part of file name
		let periodSliceLength = {
			"year": 4,
			"month": 7,
			"day": 10,
			"hour": 13,
			"minute": 16,
			"second": 19,				
		};
		let datefmt = isoDateStr.substr(0, periodSliceLength[handle.interval]).replace(/T|-|:/g, "_");
		targetFile = handle.fileName + "_" + datefmt + handle.fileExtension;
	}
	
	let targetPath = handle.directory + targetFile;
	
	fs.stat(targetPath, function(err, stats){
		
		//If rotating into a new file or starting for the 1st time create new write stream
		if (typeof(stats) == "undefined" || !handle.hasOwnProperty("stream")){
			handle["stream"] = fs.createWriteStream(targetPath, {"flags": "a"});
			handle["stream"].on('error', function(error){
				if (handle["emitEvents"]){
					handle["_emitter"].emit("error", error, logRecord);
				}
			});
		}
		
		//Write data stream to file
		let flushed = handle["stream"].write(logRecord["output"] + os.EOL);
		if (handle["emitEvents"]){
			if (flushed){
				handle["_emitter"].emit("logged", logRecord);
			}
			else{
				//Listen for drain event in case of data overload
				handle["stream"].once('drain', function(){
					handle["_emitter"].emit("logged", logRecord);
				});
			}
		}
	});
	
};