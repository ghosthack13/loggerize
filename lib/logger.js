
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
	this.formatters = {
		"simple": {"format": "%{timestamp} %{level} %{message}"},
		"common": { //Common Log Format. See https://httpd.apache.org/docs/1.3/logs.html
			"defaultSubstitution": "-",
			"timestamp": {"pattern": "%d/%b/%Y:%H:%M:%S %z"},
			"format": '%{remoteIPv4} %{RFC1413identity} %{user} [%{timestamp}] "%{method} %{url} %{protocol}/%{version}" %{statusCode} %{req.contentLength}'
		},
		"combined": { //Combined Log Format. See https://httpd.apache.org/docs/1.3/logs.html
			"defaultSubstitution": "-",
			"timestamp": {"pattern": "%d/%b/%Y:%H:%M:%S %z"},
			"format": '%{remoteIPv4} %{RFC1413identity} %{user} [%{timestamp}] "%{method} %{url} %{protocol}/%{version}" %{statusCode} %{res.contentLength} %{referer} %{userAgent}'
		}
	};		
	Object.defineProperty(this.formatters, "_level", {
		value: {},
		writable: true, 
		enumerable: true, 
		configurable: false, 
	});
	Object.defineProperty(this.formatters, "default", {
		value: {},
		writable: false, 
		enumerable: true, 
		configurable: false, 
	});
	Object.defineProperty(this.formatters["default"], "format", {
		writable: false, 
		enumerable: true, 
		configurable: false, 
		value: "%{level} %{message}"
	});
	Object.preventExtensions(this.formatters["default"]);
	
	//Set Handles
	this.handles = Object.create(Object.prototype, {
		"default": {
			writable: false, 
			enumerable: true, 
			configurable: false, 
			value: {}
		},
		"anonymous": {
			writable: true, 
			enumerable: true, 
			configurable: false, 
			value: {},
		},
		"mw": {
			writable: true,
			enumerable: false,
			configurable: false,
			value: {"active": true, "level": "debug", "target": "console", "formatter": "combined"}
		},
		"__exception__": {
			writable: true,
			enumerable: true,
			configurable: false,
			value: {}
		},
	});
	Object.defineProperties(this.handles["default"], {
		'active': 	{enumerable: true, writable: true, configurable: false, value: true},
		'level': 	{enumerable: true, writable: false, configurable: false, value: "debug"},
		'target': 	{enumerable: true, writable: false, configurable: false, value: "console"},
		'formatter': {enumerable: true, writable: false, configurable: false, value: "default"},
		'raiseErrors': {enumerable: true, writable: false, configurable: false, value: true},
		'handleUncaught': {enumerable: true, writable: false, configurable: false, value: false},
		'exitOnUncaught': {enumerable: true, writable: false, configurable: false, value: true},
		'levelMapper': {enumerable: true, writable: false, configurable: false, value: "npm"},
		'_emitter': {enumerable: true, writable: false, configurable: false, value: new EventEmitter()}
	});
	Object.defineProperties(this.handles["anonymous"], {
		'active': 	{enumerable: true, writable: true, configurable: false, value: true},
		'level': 	{enumerable: true, writable: false, configurable: false, value: "debug"},
		'target': 	{enumerable: true, writable: false, configurable: false, value: "console"},
		'formatter': {enumerable: true, writable: false, configurable: false, value: "default"},
		'raiseErrors': {enumerable: true, writable: false, configurable: false, value: true},
		'handleUncaught': {enumerable: true, writable: false, configurable: false, value: false},
		'exitOnUncaught': {enumerable: true, writable: false, configurable: false, value: true},
		'levelMapper': {enumerable: true, writable: false, configurable: false, value: "npm"},
		'_emitter': {enumerable: true, writable: false, configurable: false, value: new EventEmitter()}
	});
	Object.defineProperties(this.handles["__exception__"], {
		'active': 	{enumerable: true, writable: true, configurable: false, value: true},
		'level': 	{enumerable: true, writable: false, configurable: false, value: "error"},
		'target': 	{enumerable: true, writable: false, configurable: false, value: "console"},
		'formatter': {enumerable: true, writable: false, configurable: false, value: "default"},
		'raiseErrors': {enumerable: true, writable: false, configurable: false, value: true},
		'handleUncaught': {enumerable: true, writable: false, configurable: false, value: false},
		'exitOnUncaught': {enumerable: true, writable: false, configurable: false, value: true},
		'levelMapper': {enumerable: true, writable: false, configurable: false, value: "npm"},
		'_emitter': {enumerable: true, writable: false, configurable: false, value: new EventEmitter()}
	});
	
	
	//Bubble events up to central control
	this.handles["default"]["_emitter"].on("logged", function(logRecord){
		self.emit("logged", logRecord);
	});
	this.handles["default"]["_emitter"].on('error', function(err, logRecord){
		self.emit("error", err, logRecord);
	});
	
	//Bubble file handle events
	if (this.handles["default"]["target"] == "file" || this.handles["default"]["target"] == "rotatingFile"){
		this.handles["default"]["_emitter"].on('drain', function(err, logRecord){
			self.emit("drain", logRecord);
		});
		this.handles["default"]["_emitter"].on('finish', function(err, logRecord){
			self.emit("finish", logRecord);
		});
		this.handles["default"]["_emitter"].on('close', function(err, logRecord){
			self.emit("close", logRecord);
		});
	}
	
	
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