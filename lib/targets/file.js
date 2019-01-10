/**
*
* @filename file.js
*
*
*
*
**************************************************/

var fs = require('fs');
var os = require('os');

module.exports.file = function (logRecord, handle){
	// console.log(handle); return;
	
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
	
	// if (flushed && handle["emitEvents"]){
		// handle["_emitter"].emit("logged", logRecord);
	// }
	// else{
		// //Listen for drain event in case of data overload
		// handle["stream"].once('drain', function(){
			// if (handle["emitEvents"]){
				// handle["_emitter"].emit("logged", logRecord);
			// }
		// });
	// }

}