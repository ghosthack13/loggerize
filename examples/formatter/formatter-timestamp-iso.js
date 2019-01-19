var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle", 
		formatter: {
			name: "myFormatter",
			timestamp: { pattern: "ISO"},
			timestamp: { pattern: "iso"},
			format: "%{timestamp} %{level} %{message}",
		},
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'