var Loggerize = require("../lib/index.js");

Loggerize.on("filtered", function(logRecord){
	console.log("Filtered logRecord: ", JSON.stringify(logRecord));
});

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		emitEvents: true,
		name: "myHandle",
		formatter: {
			name: "myFormatter",
			format: "%{level} %{message}",
		},
		filter: {"regex": {"pattern": /.+filter me.+/i, "onMatch": "deny"}},
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger.info("Please filter Me. I don't want to be logged.");	//No Output