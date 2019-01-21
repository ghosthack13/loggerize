var Loggerize = require("../../lib/index.js");

Loggerize.setLevelMapper("syslog");
let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {name: "mySyslogHandle", levelMapper: "syslog"}
});

logger.debug("Log Message Test!");	// Outputs => 'debug Log Message Test!'
logger.info("Log Message Test!");	// Outputs => 'info Log Message Test!'
logger.notice("Log Message Test!");	// Outputs => 'notice Log Message Test!'
logger.warning("Log Message Test!");// Outputs => 'warning Log Message Test!'
logger.err("Log Message Test!");	// Outputs => 'err Log Message Test!'
logger.crit("Log Message Test!"); 	// Outputs => 'crit Log Message Test!'
logger.alert("Log Message Test!"); 	// Outputs => 'alert Log Message Test!'
logger.emerg("Log Message Test!");	// Outputs => 'emerg Log Message Test!'
