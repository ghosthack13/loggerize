var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		target: "file",			 //Set target to file
		directory: './logs/',	 //Explicitly set to what would be the default
		fileName: 'target-file', //Explicitly set to what would be the default
		fileExtension: '.log',   //Explicitly set to what would be the default
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'

/*
logger.attachHandles({
	name: "myHandle",
	target: "file",				//Set target to file
	// path: "logs",
	// path: "./logs",
	// path: "./logs/",
	// directory: 'logs',	//Default directory
	// directory: './logs',	//Default directory
	// directory: './logs/',	//Default directory
	// directory: './logs/',	//Default directory
    // fileName: 'loggerproxy', //Default fileName
    // fileExtension: '.log',   //Default fileExtension
});
*/
// logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'