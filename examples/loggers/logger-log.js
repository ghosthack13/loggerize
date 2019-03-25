"use strict";

var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger("myLogger");
logger.log("info", "Logger Test!"); // Outputs => 'info Logger Test!'