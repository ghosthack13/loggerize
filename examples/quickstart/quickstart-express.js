var app = require('express')();
var loggerize = require("../../lib/index.js");

// Call middleware logger directly from the library
app.use(loggerize.mw());

app.get('/', function(req, res){
	res.send('Hello World!')
});

//Start listening on port 3000
app.listen(3000, function(){
	console.log("App listening on port 3000!")
});