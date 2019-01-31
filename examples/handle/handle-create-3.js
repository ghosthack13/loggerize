var Loggerize = require("../../lib/index.js");

Loggerize.addHandle({
	"name": "myHandle",
	"level": "info",
});

let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false	//Set to false to not add default handle
});

logger.attachHandles("myHandle");	//Attach the handle called 'myHandle'
logger.info("Log Test!");	//Output => 'info Log Test!'