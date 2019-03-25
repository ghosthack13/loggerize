var Loggerize = require("../../lib/index.js");

Loggerize.addTransformer("truncateAfterTen", function(input){ 
	return input.substring(0, 10); 
});

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: {
			"name": "myFormatter",
			"transformer": "truncateAfterTen",
			"format": "%{level} %{message}",
		}
	},
});

logger.info("Log Message Test!");	//Output => 'info Log M'