var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle",
		level: "info",
	},
});

logger.info("Log Test!");	//Output => 'info Log Test!'
