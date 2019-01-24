var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	emitEvents: true, //tell logger to emit events
	handle: {
		emitEvents: true, //tell handle to emit events
		name: "myHandle",
		target: "console",
	}
});


logger.on("logged", function(logRecord){
	console.log("logged logRecord: \n", logRecord);
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
