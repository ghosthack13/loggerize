var Loggerize = require("../../lib/index.js");

//Create Basic Logger
let logger = Loggerize.createLogger("myLogger");

// Outputs => 'debug Successfully Logged'
logger.debug("Successfully Logged");