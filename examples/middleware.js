var url = require("url");
var http = require('http');
var https = require('https');
var querystring= require('querystring');

//!Load express middleware
var express = require('express');
var app = express();

//!Support json/url encoded bodies
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var Loggerize = require('../lib/index.js');

var loggerizeMW = Loggerize.createHTTPLogger({
	"isMiddleware": true,
	"name": "middleware",
	"target": "console",
	"level": "information",
	"levelMapper": "http",
	"formatter": "combined",
});

// app.use(loggerizeMW.httpListener);
app.use(Loggerize.mw());

app.get("*", function(req, res, next){
	var urlParts = url.parse(req.url);
	var pathname = urlParts.pathname;
	if (urlParts.search){
		res.send("Received GET Request with query params: " + decodeURIComponent(urlParts.search.replace("?", "")));
	}
	else{
		res.send("Received GET Request on path: " + pathname);
	}
	
});

app.post("*", function(req, res, next){
	var query = querystring.parse(body);
	res.end("Received POST Request with payload: " + JSON.stringify(query));
});

const NODE_HTTP_PORT = 3000;
var httpServer = http.createServer(app);
httpServer.listen(NODE_HTTP_PORT, function(){
	console.log('HTTP Server listening on port ' + NODE_HTTP_PORT);
});