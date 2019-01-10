/**
*
* @filename regex.js
*
*
*
*
**************************************************/

module.exports.regex = function (logRecord){
	if (this.onMatch == "deny"){
		return !this.pattern.test(logRecord["output"]);
	}
	return this.pattern.test(logRecord["output"]);
};