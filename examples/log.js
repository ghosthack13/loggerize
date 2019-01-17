"use strict";

var Loggerize = require("../lib/index.js");
let logger = Loggerize.createLogger({"name": "myLogger", "handle": {"name": "myHandle", "level": "silly"}});

logger.error("Logger Test!");	// outputs => 'error Logger Test!'
logger.warn("Logger Test!");	// outputs => 'warn Logger Test!'
logger.info("Logger Test!"); 	// outputs => 'info Logger Test!'
logger.verbose("Logger Test!"); // outputs => 'verbose Logger Test!'
logger.debug("Logger Test!");	// outputs => 'debug Logger Test!'

logger.log(new Error("Javascript Error Object!"));			// outputs => 'error Javascript Error Object!'. N.B. you have to define a formatter to output stack trace
logger.log({"level": "warn", "message": "Logger Test!"});	// outputs => 'warn Logger Test!'
logger.log("info", {"message": "Logger Test!"});			// outputs => 'info Logger Test!'
logger.log("verbose", "Logger Test");						// outputs => 'verbose Logger Test!'
logger.log("debug");										// outputs => 'debug '