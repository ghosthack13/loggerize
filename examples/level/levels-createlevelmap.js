var Loggerize = require("../../lib/index.js");

//level config object
let levelMap = {
	"MadMax": 0,	// Max Max world comes true
	"zombie": 1,	// Zombie Apocalypse
	"robot": 2,		// Robot Apocalypse
	"alien": 3,		// Alien Apocalypse
	"goblin": 4,	// Goblin Apocalypse
};

//Define level Mapper called 'apocalypse' based on level config
Loggerize.createLevelMap("apocalypse", levelMap, "desc");
Loggerize.setLevelMapper("apocalypse");

let logger = Loggerize.createLogger({
	"name": "myLogger",
	"handle": {
		"name": "myHandle",
		"levelMapper": "apocalypse",
	},
});

logger.log("zombie", "The Apocalypse has begun!");