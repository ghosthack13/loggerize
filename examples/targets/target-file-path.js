var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		path: './logs/filelogtest.log',
		// target: "file",			//target is set to 'file' by default if path is set w/o rotation options
		// directory: './logs/',	//directory is deduced based on the path that is set
		// fileName: 'filelogtest',	//fileName is deduced based on the path that is set
		// fileExtension: '.log'	//fileExtension is deduced based on the the fileName that is based on the path that is set
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'