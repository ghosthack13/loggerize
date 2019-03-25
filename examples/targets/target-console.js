var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		"name": "myHandle",
		"target": "console"
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'