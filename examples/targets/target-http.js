var http = require('http');

//Create server
const PORT = 3000;
var server = http.createServer(function (req, res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Success!\n');
}).listen(PORT);
console.log("Server listening on port " + PORT);

let serverTimeout = setTimeout(function(){
	if (typeof(server) != "undefined"){
		server.close();
	}
}, 5000);


var Loggerize = require("../../lib/index.js");

Loggerize.on("logged", function(logRecord){
	let response = logRecord["response"];
	console.log("Server Response:", response);
	server.close();
	clearTimeout(serverTimeout);
});

let logger = Loggerize.createLogger({
	"name": "myLogger",
	"handle": {
		name: "myHandle",
		target: "http",		//Set target to http
		url: "http://localhost/logreceiver", //Set url that will receive the logRecord
		port: 3000,		//port defaults to 443 for HTTPS requests and defaults to 80 for HTTP requests
		method: 'POST',	//HTTP method defaults to POST
		allowInsecure: true,
		emitEvents: true,
	}
});

logger.info("Log Message Test!");

