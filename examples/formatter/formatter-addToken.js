var Loggerize = require("../lib/index.js");

Loggerize.addTokens({
	"label": "TestLabel:"
});

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle", 
		formatter: {
			name: "myFormatter",
			format: "%{label} %{level} %{message}",
		},
	}
});


logger.info("Log Message Test!");	//Output => 'TestLabel: info Log Message Test!'