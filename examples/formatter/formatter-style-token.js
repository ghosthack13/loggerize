var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle", 
		formatter: {
			name: "myFormatter",
			level: {
				style: ["underline"],
			},
			message: {
				style: "bgblue yellowbright",
			},
			format: "%{level} %{message}",
		},
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'