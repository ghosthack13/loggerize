var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"hasHandles": false //set to false to avoid automatically adding the default handle
});

logger.attachHandles({
	name: "myHandle",
	target: "rotatingFile",	//Set target to rotatingFile
	rotationType: "size",	//Set rotation type to rotate on file size limit
	maxSize: "100 MB",		//Set file to rotate when file size exceeds 100 MB
	maxFiles: "10", 			//Set max file rotations to 10
	directory: __dirname,
	fileName: "example.log"
});

logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'