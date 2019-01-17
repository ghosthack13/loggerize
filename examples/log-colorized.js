var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
Loggerize.colorizeLevels(); //Colorize Levels

logger.error("Logger Test!");	// outputs => 'error Logger Test!'
logger.warn("Logger Test!");	// outputs => 'warn Logger Test!'
logger.info("Logger Test!"); 	// outputs => 'info Logger Test!'
logger.verbose("Logger Test!"); // outputs => 'verbose Logger Test!'
logger.debug("Logger Test!");	// outputs => 'debug Logger Test!'