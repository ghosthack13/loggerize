var Loggerize = require("../../lib/index.js");

Loggerize.addFilter("limit", function(logRecord){
	++this.numLogs;
	if (this.numLogs > this.threshold){
		return false;
	}
	return true;
});


let logger = Loggerize.createLogger({ name: "myLogger" });

let filterOpts = {"threshold": 3, "numLogs": 0};
logger.attachFilter("limit", filterOpts);

logger.info("1st Log Message Test!");	//Output => 'info 1st Log Message Test!'
logger.info("2nd Log Message Test!");	//Output => 'info 2nd Log Message Test!'
logger.info("3rd Log Message Test!");	//Output => 'info 3rd Log Message Test!'
logger.info("4th Log Message Test!");	//No Output - Current and subsequent messages are filtered