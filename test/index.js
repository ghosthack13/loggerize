var assert = require('assert');

//Style 
//<method>_Should<expected>_When<condition> | E.g. Deposit_ShouldIncreaseBalance_WhenGivenPositiveValue

describe('Library (index.js)', function(){
	
	describe('#createLogger()', function() {
		
		//Because Loggerize proxies request to a singleton that maintaines state,
		//it is require to purge cache on each test to ensure settings brought forward
		//from previous test
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			Loggerize = require('../lib/index.js');
			subject = require('../lib/logger.js'); //Singleton Logger Instance
		});
		
		
		it('should create a logger with defaults when passed parameter of type \'string\'', function(){
			
			let logger = Loggerize.createLogger("myLogger");
			
			let actual = logger;
			let expected = {
				"name": 'myLogger',
				"levelMapper": 'npm',
				"propogate": true,
				"isMuted": false,
				"handles": [ 'default' ],
				"hasHandles": true,
				"filters": [],
				"level": 'debug'
			}
			
			assert.deepEqual(actual, expected);
		});
		
		it('should create a logger with attached handle when passed object with handle definition', function(){
			
			let opts = {
				"name": "myLogger",
				"handle": {
					"name": "myHandle",
					"target": "console"
				}
			};
			let logger = Loggerize.createLogger(opts);
			
			let actual = logger;
			let expected = {
				"name": 'myLogger',
				"levelMapper": 'npm',
				"propogate": true,
				"isMuted": false,
				"handles": [ 'myHandle' ],
				"hasHandles": true,
				"filters": [],
				"level": 'debug'
			}
			
			assert.deepEqual(actual, expected);
		});
		
		it('should create logger with properties defined in opts when passed object as parameter', function(){
			
			let opts = {
				"name": "myLogger",
				"levelMapper": 'python',
				"propogate" : false,
				"level": "error",
			};
			let logger = Loggerize.createLogger(opts);
			
			let actual = logger;
			let expected = {
				"name": 'myLogger',
				"levelMapper": 'python',
				"propogate": true,
				"isMuted": false,
				"handles": [ 'default' ],
				"hasHandles": true,
				"filters": [],
				"level": 'error'
			}
			
			assert.deepEqual(actual, expected);
		});
		
	});
	
	describe('#getLogger()', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			Loggerize = require('../lib/index.js');
			subject = require('../lib/logger.js'); //Singleton Logger Instance
		});
		
		it('should create a logger w/o any level, levelMapper or handles attached when passed name of an undefined logger', function(){
			
			let logger = Loggerize.getLogger("myLogger");
			
			let actual = subject.loggers;
			let expected = {
				root: {
					name: 'root',
					propogate: true,
					isMuted: false,
					handles: [],
					hasHandles: false,
					filters: [],
					levelMapper: 'npm'
				},
				_anonymous: {
					name: '_anonymous',
					propogate: false,
					isMuted: false,
					handles: [ 'default' ],
					hasHandles: true,
					filters: [],
					levelMapper: 'npm',
					level: 'debug'
				},
				myLogger: {
					name: 'myLogger',
					propogate: true,
					isMuted: false,
					handles: [],
					hasHandles: false,
					filters: []
				} 
			};
			
			assert.deepEqual(actual, expected);
		});
		
		it('should retrieve the already defined logger when passed name of an existing logger', function(){
			
			let logger = Loggerize.getLogger("_anonymous");
			
			let actual = logger;
			let expected = {
				name: '_anonymous',
				propogate: false,
				isMuted: false,
				handles: [ 'default' ],
				hasHandles: true,
				filters: [],
				levelMapper: 'npm',
				level: 'debug'
			}
			
			assert.deepEqual(actual, expected);
		});
		
		
	});
	
	describe('#getRootLogger()', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			Loggerize = require('../lib/index.js');
			subject = require('../lib/logger.js'); //Singleton Logger Instance
		});
		
		it('should retrieve the root logger', function(){
			
			let logger = Loggerize.getLogger("root");
			
			let actual = logger;
			let expected = {
				name: 'root',
				propogate: true,
				isMuted: false,
				handles: [],
				hasHandles: false,
				filters: [],
				levelMapper: 'npm'
			};
			
			assert.deepEqual(actual, expected);
		});
		
		
	});
	
	
	describe('#createMiddleware()', function() {
		
		//Because Loggerize proxies request to a singleton that maintaines state,
		//it is require to purge cache on each test to ensure settings brought forward
		//from previous test
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			Loggerize = require('../lib/index.js');
			subject = require('../lib/logger.js'); //Singleton Logger Instance
		});
		
		it('should create a middleware logger named after string parameter', function(){
			
			let logger = Loggerize.createMiddleware("myMiddleware");
			delete logger.getMiddleware; //Function to complicated and dynamic to assert
			
			let actual = logger;
			let expected = {
				name: 'myMiddleware',
				propogate: false,
				isMuted: false,
				handles: [ 'middleware' ],
				hasHandles: true,
				filters: [],
				logOnRequest: false,
				logOnResponse: true,
				levelMapper: 'http',
				level: 'information',
				// getMiddleware: Function
			};
			
			assert.deepEqual(actual, expected);
		});
		
		it('should create a middleware logger with attached handle when passed object with handle definition', function(){
			
			let opts = {
				"name": "myMiddleware",
				"logOnRequest": true,
				"handle": {
					"name": "myMiddlewareHandle",
					"target": "console"
				}
			};
			let logger = Loggerize.createMiddleware(opts);
			delete logger.getMiddleware; //Function to complicated and dynamic to assert
			
			let actual = logger;
			let expected = {
				name: 'myMiddleware',
				propogate: false,
				isMuted: false,
				handles: [ 'myMiddlewareHandle' ],
				hasHandles: true,
				filters: [],
				logOnRequest: true,
				logOnResponse: true,
				levelMapper: 'http',
				level: 'information',
			}
			
			assert.deepEqual(actual, expected);
		});
		
		it('should create middleware logger with properties defined in opts when passed object as parameter', function(){
			
			let opts = {
				"name": "myMiddleware",
				"levelMapper": 'python'
			};
			let logger = Loggerize.createMiddleware(opts);
			delete logger.getMiddleware; //Function to complicated and dynamic to assert
			
			let actual = logger;
			let expected = {
				name: 'myMiddleware',
				propogate: false,
				isMuted: false,
				handles: [ 'middleware' ],
				hasHandles: true,
				filters: [],
				logOnRequest: false,
				logOnResponse: true,
				levelMapper: 'python',
				level: 'debug',
			}
			
			assert.deepEqual(actual, expected);
		});
		
	});
	
	describe('#mw()', function() {
		
		//Because Loggerize proxies request to a singleton that maintaines state,
		//it is require to purge cache on each test to ensure settings brought forward
		//from previous test
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			Loggerize = require('../lib/index.js');
			subject = require('../lib/logger.js'); //Singleton Logger Instance
		});
		
		it('should create and return middleware function', function(){
			let middlewareFunc = Loggerize.mw("myMiddleware");
			let actual = typeof(middlewareFunc);
			let expected = "function";
			assert.equal(actual, expected);
		});
	});
	
	describe('#createRequestListener()', function() {
		
		//Because Loggerize proxies request to a singleton that maintaines state,
		//it is require to purge cache on each test to ensure settings brought forward
		//from previous test
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			Loggerize = require('../lib/index.js');
			subject = require('../lib/logger.js'); //Singleton Logger Instance
		});
		
		it('should create a request/response logger named after string parameter', function(){
			
			let logger = Loggerize.createRequestListener("myRequestListener");
			delete logger.requestListener; //Function to complicated and dynamic to assert
			
			let actual = logger;
			let expected = {
				name: 'myRequestListener',
				propogate: false,
				isMuted: false,
				handles: ['reqListen'],
				hasHandles: true,
				filters: [],
				logOnRequest: false,
				logOnResponse: true,
				levelMapper: 'http',
				level: 'information',
				// requestListener: Function
			};
			
			assert.deepEqual(actual, expected);
		});
		
		it('should create a request/response logger with attached handle when passed object with handle definition', function(){
			
			let opts = {
				"name": "myRequestListener",
				"logOnRequest": true,
				"handle": {
					"name": "myRequestHandle",
					"target": "console"
				}
			};
			let logger = Loggerize.createRequestListener(opts);
			delete logger.requestListener; //Function to complicated and dynamic to assert
			
			let actual = logger;
			let expected = {
				name: 'myRequestListener',
				propogate: false,
				isMuted: false,
				handles: [ 'myRequestHandle' ],
				hasHandles: true,
				filters: [],
				logOnRequest: true,
				logOnResponse: true,
				levelMapper: 'http',
				level: 'information',
			}
			
			assert.deepEqual(actual, expected);
		});
		
		it('should create request/response logger with properties defined in opts when passed object as parameter', function(){
			
			let opts = {
				"name": "myRequestListener",
				"levelMapper": 'python'
			};
			let logger = Loggerize.createRequestListener(opts);
			delete logger.requestListener; //Function to complicated and dynamic to assert
			
			let actual = logger;
			let expected = {
				name: 'myRequestListener',
				propogate: false,
				isMuted: false,
				handles: [ 'reqListen' ],
				hasHandles: true,
				filters: [],
				logOnRequest: false,
				logOnResponse: true,
				levelMapper: 'python',
				level: 'debug',
			}
			
			assert.deepEqual(actual, expected);
		});
		
	});
	
	
	describe('Manage Levels: #getLevel(), #setLevel(), #setLevelMap()', function() {
			
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#should get the level as set on the master logger", function(){
			
			actual = subject.level;
			expected = Loggerize.getLevel();
			assert.strictEqual(actual, expected);
		});
		
		it("#should set the level on the master logger when given a valid name of type string", function(){
			
			let levelName = "silly";
			Loggerize.setLevel(levelName);
			
			actual = subject.level;
			expected = levelName;
			assert.strictEqual(actual, expected);
		});
		
		it("#should set the level on the master logger when given a valid name of type number", function(){
			
			let levelNum = 2;
			Loggerize.setLevel(levelNum);
			
			actual = subject.level;
			expected = "info";
			assert.strictEqual(actual, expected);
		});
		
		it("#should set the levelMapper on the master logger", function(){
			
			let mapper = "python";
			Loggerize.setLevelMap(mapper);
			
			actual = subject.levelMapper;
			expected = mapper;
			assert.strictEqual(actual, expected);
		});
		
	});
	
	describe('Manage Formatters: #addFormatter(), #removeFormatter()', function() {
			
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#should add formatter called 'myFormatter'", function(){
			Loggerize.addFormatter({
				"name": "myFormatter",
				"format": "%{timestamp} %{level} '%{message}'"
			});
			
			actual = subject.formatters["myFormatter"];
			expected = { format: "%{timestamp} %{level} '%{message}'" }
			assert.deepEqual(actual, expected);
		});
		
		it("#should remove formatter called 'myFormatter'", function(){
			
			let originalFormatters = JSON.parse(JSON.stringify(subject.formatters));
			
			Loggerize.addFormatter({
				"name": "myFormatter",
				"format": "%{timestamp} %{level} '%{message}'"
			});
			
			Loggerize.removeFormatter("myFormatter");
			
			actual = subject.formatters;
			expected = originalFormatters;
			assert.deepEqual(actual, expected);
		});
		
	});
	
	describe('Manage Handles: #addHandle(), #removeHandle()', function() {
			
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#should add handle called 'myHandle'", function(){
			
			Loggerize.addHandle({"name": "myHandle"});
			
			actual = subject.handles["myHandle"];
			expected = { 
				active: true,
				levelMapper: 'npm',
				level: 'debug',
				target: 'console',
				formatter: 'default'
			}
			assert.deepEqual(actual, expected);
		});
		
		it("#should remove handle called 'myHandle'", function(){
			
			let originalHandles = JSON.parse(JSON.stringify(subject.handles));
			
			Loggerize.addHandle({"name": "myHandle"});
			Loggerize.removeHandle("myHandle");
			
			actual = Object.keys(subject.handles);
			expected = Object.keys(originalHandles);
			assert.deepEqual(actual, expected);
		});
	});
	
	describe('Manage Targets: #addTarget(), #removeTarget()', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#should add target called 'myTarget'", function(){
			
			// Loggerize.addTarget({
				// "name": "myTarget",
				// "target": function(logRecord, handleOpts){console.log(logRecord["output"])}
			// });
			
			//Alternative
			Loggerize.addTarget("myTarget", function(logRecord, handleOpts){console.log(logRecord["output"])});
			
			actual = subject.targets["myTarget"].toString();
			expected = function(logRecord, handleOpts){console.log(logRecord["output"])}
			assert.equal(actual, expected.toString());
		});
		
		it("#should remove target called 'myTarget'", function(){
			
			let originalTargets = Object.keys(subject.targets);
			
			Loggerize.addTarget("myTarget", function(logRecord, handleOpts){console.log(logRecord["output"])});
			Loggerize.removeTarget("myTarget");
			
			actual = Object.keys(subject.targets);
			expected = originalTargets;
			assert.deepEqual(actual, expected);
		});
	});
	
	describe('Manage Filters: #addFilter(), #removeFiler()', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#should add filter called 'myFilter'", function(){
			
			// Loggerize.addFilter({
				// "name": "myFilter",
				// "filter": function(logRecord){return true;}
			// });
			
			//Alternative
			Loggerize.addFilter("myFilter", function(logRecord){return true;});
			
			actual = subject.filters["myFilter"].toString();
			expected = function(logRecord){return true;}
			assert.equal(actual, expected.toString());
		});
		
		it("#should remove filter called 'myFilter'", function(){
			
			let originalFilters = Object.keys(subject.filters);
			
			Loggerize.addFilter("myFilter", function(logRecord, handleOpts){console.log(logRecord["output"])});
			Loggerize.removeFilter("myFilter");
			
			actual = Object.keys(subject.filters);
			expected = originalFilters;
			assert.deepEqual(actual, expected);
		});
		
	});
	
	describe('Manage Transformers: #addTransformer(), #removeTransformer()', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#should add transformer called 'myTransformer'", function(){
			
			Loggerize.addTransformer({
				"name": "myTransformer",
				"transformer": function(logRecord){return logRecord["output"].toUpperCase();}
			});
			
			//Alternative
			// Loggerize.addTransformer("myTransformer", function(logRecord){return logRecord["output"].toUpperCase();});
			
			actual = subject.transformers["myTransformer"].toString();
			expected = function(logRecord){return logRecord["output"].toUpperCase();}
			assert.equal(actual, expected.toString());
		});
		
		it("#should remove transformer called 'myTransformer'", function(){
			
			let originalTransformers = Object.keys(subject.transformers);
			
			Loggerize.addTransformer("myTransformer", function(logRecord, handleOpts){console.log(logRecord["output"])});
			Loggerize.removeTransformer("myTransformer");
			
			actual = Object.keys(subject.transformers);
			expected = originalTransformers;
			assert.deepEqual(actual, expected);
		});
		
	});
	
	
	describe('Manage Event Handlers', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#on() should handle emitted event when a record is logged", function(){
			
			logger = Loggerize.getLogger("_anonymous");
			Loggerize.on("logged", function(logRecord){
				actual = logRecord["output"];
				expected = "info Log Message Test!";
				assert.equal(actual, expected);
			});
			
			Loggerize.addHandle({
				"emitEvents": true,
				"name": "myHandle",
				"formatter": "default",
				"target": null
			});
			
			logger.attachHandles("myHandle");
			logger.detachHandles("default"); //If default is not unset it will also print
			
			logger.log("info", "Log Message Test!");
		});
		
	});
	
	describe('Test Convenience Interface', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#error() Should log message at error level when passed a string", function(){
			
			Loggerize.on("logged", function(logRecord){
				actual = logRecord["output"];
				expected = "error Log Message Test!";
				assert.equal(actual, expected);
			});
			
			Loggerize.addHandle({
				"emitEvents": true,
				"name": "myHandle",
				"formatter": "default",
				"target": null
			});
			
			subject.loggers["_anonymous"].attachHandles("myHandle");
			subject.loggers["_anonymous"].detachHandles("default");
			
			Loggerize.error("Log Message Test!");
		});
		it("#warn() Should log message at warn level when passed a string", function(){
			
			Loggerize.on("logged", function(logRecord){
				actual = logRecord["output"];
				expected = "warn Log Message Test!";
				assert.equal(actual, expected);
			});
			
			Loggerize.addHandle({
				"emitEvents": true,
				"name": "myHandle",
				"formatter": "default",
				"target": null
			});
			
			subject.loggers["_anonymous"].attachHandles("myHandle");
			subject.loggers["_anonymous"].detachHandles("default");
			
			 Loggerize.warn("Log Message Test!");
		});
		it("#info() Should log message at info level when passed a string", function(){
			
			Loggerize.on("logged", function(logRecord){
				actual = logRecord["output"];
				expected = "info Log Message Test!";
				assert.equal(actual, expected);
			});
			
			Loggerize.addHandle({
				"emitEvents": true,
				"name": "myHandle",
				"formatter": "default",
				"target": null
			});
			
			subject.loggers["_anonymous"].attachHandles("myHandle");
			subject.loggers["_anonymous"].detachHandles("default");
			
			Loggerize.info("Log Message Test!");
		});
		it("#verbose() Should log message at verbose level when passed a string", function(){
			
			Loggerize.on("logged", function(logRecord){
				actual = logRecord["output"];
				expected = "verbose Log Message Test!";
				assert.equal(actual, expected);
			});
			
			Loggerize.addHandle({
				"emitEvents": true,
				"name": "myHandle",
				"formatter": "default",
				"target": null
			});
			
			subject.loggers["_anonymous"].attachHandles("myHandle");
			subject.loggers["_anonymous"].detachHandles("default");
			
			Loggerize.verbose("Log Message Test!");
		});
		it("#debug() Should log message at debug level when passed a string", function(){
			
			Loggerize.on("logged", function(logRecord){
				actual = logRecord["output"];
				expected = "debug Log Message Test!";
				assert.equal(actual, expected);
			});
			
			Loggerize.addHandle({
				"emitEvents": true,
				"name": "myHandle",
				"formatter": "default",
				"target": null
			});
			
			subject.loggers["_anonymous"].attachHandles("myHandle");
			subject.loggers["_anonymous"].detachHandles("default");
			
			Loggerize.debug("Log Message Test!");
		});
		
	});
	
	describe.skip('Level Colorization', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')]
			delete require.cache[require.resolve('../lib/logger.js')]
			delete require.cache[require.resolve('../lib/loggerproxy.js')]
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#should colorize level accoring to defaults when no parameter is passed", function(){
			
			Loggerize.colorizeLevels();
			logger = Loggerize.getLogger("_anonymous");			
			
			logger.log("error", "Color Coded Log Message");
			logger.log("warn", 	"Color Coded Log Message");
			logger.log("info", 	"Color Coded Log Message");
			logger.log("verbose", "Color Coded Log Message");
			logger.log("debug", "Color Coded Log Message");
		});
		
		it("#should colorize level accoring to defined colorMap", function(){
			
			var colorMap = {
				"error": 	"redBright", 
				"warning": 	"yellowBright", 
				"info": 	"purpleBright", 
				"verbose": 	"blueBright", 
				"debug": 	"greenBright",
				
				"error": "red bgcyan", 
				"warn": ["yellow", "underline", ""], 
				"warning": ["yellow", "underline", ""], 
				"info": "purpleBright", 
				"verbose": "bgblue", 
				"debug": "green"	
			};
			
			Loggerize.colorizeLevels(colorMap);
			logger = Loggerize.getLogger("_anonymous");			
			
			logger.log("error", "Color Coded Log Message");
			logger.log("warn", 	"Color Coded Log Message");
			logger.log("info", 	"Color Coded Log Message");
			logger.log("verbose", "Color Coded Log Message");
			logger.log("debug", "Color Coded Log Message");
			
		});

		it("#should remove level colors", function(){
			
			Loggerize.decolorizeLevels();
			logger = Loggerize.getLogger("_anonymous");			
			
			logger.log("error", "Color Coded Log Message");
			logger.log("warn", 	"Color Coded Log Message");
			logger.log("info", 	"Color Coded Log Message");
			logger.log("verbose", "Color Coded Log Message");
			logger.log("debug", "Color Coded Log Message");
			
		});
		
	});
	
	
});


