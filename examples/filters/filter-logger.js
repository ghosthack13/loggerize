var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
let filterOpts = {"pattern": /.+filter me.+/i, "onMatch": "deny"};
logger.attachFilter("regex", filterOpts);

logger.info("Please filter Me. I don't want to be logged.");	//No Output
logger.info("Log Message Test!");	//Output => 'info Log Message Test!'