var Loggerize = require("../../lib/index.js");

/*
let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle",
		level: "info",
	},
});

logger.info("Log Test!");	//Output => 'info Log Test!'
/**/

/*
let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false,
});

//Attach the added handle called 'myHandle'
logger.attachHandles({
	name: "myHandle",
	level: "info",
});

logger.info("Log Test!");	//Output => 'info Log Test!'
/**/

/*

Loggerize.addHandle({
	"name": "myHandle",
	"level": "info",
});

let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false	//Set to false to not add default handle
});

logger.attachHandles("myHandle");	//Attach the handle called 'myHandle'
logger.info("Log Test!");	//Output => 'info Log Test!'

/**/

let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false,
});

logger.attachHandles("default");	//Attach the handle called 'default'
logger.info("Log Test!");	//Output => 'info Log Test!'