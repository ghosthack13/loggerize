var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"hasHandles": false //set to false to avoid automatically adding the default handle
});

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
// logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'