"use strict";

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Logger(){
	
	//Reference for callback functions
	let self = this;
	
	//Level Defaults
	this.levelMapper = "npm";
	this.level = "debug";
	this.loadLevels();
	
	//Load Filters
	this.filters = {};
	this.loadFilters();
	
	//Load Targets
	this.targets = {};
	this.loadTargets();
	
	//Load Transformers
	this.transformers = {};
	this.loadTransformers();
	
	//Store custom tokens
	this.customTokens = {};
	
	//Keep track of loggers
	this.loggers = {};
	
	//Set Formatters
	this.formatters = {};
	this.loadFormatters();
	
	//Set Handles
	this.handles = {};
	this.loadHandles();
	
	//Handle Uncaught Exceptions
	this.handleUncaughtExceptions = false; //Do not handle uncaught exceptions unless specifically told
	process.on('uncaughtException', function(err){
		if (self.handleUncaughtExceptions){
			let logRecord = self.makeRecord(["_exception"], self.handles["_exception"]["levelMapper"], err);
			self.render(logRecord, self.handles["_exception"]);
			self.handles["_exception"].on("logged", function(logRecord){ //eslint-disable-line no-unused-vars
				process.exit(1);
			});
		}
		else{
			throw err;
		}
	});
	
}

//Import functions and add them to Logger
Object.assign(Logger.prototype, require("./render.js"));
Object.assign(Logger.prototype, require("./levels.js"));
Object.assign(Logger.prototype, require("./options.js"));
Object.assign(Logger.prototype, require("./handle.js"));
Object.assign(Logger.prototype, require("./filter.js"));
Object.assign(Logger.prototype, require("./formatter.js"));
Object.assign(Logger.prototype, require("./transformer.js"));
Object.assign(Logger.prototype, require("./targets.js"));

//Extend events into Logger
util.inherits(Logger, EventEmitter);



module.exports = new Logger();