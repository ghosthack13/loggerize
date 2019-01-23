"use strict";

var Loggerize = require("../../lib/index.js");
let logger = Loggerize.createLogger("myLogger");

console.log("\nLogging using non-standard input:");
console.log("------------------------------");

logger.log(new Error("Javascript Error Object!"));			// outputs => 'error Javascript Error Object!'. N.B. you have to define a formatter to output stack trace
logger.log({"level": "warn", "message": "Logger Test!"});	// outputs => 'warn Logger Test!'
logger.log("info", {"message": "Logger Test!"});			// outputs => 'info Logger Test!'
logger.log("verbose", "Logger Test!");						// outputs => 'verbose Logger Test!'
logger.log("debug");