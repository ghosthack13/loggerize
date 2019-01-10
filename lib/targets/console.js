/**
*
* @filename console.js
*
*
*
*
**************************************************/

module.exports.console = function (logRecord, handle){
	console.log(logRecord["output"]);
	if (handle["emitEvents"]){
		handle["_emitter"].emit("logged", logRecord);
	}
}