const express = require('express');
const app = express();
const PORT = 3000;

var loggerize = require("../../lib/index.js");
app.use(loggerize.mw());

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(PORT, () => console.log("Example app listening on port " + PORT + "!"));