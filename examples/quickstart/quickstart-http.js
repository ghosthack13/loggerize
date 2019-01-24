var http = require('http');
var url = require("url");
var path = require("path");
var querystring = require('querystring');

var Loggerize = require("../../lib/index.js");

let httpLogger = Loggerize.createHTTPLogger({
	name: "myHTTPLogger",
	// level: "clientError",
	logOnRequest: false,
	logOnResponse: false,
});

var PORT = 3000;
var HOST = "http://127.0.0.1";
var server = http.createServer(function (req, res){
	
	var urlParts = url.parse(req.url);
	var pathname = urlParts.pathname;
	
	if (req.method === 'POST') {
		let body = "";
		
		req.on('data', function(chunk){
			body += chunk.toString();
		});
		
		req.on('end', () => {
			var query = querystring.parse(body);
			res.end("Received POST Request with payload: " + JSON.stringify(query));
		});
	}
	else{
		
		httpLogger.httpListener(req, res);
		
		//Return 404
		if (pathname == "/404"){
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end("404 - Page Not Found\n");
			return;
		}
		
		if (urlParts.search){
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end("Received GET Request with query: " + decodeURIComponent(urlParts.search.replace("?", "")) + "\n");
		}
		else{
			// Send the HTTP header - HTTP Status: 200 : OK, Content Type: text/plain
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end("Received @" + new Date() + "\n");
		}
	}
	
	//Gracefully shutdown server
	// server.close(function(){ console.log('Http server closed.'); });
	
}).listen(PORT);

// Console will print the message
console.log("Server running at " + HOST + ":" + PORT + "/");



/*
var http = require('http');

var Loggerize = require("../../lib/index.js");

let httpLogger = Loggerize.createHTTPLogger({
	name: "myHTTPLogger",
	level: "clientError"
});

var PORT = 3000;
var server = http.createServer(function (req, res){
	
	// Loggerize.reqListener(req, res);
	httpLogger.httpListener(req, res);
	
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end("Received @" + new Date() + "\n");
	
}).listen(PORT);

// Console will print the message
console.log("Server running on localhost port: " + PORT);


*/