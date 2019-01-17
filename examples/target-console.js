var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
logger.detachHandles("default");
logger.attachHandles({
	"name": "myHandle",
	"target": "console"
});
logger.info("Log Message Test!");	//Output => 'info Log Message Test!'