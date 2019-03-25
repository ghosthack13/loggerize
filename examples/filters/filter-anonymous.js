var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		filter: function(logRecord){
			
			if (typeof(this.numLogs) == "undefined"){
				this.numLogs = 0;
			}
			++this.numLogs;
			
			this.threshold = 3;
			if (this.numLogs > this.threshold){
				return false;
			}
			return true;
		}
	}
});

logger.info("1st Log Message Test!");	//Output => 'info 1st Log Message Test!'
logger.info("2nd Log Message Test!");	//Output => 'info 2nd Log Message Test!'
logger.info("3rd Log Message Test!");	//Output => 'info 3rd Log Message Test!'
logger.info("4th Log Message Test!");	//No Output - Messages are filtered
