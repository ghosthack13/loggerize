
## Filters

Filters provide a finer grained facility for determining which log records to output. Filters can be attached to loggers
or defined on handles. To use a filter on a logger we must `attachFilter()` which takes two parameters. The first parameter 
is the name of the filter while the second parameter is the filter options. Let's look at an example using the built 
in `regex` filter.

var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
logger.attachFilter("regex", {"pattern": /.+filter me.+/i, "onMatch": "deny"});	//Set severity to the 'warn' level (numeric severity == 1). Uses the npm levelMapper by default

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger.info("Please filter Me. I don't want to be logged.");	//No Output

In this case we attached the regex filter and defined a pattern using Javascript's regex format to conduct 
a case-insensitive test for the phrase 'filter me' anywhere in the log message. We told the regex filter to 
"deny" (case-sensitive) any log that matches the target message.

Alternatively you can achieve the same effect by attaching the filter to the handle.

var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
logger.detachHandles("default"); //Don't need default logger since we are attaching out own
logger.attachHandles({
	"name": "myHandle",
	"filter": {"regex": {"pattern": /.+filter me.+/i, "onMatch": "deny"}},
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger.info("Please filter Me. I don't want to be logged.");	//No Output

Furthermore a handle can take a plain user defined anonymous function as a filter.

var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
logger.detachHandles("default"); //Don't need default logger since we are attaching out own
logger.attachHandles({
	"name": "myHandle",
	"filter": function(logRecord){
		if (/.+filter me.+/i.test(logRecord["message"])){
			return false;
		}
		return true;
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger.info("Please filter Me. I don't want to be logged.");	//No Output


