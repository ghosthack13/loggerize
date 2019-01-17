var Loggerize = require("../lib/index.js");

//Add handle which will become globally accesible
Loggerize.addHandle({
	"name": "myFileHandle", 
	"path": "./logs/test.log"
});

let logger = Loggerize.createLogger("myLogger");
logger.attachHandles("myHandle");

logger.info("Log Test!");