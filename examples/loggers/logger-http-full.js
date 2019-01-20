var url = require("url");
var http = require('http');
var https = require('https');
var querystring= require('querystring');

var Loggerize = require('../../lib/index.js');

// var myReqListener = Loggerize.createHTTPLogger("myReqListenerBoy");
var myReqListener = Loggerize.createHTTPLogger({
	"name": "reqListener",
	"target": "console",
	"level": "information",
	"levelMapper": "http",
	"formatter": "combined",
});

PORT = 3000;
var server = http.createServer(function (req, res){
		
		// myReqListener.requestListener(req, res); //After creating own logger
		Loggerize.reqListener(req, res);
		
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
			
			var urlParts = url.parse(req.url);
			var pathname = urlParts.pathname;
			
			// Send the HTTP header - HTTP Status: 200 : OK, Content Type: text/plain
			res.writeHead(200, {'Content-Type': 'text/plain'});
			if (urlParts.search){
				res.end("Received GET Request with query params: " + decodeURIComponent(urlParts.search.replace("?", "")));
			}
			else{
				res.end("Received GET Request on path: " + pathname);
			}
			// server.close(function(){ console.log('Http server closed.'); });
		}
		
		//Gracefully shutdown server
		// server.close(function(){ 
			// console.log('Http server closed.'); 
		// });
		
	}).listen(PORT);

// Console will print the message
console.log("Server running at http://127.0.0.1:" + PORT + "/");


