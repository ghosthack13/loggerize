var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle",
		target: "console",		
		formatter: {
			name: "myFormatter",
			format: "%{level} %{loggerName} %{message}",
		},
	}
});

Loggerize.removeFormatter("myFormatter");

logger.info("Log Message Test!");	//Output => 'info myLogger Log Message Test!'