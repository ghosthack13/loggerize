var http = require('http');
var url = require("url");
var path = require("path");

var querystring = require('querystring');

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
			console.log("Received POST Request");
			res.end("Received POST Request with payload: " + JSON.stringify(query));
		});
	}
	else{
		// Send the HTTP header - HTTP Status: 200 : OK, Content Type: text/plain
		res.writeHead(200, {'Content-Type': 'text/plain'});
		console.log("Received @" + new Date());
		res.end("Received GET Request @" + new Date());
	}
	
	//Gracefully shutdown server
	// server.close(function(){ console.log('Http server closed.'); });
	
}).listen(PORT);

// Console will print the message
console.log("Server running at http://127.0.0.1:" + PORT + "/");