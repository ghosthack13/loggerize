var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
logger.setLevel("warn");	//Set severity to the 'warn' level (numeric severity == 1). Uses the npm levelMapper by default

logger.silly("Log Message Test!");	//No Output because 'silly' has a lower severity than 'warn'
logger.debug("Log Message Test!");	//No Output because 'debug' has a lower severity than 'warn'
logger.verbose("Log Message Test!"); //No Output because 'verbose' has a lower severity than 'warn'
logger.info("Log Message Test!");	//No Output because 'info' has a lower severity than 'warn'
logger.warn("Log Message Test!");	// Outputs => 'warn Log Message Test!' because severity equals minimum severity of logger
logger.error("Log Message Test!");	// Outputs => 'error Log Message Test!' because severity equals exceeds severity of logger
