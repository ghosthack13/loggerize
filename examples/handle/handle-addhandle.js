var Loggerize = require("../lib/index.js");

Loggerize.addHandle({
	"name": "myHandle",
	"target": "console",
});

let logger = Loggerize.createLogger("myLogger");
logger.attachHandles("myHandle");

logger.info("Log Test!");