var Loggerize = require("../../lib/index.js");

var myTarget = function(logRecord, handleOpts){
	try{
		let output = logRecord["output"] + "\n";
		process.stdout.write(output);
		
		//emit success events 
		handleOpts["_emitter"].emit("logged", logRecord);
	}
	catch(err){
		//emit error events
		handleOpts["_emitter"].emit("error", err, logRecord);
	}
};

let logger = Loggerize.createLogger({
	name: "myLogger",
	emitEvents: true,
	handle: {
		"name": "myHandle",
		"target": myTarget,
		"emitEvents": true
	}
});

logger.on("logged", function(logRecord){
	console.log("logged logRecord: \n", logRecord);
});

logger.on("error", function(err, logRecord){
	console.log("Error: ", err.message);
});

logger.info("Log Message Test!");	//Output => ''