/**
*
* @filename regex.js
*
*
*
*
**************************************************/

module.exports.regex = function (logRecord){
	// let targetStr = (typeof(logRecord["output"]) == "undefined") ? logRecord["message"] : logRecord["output"];
	let targetStr = logRecord["message"];
	if (this.onMatch == "deny"){
		return !this.pattern.test(targetStr);
	}
	return this.pattern.test(targetStr);
};