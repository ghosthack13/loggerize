var Loggerize = require("../../lib/index.js");

//level config object
let levelMap = {
	"defcon1":	1,
	"defcon2": 	2,
	"defcon3":	3,
	"defcon4":	4,
	"defcon5":	5,
};

//Define level Mapper called 'apocalypse' based on level config
Loggerize.createLevelMap("US_Defcon", levelMap, "desc");
Loggerize.setLevelMapper("US_Defcon");

let logger = Loggerize.createLogger({
	"name": "myLogger",
	"handle": {
		"name": "myHandle",
		"levelMapper": "US_Defcon",
	},
});

logger.log("defcon1", "Going Nuclear!");