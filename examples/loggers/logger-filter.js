var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
logger.attachFilter("regex", {"pattern": /.+filter me.+/i, "onMatch": "deny"});	//Set severity to the 'warn' level (numeric severity == 1). Uses the npm levelMapper by default

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger.info("Please filter Me. I don't want to be logged.");	//No Output
