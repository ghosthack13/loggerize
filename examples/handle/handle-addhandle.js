var Loggerize = require("../lib/index.js");

//Add handle which will become globally accesible
Loggerize.addHandle({
	"name": "myHandle",
	"target": "console",
});

let logger = Loggerize.createLogger("myLogger");
logger.attachHandles("myHandle");

logger.info("Log Test!");