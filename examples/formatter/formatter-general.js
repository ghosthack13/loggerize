var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle", 
		formatter: {
			name: "myFormatter",
			style: "inverse",
			format: "loggerName: %{loggerName} | levelNum: %{levelNum} | uuid: %{uuid} | timestamp: %{timestamp}",
		},
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'