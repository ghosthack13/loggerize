try{
	var express = require('express');
}
catch(err){
	console.log("The example in logger-express-1.js requires the express module.\nInstall express using: npm i express");
}

const app = express();
const PORT = 3000;

var loggerize = require("../../lib/index.js");
app.use(loggerize.mw());

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(PORT, () => console.log("Example app listening on port " + PORT + "!"));