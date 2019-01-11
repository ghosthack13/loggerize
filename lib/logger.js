
var util = require('util');
var path = require('path');
var EventEmitter = require('events').EventEmitter;

function Logger(options){
	
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
	
	
	/*/Handle Uncaught Exceptions
	process.on('uncaughtException', function(err){
		console.log(self.handles);
		if (self.handles["__exception__"]["handleUncaught"] == true){
			let logRecord = {
				"DateObj": new Date(),
				"level": "error",
				"levelNum": 0,
				"message": err["message"],
				"stack": err["stack"].replace(/.+/i, ""),
			};
			self.log(logRecord, self.handles["__exception__"]);
		}
		else{
			throw err;
		}
		
		if (self.handles["__exception__"]["exitOnUncaught"] == true){
			// console.log("Exiting on uncaught");
			process.exit(1);
		}
		// console.log("Not exiting on uncaught");
	});
	/**/
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