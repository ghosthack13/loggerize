var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger("myLogger");

logger.debug("Log %s Test!", "Message");		// outputs => 'debug Log Message Test!'
logger.verbose("%drd Log Message Test!", 103);	// outputs => 'verbose 103rd Log Message Test!'
logger.info("Log Message %s. %s!", "Test", "Success");	// outputs => 'info Log Message Test. Success!'
logger.warn("Log Message %s. %s!", "Test", "Success", "Finished");	// outputs => 'warn Log Message Test. Success! Finished'
