var Loggerize = require("../../lib/index.js");

var myTarget = function(){};

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		"name": "myHandle",
		"target": myTarget
	}
});

logger.info("Log Message Test!");	//Output => ''