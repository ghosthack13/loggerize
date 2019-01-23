var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		target: "rotatingFile",	//Set target to rotatingFile
		rotationType: "size",	//Set rotation type to rotate on file size limit
		maxSize: "100 MB",		//Set file to rotate when file size exceeds 100 MB
		maxFiles: "10", 			//Set max file rotations to 10
		// directory: "./logs",		//Default directory
		// fileName: "target-rotatefile-size",
		// fileExtension: '.log',   //Default fileExtension
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'