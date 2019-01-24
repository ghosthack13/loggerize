/**
*
* @filename null.js
*
*
*
*
**************************************************/

module.exports.null = function (logRecordRef, handle){
	
	//Create a deep copy of logRecord or it may be overritten by another logger 
	//before it is written to a file
	let logRecord = JSON.parse(JSON.stringify(logRecordRef));
	
	if (handle["emitEvents"]){
		handle["_emitter"].emit("logged", logRecord);
	}
};