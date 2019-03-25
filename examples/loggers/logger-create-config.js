var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	"name": "myLogger",			//Defined by user
	"level": 'debug',			//Defined by default if not set
	"handles": [ 'default' ],	//Defined by default if not set
	"hasHandles": true,			//Defined by default if not set
	"filters": [],				//Defined by default if not set
	"isMuted": false,			//Defined by default if not set
	"levelMapper": 'npm',		//Defined by default if not set
	"propogate": true,			//Defined by default if not set
});