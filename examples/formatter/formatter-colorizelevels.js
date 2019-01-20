var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		formatter: {
			name: "myFormatter",
			// style: "bgcyan",
			// level: { style: "blue" },
			uuid: { style: "red" },
			format: "%{timestamp} %{level} %{message}"
		}
	},
});

var colorMap = {
	"error": 	"redBright", 
	"warn": 	"yellowBright", 
	"info": 	"purpleBright", 
	"verbose": 	"blueBright", 
	"debug": 	"greenBright",
};
Loggerize.colorizeLevels(colorMap);

logger.log("error", "Color Coded Log Message"); //Output => 'info Log Message Test!'
logger.log("warn", 	"Color Coded Log Message");
logger.log("info", 	"Color Coded Log Message");
logger.log("verbose", "Color Coded Log Message");
logger.log("debug", "Color Coded Log Message");