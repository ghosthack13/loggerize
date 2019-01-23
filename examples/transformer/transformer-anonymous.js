var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: {
			"name": "myFormatter",
			"level": {
				"transformer": function(input){
					return input.substring(0, 2); 
				}
			},
			"format": "%{level} %{message}",
		}
	},
});

logger.info("Log Message Test!");	//Output => 'in Log Message Test!'
