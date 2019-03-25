var Loggerize = require("../../lib/index.js");

Loggerize.on("logged", function(logRecord){
	console.log("logged logRecord: \n", logRecord);
});
Loggerize.on("filtered", function(logRecord){
	console.log("Filtered logRecord: \n", logRecord);
});

let logger1 = Loggerize.createLogger("myLogger1");
let logger2 = Loggerize.createLogger({
	name: "myLogger2",
	emitEvents: true,
	handle: {
		name: "myHandle",
		target: "console",
	}
});

logger2.attachFilter("regex", {"pattern": /.+filter me.+/i, "onMatch": "deny"});

logger1.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger2.info("Please filter Me. I don't want to be logged.");	//No Output