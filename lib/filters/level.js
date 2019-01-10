/**
*
* @filename level.js
*
*
*
*
**************************************************/

module.exports.level = function(logRecord){
	console.log(this);
	console.log(logRecord);
	if (this.orderOfSeverity == -1){
		return logRecord["levelNum"] <= this.level;
	}
	return logRecord["levelNum"] >= this.level;
}