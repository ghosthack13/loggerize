var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false,
});

//Create handle during logger attachment
logger.attachHandles({
	name: "myHandle",
	level: "info",
});

logger.info("Log Test!");	//Output => 'info Log Test!'