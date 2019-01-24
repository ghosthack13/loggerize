var http = require('http');
var express = require('express')
var app = express()

var Loggerize = require("../../lib/index.js");

app.use(Loggerize.mw());

app.get('/', function (req, res) {
	res.send('hello, world!')
});

const PORT = 3000;
var httpServer = http.createServer(app);
httpServer.listen(PORT, function(){
	console.log('HTTP Server listening on port ' + PORT);
});
