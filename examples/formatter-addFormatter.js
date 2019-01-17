var Loggerize = require("../lib/index.js");

Loggerize.addFormatter({
	"name": "myFormatter",
	"format": "%{level} (Severity: %{levelNum}) %{message}",
});

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"hasHandles": false //set to false to avoid automatically adding the default handle
});

logger.attachHandles({
	name: "myHandle",
	target: "console",
	formatter: "myFormatter",
});

logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'