var Loggerize = require("../../lib/index.js");

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