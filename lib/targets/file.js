/**//****************************************************************************
*	
*	@author ghosthack13 <13hackghost@gmail.com>
*	@file file.js
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

module.exports.file = function (logRecord, handle){
	
	//Create write stream on current handle
	if (!handle.hasOwnProperty("stream")){
		let targetPath = handle.directory + handle.fileName + handle.fileExtension;
		Object.defineProperty(handle, "stream", {
			writable: true,
			enumerable: false,
			configurable: false,
			value: fs.createWriteStream(targetPath, {"flags": "a"})
		});
		
		handle["stream"].on('error', function(err){
			if (handle["emitEvents"]){
				handle["_emitter"].emit("error", err, logRecord);
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
};