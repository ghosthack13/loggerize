
## Events

NodeJS allows us to manage asynchronous code via the use of events. By taking 
advantage of this event driven architecture, Loggerize maximizes speed and 
minimizes coupling thus allowing you to create fast and easily maintainable code.
To activate event listening in Loggerize, the `emitEvents` option must be 
explicitly set to `true` in the logger and/or handle config. Loggerize provides 
notice of three events: 'filtered', 'logged', and 'error'.

### Event Notification - Filtered

The 'filtered' event is emitted whenever a log is filtered. The below example 
emits the 'filtered' event when the logger attached filter, blocks the second 
log attempt. The event is listened to via the logger's `on` function.

```javascript
// @filename event-filtered.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	emitEvents: true, //tell logger to emit events
	handle: {
		name: "myHandle",
		target: "console",
	}
});

logger.attachFilter("regex", {"pattern": /.+filter me.+/i, "onMatch": "deny"});
logger.on("filtered", function(logRecord){
	console.log("Logger Filtered logRecord: \n", logRecord);
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger.info("Please filter Me. I don't want to be logged.");	//No Output
```

### Event Notification - Logged

The 'logged' event is emitted whenever a log is successfully completed. The 
below example emits the 'logged' event when the logger successfully writes the 
log output to the designated target. The event is listened to via the logger's 
`on` function.

Notice, in order to listen to the 'logged' on a logger the emitEvents option must 
also be set to `true` in the handle's config because the logged event is 
actually emitted by the handle and bubbled up to the logger.

```javascript
// @filename event-logged.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	emitEvents: true, //tell logger to emit events
	handle: {
		emitEvents: true, //tell handle to emit events
		name: "myHandle",
		target: "console",
	}
});


logger.on("logged", function(logRecord){
	console.log("logged logRecord: \n", logRecord);
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
```

### Event Notification - Error

The 'error' event is emitted whenever a log fails to be completed. The 
below example emits the 'error' event when the logger fails to write the 
log output to the designated target. The event is listened to via the logger's 
`on` function.

Notice, in order to listen to the 'logged' on a logger the emitEvents option must 
also be set to `true` in the handle's config because the logged event is 
actually emitted by the handle and bubbled up to the logger.

```javascript
// @filename event-error.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	emitEvents: true, //tell handle to emit events
	handle: {
		emitEvents: true, //tell handle to emit events
		name: "myHandle",
		target: "rotatingFile",
		maxFiles: Number.NEGATIVE_INFINITY,
	}
});

logger.on("error", function(err, logRecord){
	console.log(err);
	//Outputs => Error: Max File Limit Reached. Increase 'maxFiles' option to continue logging.
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
```

The above example causes the Rotating File Target to throw an error by setting 
the maximum number of files to an infinitly low level (NEGATIVE_INFINITY).

It is **highly recommended** that you always listen for error events.

### Global Listener

In addition to listening to events on the logger, Loggerize maintains a 
module-level central event listener that listens to events from all loggers 
and all handles.

```javascript
// @filename event-global.js
var Loggerize = require("loggerize");

Loggerize.on("logged", function(logRecord){
	console.log("logged logRecord: \n", logRecord);
});
Loggerize.on("filtered", function(logRecord){
	console.log("Filtered logRecord: \n", logRecord);
});

let logger1 = Loggerize.createLogger("myLogger1");
let logger2 = Loggerize.createLogger({
	name: "myLogger2",
	emitEvents: true,
	handle: {
		name: "myHandle",
		target: "console",
	}
});

logger2.attachFilter("regex", {"pattern": /.+filter me.+/i, "onMatch": "deny"});

logger1.info("Log Message Test!");	//Output => 'info Log Message Test!'
logger2.info("Please filter Me. I don't want to be logged.");	//No Output
```

The above example created a logger, "logger1", which used the default handle which 
emits the 'logged' event by default. A second logger was also created, "logger2", 
which created a filter on the logger level that emitted the 'filtered' event. 
Both of these independent loggers with independent handles emitted events which 
were all caught by the `on` module-level event listener.







