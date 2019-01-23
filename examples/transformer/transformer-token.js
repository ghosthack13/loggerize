var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: {
			"name": "myFormatter",
			"message": {
				"transformer": ["lowercase"],
			},
			"format": "%{level} %{message}",
		}
	},
});

logger.info("Log Message Test!");	//Output => 'info log message test!'