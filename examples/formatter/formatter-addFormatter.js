// @filename formatter-addFormatter.js

var Loggerize = require("../../lib/index.js");

Loggerize.addFormatter({
	"name": "myFormatter",
	"format": "%{level} (Severity: %{levelNum}) %{message}",
});

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: "myFormatter",
	}
});

logger.info("Log Message Test!");	//Output to file => 'info (Severity: 2) Log Message Test!'