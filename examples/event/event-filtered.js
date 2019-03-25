var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	emitEvents: true, //tell logger to emit events
	handle: {
		name: "myHandle",
		target: "console",
	}
});

logger.attachFilter("regex", {"pattern": /.+filter me.+/i, "onMatch": "deny"});
logger.on("filtered", function(logRecord){
	console.log("Logger Filtered logRecord: \n", logRecord);
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger.info("Please filter Me. I don't want to be logged.");	//No Output