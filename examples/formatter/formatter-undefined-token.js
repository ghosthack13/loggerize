var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle",
		formatter: {
			name: "myFormatter",
			format: "%{timestamp} %{level} %{message}",
		},
	}
});

logger.info();	//Output => 'info Log Message Test!'