var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
logger.detachHandles("default"); //Don't need default logger since we are attaching out own
logger.attachHandles({
	"name": "myHandle",
	"filter": {"regex": {"pattern": /.+filter me.+/i, "onMatch": "deny"}},
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger.info("Please filter Me. I don't want to be logged.");	//No Output