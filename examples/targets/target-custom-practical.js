var Loggerize = require("../../lib/index.js");

var myTarget = function(logRecord){
	let output = logRecord["output"] + "\n";
	process.stdout.write(output);
};

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		"name": "myHandle",
		"target": myTarget
	}
});

logger.info("Log Message Test!");	//Output => ''