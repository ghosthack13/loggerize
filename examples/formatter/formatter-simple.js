var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: "simple",
	}
});

logger.info("Log Message Test!");	//Output => '22 Jan 2019 16:59:16 -0400 info Log Message Test!'