var Loggerize = require("../lib/index.js");

Loggerize.addFormatter({
	"name": "myFormatter",
	"message": {"style": "red"},
	// "transformer": "uppercase",
	// "transformer": function(input){ return input.substring(0, 10); },
	"timestamp": {"pattern": "ISO"},
	"format": "%{timestamp} %{level} %{message}",
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