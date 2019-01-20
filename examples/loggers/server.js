var http = require('http');
// var https = require('https');

var url = require("url");
var querystring= require('querystring');

var tool = require("../lib/tools.js");

function createMockServer(PORT){
	
	PORT = PORT || 3000;
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
		else if (req.method === 'GET'){
			// Send the HTTP header - HTTP Status: 200 : OK, Content Type: text/plain
			res.writeHead(200, {'Content-Type': 'text/plain'});
			if (pathname == "/"){
				res.end("Received GET Request with query: " + decodeURIComponent(urlParts.search.replace("?", "")));
			}
		}
		
		//Gracefully shutdown server
		// server.close(function(){ 
			// console.log('Http server closed.'); 
		// });
		
	}).listen(PORT);

	// Console will print the message
	console.log("Server running at http://127.0.0.1:" + PORT + "/");
}

createMockServer();