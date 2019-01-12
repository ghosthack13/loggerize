/**
*
* @filename null.js
*
*
*
*
**************************************************/

module.exports.null = function (logRecord, handle){
	if (handle["emitEvents"]){
		handle["_emitter"].emit("logged", logRecord);
	}
};