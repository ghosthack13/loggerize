var http = require('http');

var loggerize = require('../../lib/index.js');

const PORT = 3000;
var server = http.createServer(function (req, res){
	
	loggerize.requestListener(req, res); // request/response logger
	
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(PORT);

// Console will print the message
console.log("Server listening on port " + PORT + "!");


