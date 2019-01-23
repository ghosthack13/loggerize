var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		target: "rotatingFile",	//Set target to rotatingFile
		rotationType: "interval",	//Set rotation type to rotate on an interval
		// interval: 'day',			//interval defaults to rotate on a daily basis if not explicitly set
		// directory: "./logs",		//Default directory
		// fileName: 'target-rotatefile-interval', //Default fileName
		// fileExtension: '.log',   //Default fileExtension
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'