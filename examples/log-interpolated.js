var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger("myLogger");

logger.debug("Log %s Test!", "Message");
logger.verbose("%drd Log Message Test!", 103);
logger.info("Log Message %s. %s!", "Test", "Success");
logger.warn("Log Message %s. %s!", "Test", "Success", "Finished");