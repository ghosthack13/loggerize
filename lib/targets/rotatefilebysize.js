/**//****************************************************************************
*	
*	@author ghosthack13 <13hackghost@gmail.com>
*	@file rotatefilebysize.js
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

module.exports.rotateFileBySize = function rotateFileBySize(logRecord, handle){
	
	//Set Pattern
	let targetFilePatt = handle["fileName"] + handle["fileExtension"] + ".(\\d+)";
	if(handle.hasOwnProperty("fileNamePattern")){
		targetFilePatt = handle["fileNamePattern"].replace("%{logNum}", "(\\d+)");
		targetFilePatt = parser.parsePlaceholders(targetFilePatt, handle);
	}
	if (handle["logNum"] != -1){
		
		let targetPath = handle["directory"] + targetFilePatt.replace("(\\d+)", handle["logNum"]);
		fs.stat(targetPath, function(err, stats){
			
			//Check size of current log file
			if (stats && stats.size >= handle["maxSize"]){
				
				//Change path to increased logNum
				targetPath = handle["directory"] + targetFilePatt.replace("(\\d+)", ++handle["logNum"]);
				
				//create new write stream to reflect new logNum
				delete handle["stream"];
			}
			
			//Log record if file limit has not yet beed reached
			if (handle["logNum"] <= handle["maxFiles"]){
				
				//Create stream if doesn't exists
				if (!handle.hasOwnProperty("stream")){
					
					//Silently monitor stream
					Object.defineProperty(handle, "stream", {
						writable: true, 
						enumerable: false, 
						configurable: true, 
						value: fs.createWriteStream(targetPath, {"flags": "a"})
					});
					
					//Emit stream errors
					handle["stream"].on('error', function(error){
						if (handle["emitEvents"]){
							handle["_emitter"].emit("error", error, logRecord);
						}
					});
				}
				
				//Flush log record to kernel or wait for drain
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
			}
			else{ 
				let error = new Error("Max File Limit Reached. Increase 'maxFiles' option to continue logging.");
				if (handle["emitEvents"]){
					handle["_emitter"].emit("error", error, logRecord);
				}
				else{
					throw error;
				}
			}
		});
	}
	else{
		//Check for other logs in directory
		fs.readdir(handle["directory"], function(err, files){
			
			//Find highest file rotation
			let targetFileRegEx = new RegExp(targetFilePatt); //doesn't work --> new RegExp(targetFilePatt)
			for (let i = 0; i < files.length; ++i){
				//Check if file in current directory has higher log number
				let matchArray = targetFileRegEx.exec(files[i]);
				if (matchArray){
					handle["logNum"] = (matchArray[1] > handle["logNum"]) ? matchArray[1] : handle["logNum"];
				}
				
				if (handle["logNum"] > handle["maxFiles"]){
					// console.log("Reached File Limit: " + handle["directory"] + targetFilePatt.replace("(\\d+)", handle["logNum"]));
					let error = new Error("Max Number of File Rotattions Reached");
					handle["_emitter"].emit("error", error);
					return;
				}
			}
			
			//Start log number at one if no previous logs were found
			if(handle["logNum"] == -1){
				handle["logNum"] = 1;
			}
			
			//Callback itself after updating handle's logNum
			rotateFileBySize(logRecord, handle);
		});
	}
};