var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false,
});

//Add the uncaught exception handle
Loggerize.addExceptionHandle();

// Run some server code
throw Error();
// Run some more server code