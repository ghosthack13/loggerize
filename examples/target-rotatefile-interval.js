var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
logger.detachHandles("default");
logger.attachHandles({
	name: "myHandle",
	target: "rotatingFile",		//Set target to rotatingFile
	rotationType: "interval",	//Set rotation type to rotate on an interval
	// interval: 'day',			//interval defaults to rotate on a daily basis if not explicitly set
	directory: __dirname,	//Default directory
    // fileName: 'loggerproxy', //Default fileName
    // fileExtension: '.log',   //Default fileExtension
});

logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'