var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false,
});

//Add the uncaught exception handle
Loggerize.addExceptionHandle({
	name: "_exception",
	target: 'console',
	formatter: 'exceptFmt',
	level: 'debug',
	emitEvents: true,
	levelMapper: 'npm',
});

// Run some server code
throw Error();
// Run some more server code