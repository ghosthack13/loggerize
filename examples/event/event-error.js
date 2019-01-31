var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	emitEvents: true, //tell handle to emit events
	handle: {
		emitEvents: true, //tell handle to emit events
		name: "myHandle",
		target: "rotatingFile",
		maxFiles: Number.NEGATIVE_INFINITY,
	}
});

logger.on("error", function(err, logRecord){
	console.log(err);
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
