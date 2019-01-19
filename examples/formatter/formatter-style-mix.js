var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle",
		formatter: {
			name: "myFormatter",
			
			style: "bgblue yellowBright",
			transformer: "uppercase",
			
			message: {
				transformer: function (input){return input.slice(0, 8);},
			},
			timestamp: {style: "gray"},
			level: {style: "redBright"},
			format: "%{timestamp} %{level} %{message}",
		},
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'