var app = require('express')();
var loggerize = require("../../lib/index.js");

//Create HTTP Logger
var httpLogger = loggerize.createHTTPLogger("myHTTPLogger");

// Extract get middleware to use in express
app.use(httpLogger.getMiddleware());

app.get('/', (req, res) => res.send('Hello World!'))

//Start listening on port 3000
app.listen(3000, () => console.log("App listening on port 3000!"))