
## Filters

Filters provide a finer grained facility for determining which logs to output. 
Filters can be attached to loggers or defined on handles. Currently Loggerize 
has one built in filter, the regex filter, that operates on the message portion 
of the logRecord. 

### Logger Attached Filters

To use a filter on a logger we use the `attachFilter()` logger function which 
takes two parameters. The first parameter is the name of the filter while the 
second parameter is the filter config object which defines how the filter should 
behave. Let's look at an example using the built in `regex` filter.

```javascript
// @filename filter-logger.js
var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
logger.attachFilter("regex", {"pattern": /.+filter me.+/i, "onMatch": "deny"});	//Set severity to the 'warn' level (numeric severity == 1). Uses the npm levelMapper by default

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger.info("Please filter Me. I don't want to be logged.");	//No Output
```

In this case we attached the regex filter and defined a pattern using Javascript's 
regex format to conduct a case-insensitive test for the phrase 'filter me' anywhere 
in the log message. We told the regex filter to "deny" (case-sensitive) any log 
that matches the target message.

### Handle Attached Filters

Filters can also be attached to a handle instead of just a logger. When a filter is 
attached to a handle, all loggers that use that handle will have the the log output 
filtered instead of having to attach the same filter to multiple loggers.

```javascript
// @filename filter-handle.js

var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		filter: { 
			"regex": {
				"pattern": /.+filter me.+/i, 
				"onMatch": "deny"
			}
		}
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger.info("Please filter Me. I don't want to be logged.");	//No Output
```

### User-Defined Filters (Advance)

Advance users who wish to add their own custom filters can do so very easily 
using the module-level `addFilter` function. This function takes two arguments, 
the name of the filter and a function definition that does the filtering.

#### Using Custom Filter on Logger

The below example creates a user-defined filter that sets the maximum number 
of messages that are allowed to be log. This filter sets two options: 
'threshold' is the maximum number of messages to keep while 'numLogs' 
represents the current count of log messages and requires an initial number 
in this specific implementation.

```javascript

var Loggerize = require("../../lib/index.js");
Loggerize.addFilter("limit", function(logRecord){
	++this.numLogs;
	if (this.numLogs > this.threshold){
		return false;
	}
	return true;
});


let logger = Loggerize.createLogger({ name: "myLogger" });

let filterOpts = {"threshold": 3, "numLogs": 0};
logger.attachFilter("limit", filterOpts);

logger.info("1st Log Message Test!");	// Output => 'info 1st Log Message Test!'
logger.info("2nd Log Message Test!");	// Output => 'info 2nd Log Message Test!'
logger.info("3rd Log Message Test!");	// Output => 'info 3rd Log Message Test!'
logger.info("4th Log Message Test!");	// No Output - Messages are filtered
```

Filters created using the module-level `addFilter` are available to all loggers.

#### Using Custom Filter on Handle

To add a filter in Loggerize can be as easy as creating an anonymous funtion.

```javascript
// @filename filter-anonymous.js
var Loggerize = require("../../lib/index.js");
let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		filter: function(logRecord){
			
			if (typeof(this.numLogs) == "undefined"){
				this.numLogs = 0;
			}
			++this.numLogs;
			
			this.threshold = 3;
			if (this.numLogs > this.threshold){
				return false;
			}
			return true;
		}
	}
});

logger.info("1st Log Message Test!");	//Output => 'info 1st Log Message Test!'
logger.info("2nd Log Message Test!");	//Output => 'info 2nd Log Message Test!'
logger.info("3rd Log Message Test!");	//Output => 'info 3rd Log Message Test!'
logger.info("4th Log Message Test!");	//No Output - Messages are filtered
```

This example highlights Loggerize's **state aware** filter technology that 
remembers data members (variables with 'this' keyword). These members maintain 
their state even within an anonymous function and across log events and function 
calls.




