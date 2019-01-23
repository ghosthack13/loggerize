"use strict";

var Loggerize = require("loggersize");

let logger = Loggerize.createLogger("myLogger");
logger.log("info", "Logger Test!"); // Outputs => 'info Logger Test!'