var http = require('http');

var Loggerize = require('../../lib/index.js');

var myHTTPLogger = Loggerize.createHTTPLogger({
	"name": "myHTTPLogger",
	"level": "information",
	"handle": {
		"name": "myHTTPHandle",
		"target": "console",
		"formatter": "common",
		"levelMapper": "http",
	}
});

const PORT = 3000;
var server = http.createServer(function (req, res){
	
	myHTTPLogger.httpListener(req, res); // request/response logger
	
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(PORT);

// Console will print the message
console.log("Server listening on port " + PORT + "!");


