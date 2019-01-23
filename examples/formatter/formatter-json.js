var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle", 
		formatter: {
			name: "myFormatter",
			json: true,
			fields: ["level", "message"],
		},
	}
});

logger.info("Log Message Test!");	//Output => '{"level":"info","message":"Log Message Test!"}'