var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: {
			"name": "myFormatter",
			"transformer": "uppercase",
			"format": "%{level} %{message}",
		}
	},
});

logger.info("Log Message Test!");	//Output => 'INFO LOG MESSAGE TEST!'