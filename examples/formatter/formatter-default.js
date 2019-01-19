var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"hasHandles": false //set to false to avoid automatically adding the default handle
});

logger.attachHandles({
	name: "myHandle",
	target: "console",
	formatter: "default",
});

logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'