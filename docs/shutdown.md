
## Shutdown

Loggerize allows you to cleanup allocated resources when logging is completed. 
To deallocated resources simply call the module-level function shutdown. 
When shutdown is called, it will emit a 'finish' event to loggerize's module-level 
central event listener if `emitEvents` is enabled on the handles. 
See the example below.

```javascript
// @filename event-finish.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle",
		path: "./examples/event/test.log",
		formatter: "simple",
		emitEvents: true,
	}
});

Loggerize.on("finish", function(){
	console.log('All writes are now complete!');
});

logger.info("Log Message Test 1!");	
logger.info("Log Message Test 2!");

//Close all handles/streams and emit the 'finish' event
Loggerize.shutdown();
```