var Loggerize = require("../../lib/index.js");

Loggerize.on("logged", function(logRecord){
	console.log(logRecord["response"]);
});

let logger = Loggerize.createLogger({
	"name": "myLogger",
	"handle": {
		name: "myHandle",
		target: "http",		//Set target to http
		url: "http://localhost/logreceiver", //Set url that will receive the logRecord
		port: 3000,		//port defaults to 443 for HTTPS requests and defaults to 80 for HTTP requests
		// method: 'POST',	//HTTP method defaults to POST
		allowInsecure: true,
		emitEvents: true,
	}
});

logger.info("Log Message Test!");