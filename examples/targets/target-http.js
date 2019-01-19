var Loggerize = require("../lib/index.js");

Loggerize.on("logged", function(logRecord){
	console.log(logRecord["response"]);
});

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"hasHandles": false //set to false to avoid automatically adding the default handle
});

logger.attachHandles({
	name: "myHandle",
	target: "http",		//Set target to http
	url: "https://localhost/logreceiver", //Set url that will receive the logRecord
	// method: 'GET',	//HTTP method defaults to GET
    // port: 443,		//port defaults to 443 for HTTPS requests and defaults to 80 for HTTP requests
	// headers: {'User-Agent': 'Remote Logger'} //headers default to contain the Loggerize's user agent
});

logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'