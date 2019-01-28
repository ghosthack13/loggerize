const express = require('express');
const app = express();
const PORT = 3000;

var loggerize = require("../../lib/index.js");

var httpLogger = loggerize.createHTTPLogger({name: "myHTTPLogger"});
app.use(httpLogger.getMiddleware());

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(PORT, () => console.log("Example app listening on port " + PORT + "!"))