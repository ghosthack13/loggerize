"use strict";

var assert = require('assert');

//Style 
//<method>_Should<expected>_When<condition> | E.g. Deposit_ShouldIncreaseBalance_WhenGivenPositiveValue

describe('Library (index.js)', function(){
	
	describe('#createLogger()', function() {
		
		//Because Loggerize proxies request to a singleton that maintaines state,
		//it is require to purge cache on each test to ensure settings brought forward
		//from previous test

		let Loggerize;
		let subject; // eslint-disable-line no-unused-vars
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			Loggerize = require('../lib/index.js');
			subject = require('../lib/logger.js'); //Singleton Logger Instance
		});
		
		
		it('should create a logger with defaults when passed parameter of type \'string\'', function(){
			
			let logger = Loggerize.createLogger("myLogger");
			
			let actual = logger;
			let expected = {
				"name": 'myLogger',
				"emitEvents": false,
				"levelMapper": 'npm',
				"propogate": true,
				"isMuted": false,
				"handles": [ 'default' ],
				"hasHandles": true,
				"filters": [],
				"level": 'debug'
			};
			
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
				"emitEvents": false,
				"levelMapper": 'npm',
				"propogate": true,
				"isMuted": false,
				"handles": [ 'myHandle' ],
				"hasHandles": true,
				"filters": [],
				"level": 'debug'
			};
			
			assert.deepEqual(actual, expected);
		});
		
		it('should create a logger and attach handles when passed an array handle configurations', function(){
			
			let opts = {
				"name": "myLogger",
				"handle": [
					{
						"name": "myHandle1",
						"target": "console",
					},
					{
						"name": "myHandle2",
						"target": null,
					},
				],
			};
			let logger = Loggerize.createLogger(opts);
			
			let actual = logger;
			let expected = {
				"name": 'myLogger',
				"emitEvents": false,
				"levelMapper": 'npm',
				"propogate": true,
				"isMuted": false,
				"handles": [ 'myHandle1', 'myHandle2' ],
				"hasHandles": true,
				"filters": [],
				"level": 'debug'
			};
			
			assert.deepEqual(actual, expected);
		});
		
		it('should create a logger and attach handles when passed an array handle names/configurations', function(){
			
			let opts = {
				"name": "myLogger",
				"handle": [
					"default",
					{"name": "myHandle2", "target": null},
				],
			};
			let logger = Loggerize.createLogger(opts);
			
			let actual = logger;
			let expected = {
				"name": 'myLogger',
				"emitEvents": false,
				"levelMapper": 'npm',
				"propogate": true,
				"isMuted": false,
				"handles": [ 'default', 'myHandle2' ],
				"hasHandles": true,
				"filters": [],
				"level": 'debug'
			};
			
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
			
			assert(/_handle\d{13}/.test(
				logger.handles[0]), 
				"A handle named '_handle<time in millis>' should have been created"
			);
			delete logger.handles;
			
			let actual = logger;
			let expected = {
				"name": 'myLogger',
				"emitEvents": false,
				"levelMapper": 'python',
				"propogate": false,
				"isMuted": false,
				// "handles": [ 'default' ],
				"hasHandles": true,
				"filters": [],
				"level": 'error'
			};
			
			assert.deepEqual(actual, expected);
		});
		
		it('should configure handle to emit events when logger is set to emit events', function(){
			
			//Add handle without emitEvents
			Loggerize.addHandle({
				"name": "myHandle"
			})
			
			//Assert emitEvents is not set on handle
			assert.strictEqual(subject.handles["myHandle"]["emitEvents"], false);
			
			//Create logger that emits events
			let logger = Loggerize.createLogger({
				"name": "myLogger",
				"emitEvents": true,
				"handle": ["myHandle", "default"]
			});
			
			//Assert that adding the logger above causes emitEvents to get set on handle
			assert.strictEqual(subject.handles["myHandle"]["emitEvents"], true);
		});
		
		
	});
	
	describe('#getLogger()', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/

		let Loggerize;
		let subject;
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			Loggerize = require('../lib/index.js');
			subject = require('../lib/logger.js'); //Singleton Logger Instance
		});
		
		it('should create a logger w/o any level, levelMapper or handles attached when passed only a logger name', function(){
			
			assert.strictEqual(subject.loggers["myLogger"], undefined);
			
			let actual = Loggerize.getLogger("myLogger");
			let expected = {
				name: 'myLogger',
				propogate: true,
				isMuted: false,
				handles: [],
				hasHandles: false,
				filters: []
			};
			
			assert.deepEqual(actual, expected);
		});
		
		it('should retrieve the already defined logger when passed name of an existing logger', function(){
			
			let logger = Loggerize.getLogger("_anonymous");
			
			assert(/_anonymous\d{13}/.test(logger.handles[0]), "Expected handle name in form _anonymous<timestamp millis>")
			delete logger["handles"];
			
			let actual = logger;
			let expected = {
				name: '_anonymous',
				propogate: false,
				isMuted: false,
				// handles: [ 'default' ],
				hasHandles: true,
				filters: [],
				levelMapper: 'npm',
				level: 'debug',
				emitEvents: false,
			};
			
			assert.deepEqual(actual, expected);
		});
		
		
	});
	
	describe('#getRootLogger()', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/

		let Loggerize;
		let subject; // eslint-disable-line no-unused-vars
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			Loggerize = require('../lib/index.js');
			subject = require('../lib/logger.js'); //Singleton Logger Instance
		});
		
		it('should retrieve the root logger', function(){
			
			let logger = Loggerize.getLogger("root");
			
			let actual = logger;
			let expected = {
				name: 'root',
				"emitEvents": false,
				propogate: true,
				isMuted: false,
				handles: [],
				hasHandles: false,
				filters: [],
				"level": "debug",
				levelMapper: 'npm'
			};
			
			assert.deepEqual(actual, expected);
		});
		
		
	});
	
	
	describe('#createHTTPLogger()', function() {
		
		//Because Loggerize proxies request to a singleton that maintaines state,
		//it is require to purge cache on each test to ensure settings brought forward
		//from previous test

		let Loggerize;
		let subject; // eslint-disable-line no-unused-vars
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			Loggerize = require('../lib/index.js');
			subject = require('../lib/logger.js'); //Singleton Logger Instance
		});
		
		it('should create a middleware logger named after string parameter', function(){
			
			let logger = Loggerize.createHTTPLogger({"name": "myMiddleware", "isMiddleware": true});
			
			//Ensure middleware logger was added to handles
			assert.strictEqual(Array.isArray(logger.handles), logger.handles.length == 1);
			delete logger.handles;
			
			delete logger.httpListener; //Function to complicated and dynamic to assert
			
			let actual = logger;
			let expected = {
				name: 'myMiddleware',
				emitEvents: false,
				propogate: false,
				isMuted: false,
				// handles: [ 'netMiddleware' ],
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
			let logger = Loggerize.createHTTPLogger(opts);
			delete logger.httpListener; //Function to complicated and dynamic to assert
			
			let actual = logger;
			let expected = {
				name: 'myMiddleware',
				emitEvents: false,
				propogate: false,
				isMuted: false,
				handles: [ 'myMiddlewareHandle' ],
				hasHandles: true,
				filters: [],
				logOnRequest: true,
				logOnResponse: true,
				levelMapper: 'http',
				level: 'information',
			};
			
			assert.deepEqual(actual, expected);
		});
		
		it('should create middleware logger with properties defined in opts when passed object as parameter', function(){
			
			let opts = {
				"name": "myMiddleware",
				"levelMapper": 'python'
			};
			let logger = Loggerize.createHTTPLogger(opts);
			
			//Individually check dynamic handle
			assert.equal(/_defaultHTTP\d{13}/.test(logger.handles[0]), true);
			delete logger.handles;
			
			//Let it be sufficient to check that function exists
			assert.strictEqual(typeof(logger.httpListener), "function");
			delete logger.httpListener; //Function to complicated and dynamic to assert
			
			let actual = logger;
			let expected = {
				name: 'myMiddleware',
				emitEvents: false,
				propogate: false,
				isMuted: false,
				// handles: [ '_defaultHTTP1548030059653' ],
				hasHandles: true,
				filters: [],
				logOnRequest: false,
				logOnResponse: true,
				// "httpListener": [Function],
				levelMapper: 'python',
				level: 'debug',
			};
			
			assert.deepEqual(actual, expected);
		});
		
	});
	
	describe('#mw()', function() {
		
		//Because Loggerize proxies request to a singleton that maintaines state,
		//it is require to purge cache on each test to ensure settings brought forward
		//from previous test

		let Loggerize;
		let subject; // eslint-disable-line no-unused-vars
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
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

		let Loggerize;
		let subject; // eslint-disable-line no-unused-vars
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			Loggerize = require('../lib/index.js');
			subject = require('../lib/logger.js'); //Singleton Logger Instance
		});
		
		it('should create a request/response logger named after string parameter', function(){
			
			let logger = Loggerize.createHTTPLogger("myRequestListener");
			
			//Let it be sufficient to check that function exists
			assert.strictEqual(typeof(logger.httpListener), "function");
			delete logger.httpListener; //Function to complicated and dynamic to assert
			
			
			let actual = logger;
			let expected = {
				name: 'myRequestListener',
				emitEvents: false,
				propogate: false,
				isMuted: false,
				handles: ['defaultHTTP'],
				hasHandles: true,
				filters: [],
				logOnRequest: false,
				logOnResponse: true,
				levelMapper: 'http',
				level: 'information',
				// "httpListener": [Function],
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
			let logger = Loggerize.createHTTPLogger(opts);
			
			//Let it be sufficient to check that function exists
			assert.strictEqual(typeof(logger.httpListener), "function");
			delete logger.httpListener; //Function to complicated and dynamic to assert
			
			
			let actual = logger;
			let expected = {
				name: 'myRequestListener',
				emitEvents: false,
				propogate: false,
				isMuted: false,
				handles: [ 'myRequestHandle' ],
				hasHandles: true,
				filters: [],
				logOnRequest: true,
				logOnResponse: true,
				levelMapper: 'http',
				level: 'information',
				// "httpListener": [Function],
			};
			
			assert.deepEqual(actual, expected);
		});
		
		it('should create request/response logger with properties defined in opts when passed object as parameter', function(){
			
			let opts = {
				"name": "myRequestListener",
				"levelMapper": 'python'
			};
			let logger = Loggerize.createHTTPLogger(opts);
			
			//Individually check dynamic handle
			assert.equal(/_defaultHTTP\d{13}/.test(logger.handles[0]), true);
			delete logger.handles;
			
			//Let it be sufficient to check that function exists
			assert.strictEqual(typeof(logger.httpListener), "function");
			delete logger.httpListener; //Function to complicated and dynamic to assert
			
			let actual = logger;
			let expected = {
				name: 'myRequestListener',
				emitEvents: false,
				propogate: false,
				isMuted: false,
				// handles: [ 'reqListener' ],
				hasHandles: true,
				filters: [],
				logOnRequest: false,
				logOnResponse: true,
				levelMapper: 'python',
				level: 'debug',
				// "httpListener": [Function],
			};
			
			assert.deepEqual(actual, expected);
		});
		
	});
	
	
	describe('Manage Levels: #getLevel(), #setLevel(), #setLevelMapper()', function() {
			
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/

		let Loggerize;
		let subject;
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#should get the level as set on the master logger", function(){
			
			let actual = subject.level;
			let expected = Loggerize.getLevel();
			assert.strictEqual(actual, expected);
		});
		
		it("#should set the level on the master logger when given a valid name of type string", function(){
			
			let levelName = "silly";
			Loggerize.setLevel(levelName);
			
			let actual = subject.level;
			let expected = levelName;
			assert.strictEqual(actual, expected);
		});
		
		it("#should set the level on the master logger when given a valid name of type number", function(){
			
			let levelNum = 2;
			Loggerize.setLevel(levelNum);
			
			let actual = subject.level;
			let expected = "info";
			assert.strictEqual(actual, expected);
		});
		
		it("#should set the levelMapper on the master logger", function(){
			
			let mapper = "python";
			Loggerize.setLevelMapper(mapper);
			
			let actual = subject.levelMapper;
			let expected = mapper;
			assert.strictEqual(actual, expected);
		});
		
	});
	
	describe('Manage Formatters: #addFormatter(), #removeFormatter()', function() {
			
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/

		let Loggerize;
		let subject;
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#addFormatters - should add a list of formatters when passed an array of formatter definitions", function() {
			
			var predefinedFormatters = Object.keys(subject.formatters).sort();
			
			Loggerize.addFormatters([
				{"name": "myFormatter1", "format": "%{timestamp} %{level} '%{message}'"},
				{"name": "myFormatter2", "format": "%{timestamp} %{level} '%{message}'"},
				{"name": "myFormatter3", "format": "%{timestamp} %{level} '%{message}'"}
			]);
			
			let actual = Object.keys(subject.formatters).sort();
			let expected = predefinedFormatters.concat(["myFormatter1", "myFormatter2", "myFormatter3"]).sort();
			
			assert.deepEqual(actual, expected);
		});
		
		it("#should add formatter called 'myFormatter'", function(){
			Loggerize.addFormatter({
				"name": "myFormatter",
				"format": "%{timestamp} %{level} '%{message}'"
			});
			
			let actual = subject.formatters["myFormatter"];
			let expected = { format: "%{timestamp} %{level} '%{message}'" };
			assert.deepEqual(actual, expected);
		});
		
		it("#should remove formatter called 'myFormatter'", function(){
			
			let originalFormatters = JSON.parse(JSON.stringify(subject.formatters));
			
			Loggerize.addFormatter({
				"name": "myFormatter",
				"format": "%{timestamp} %{level} '%{message}'"
			});
			
			Loggerize.removeFormatter("myFormatter");
			
			let actual = subject.formatters;
			let expected = originalFormatters;
			assert.deepEqual(actual, expected);
		});
		
	});
	
	describe('Manage Handles: #addHandle(), #removeHandle()', function() {
			
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/

		let Loggerize;
		let subject;
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#addHandles - should add list of handles when passed an array of handle definitions", function(){
			assert.strictEqual(subject.handles["myHandle1"], undefined);
			assert.strictEqual(subject.handles["myHandle2"], undefined);
			Loggerize.addHandles([{"name": "myHandle1"}, {"name": "myHandle2"}]);
			assert.notStrictEqual(subject.handles["myHandle1"], undefined);
			assert.notStrictEqual(subject.handles["myHandle2"], undefined);
		});
		
		it("#should add handle called 'myHandle'", function(){
			
			Loggerize.addHandle({"name": "myHandle"});
			
			let actual = subject.handles["myHandle"];
			let expected = { 
				active: true,
				levelMapper: 'npm',
				level: 'debug',
				"emitEvents": false,
				target: 'console',
				formatter: 'default'
			};
			assert.deepEqual(actual, expected);
		});
		
		it("#should remove handle called 'myHandle'", function(){
			
			let originalHandles = JSON.parse(JSON.stringify(subject.handles));
			
			Loggerize.addHandle({"name": "myHandle"});
			Loggerize.removeHandle("myHandle");
			
			let actual = Object.keys(subject.handles);
			let expected = Object.keys(originalHandles);
			assert.deepEqual(actual, expected);
		});
	});
	
	describe('Manage Targets: #addTarget(), #removeTarget()', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/

		let Loggerize;
		let subject;
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#should add target called 'myTarget'", function(){
			
			/*
			Loggerize.addTarget({
				"name": "myTarget",
				"target": function(logRecord, handleOpts){console.log(logRecord["output"])}
			});
			/**/
			
			//Alternative
			Loggerize.addTarget("myTarget", function(logRecord, handleOpts){ // eslint-disable-line no-unused-vars
				console.log(logRecord["output"]); // eslint-disable-line no-console
			});
			
			let actual = subject.targets["myTarget"].toString();
			let expected = function(logRecord, handleOpts){ // eslint-disable-line no-unused-vars
				console.log(logRecord["output"]); // eslint-disable-line no-console
			};
			assert.equal(actual, expected.toString());
		});
		
		it("#should remove target called 'myTarget'", function(){
			
			let originalTargets = Object.keys(subject.targets);
			
			Loggerize.addTarget("myTarget", function(logRecord, handleOpts){ // eslint-disable-line no-unused-vars
				console.log(logRecord["output"]); // eslint-disable-line no-console
			});
			Loggerize.removeTarget("myTarget");
			
			let actual = Object.keys(subject.targets);
			let expected = originalTargets;
			assert.deepEqual(actual, expected);
		});
	});
	
	describe('Manage Filters: #addFilter(), #removeFiler()', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/

		let Loggerize;
		let subject;
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#should add filter called 'myFilter'", function(){
			
			/*
			Loggerize.addFilter({
				"name": "myFilter",
				"filter": function(logRecord){return true;}
			});
			/**/
			
			//Alternative
			Loggerize.addFilter("myFilter", function(logRecord){return true;}); // eslint-disable-line no-unused-vars
			
			let actual = subject.filters["myFilter"].toString();
			let expected = function(logRecord){return true;}; // eslint-disable-line no-unused-vars
			assert.equal(actual, expected.toString());
		});
		
		it("#should remove filter called 'myFilter'", function(){
			
			let originalFilters = Object.keys(subject.filters);
			
			Loggerize.addFilter("myFilter", function(logRecord, handleOpts){ // eslint-disable-line no-unused-vars
				console.log(logRecord["output"]); // eslint-disable-line no-console
			});
			Loggerize.removeFilter("myFilter");
			
			let actual = Object.keys(subject.filters);
			let expected = originalFilters;
			assert.deepEqual(actual, expected);
		});
		
	});
	
	describe('Manage Transformers: #addTransformer(), #removeTransformer()', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/

		let Loggerize;
		let subject;
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
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
			
			let actual = subject.transformers["myTransformer"].toString();
			let expected = function(logRecord){return logRecord["output"].toUpperCase();};
			assert.equal(actual, expected.toString());
		});
		
		it("#should remove transformer called 'myTransformer'", function(){
			
			let originalTransformers = Object.keys(subject.transformers);
			
			Loggerize.addTransformer("myTransformer", function(logRecord, handleOpts){ // eslint-disable-line no-unused-vars
				console.log(logRecord["output"]); // eslint-disable-line no-console
			});
			Loggerize.removeTransformer("myTransformer");
			
			let actual = Object.keys(subject.transformers);
			let expected = originalTransformers;
			assert.deepEqual(actual, expected);
		});
		
	});
	
	
	describe('Manage Event Handlers', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/

		let Loggerize;
		let subject; // eslint-disable-line no-unused-vars
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#on() should handle emitted event when a record is logged", function(done){
			
			Loggerize.on("logged", function(logRecord){
				let actual = logRecord["output"];
				let expected = "info Log Message Test!";
				assert.equal(actual, expected);
				done();
			});
			
			let logger = Loggerize.createLogger({
				"name": "myLogger",
				"handle": {
					"emitEvents": true,
					"name": "myHandle",
					"formatter": "default",
					"target": null,
				}
			});
			
			logger.log("info", "Log Message Test!");
		});
		
	});
	
	describe('Test Default Logger', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/

		let Loggerize;
		let subject;
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#setFileTarget() Should output to file when path supplied as argument", function(done){
			
			Loggerize.on("logged", function(logRecord){
				let actual = logRecord["output"];
				let expected = "info Log Message Test";
				assert.equal(actual, expected);
				done();
			});
			
			var logger = Loggerize;
			
			logger.setFileTarget("./test/test.log");
			
			let anonymousHandleName = subject.loggers["_anonymous"].handles[0];
			subject.handles[anonymousHandleName]["emitEvents"] = true;
			
			logger.info("Log Message Test");
			
		});
		
		it("#setConsoleTarget() Should output to the console", function(done){
			
			Loggerize.on("logged", function(logRecord){
				let actual = logRecord["output"];
				let expected = "info Log Message Test!";
				assert.equal(actual, expected);
				done();
			});
			
			var logger = Loggerize;
			logger.setConsoleTarget();
			
			let anonymousHandleName = subject.loggers["_anonymous"].handles[0];
			subject.handles[anonymousHandleName]["emitEvents"] = true;
			
			logger.info("Log Message Test!");
			
		});
		
		it("#setFormat() Should changed the outpue format when passed desired format as paramter", function(done){
			
			Loggerize.on("logged", function(logRecord){
				let actual = logRecord["output"];
				let expected = "_anonymous info Log Message Test!";
				assert.equal(actual, expected);
				done();
			});
			
			var logger = Loggerize;
			logger.setFormat("%{loggerName} %{level} %{message}");
			
			let anonymousHandleName = subject.loggers["_anonymous"].handles[0];
			subject.handles[anonymousHandleName]["emitEvents"] = true;
			subject.handles[anonymousHandleName]["target"] = null;
			
			logger.info("Log Message Test!");
			
		});
		
		it("#getLevel() Should get the default level of the library and by extension the anonymous logger", function(){
			
			var logger = Loggerize;
			let actual = logger.getLevel();
			let expected = "debug";
			assert.strictEqual(actual, expected);
			
		});
		
		it("#setLevel() Should set the default level of the library and by extension the anonymous logger", function(){
			
			var logger = Loggerize;
			logger.setLevel("info");
			let actual = logger.getLevel();
			let expected = "info";
			assert.strictEqual(actual, expected);
			
		});
		
		it("#error() Should log message at error level when passed a string", function(done){
			
			Loggerize.on("logged", function(logRecord){
				let actual = logRecord["output"];
				let expected = "error Log Message Test!";
				assert.equal(actual, expected);
				done();
			});
			
			let anonymousHandleName = subject.loggers["_anonymous"].handles[0];
			subject.handles[anonymousHandleName]["emitEvents"] = true;
			subject.handles[anonymousHandleName]["target"] = null;
			
			Loggerize.error("Log Message Test!");
		});
		
		it("#warn() Should log message at warn level when passed a string", function(done){
			
			Loggerize.on("logged", function(logRecord){
				let actual = logRecord["output"];
				let expected = "warn Log Message Test!";
				assert.equal(actual, expected);
				done();
			});
			
			let anonymousHandleName = subject.loggers["_anonymous"].handles[0];
			subject.handles[anonymousHandleName]["emitEvents"] = true;
			subject.handles[anonymousHandleName]["target"] = null;
			
			Loggerize.warn("Log Message Test!");
		});
		
		it("#info() Should log message at info level when passed a string", function(done){
			
			Loggerize.on("logged", function(logRecord){
				let actual = logRecord["output"];
				let expected = "info Log Message Test!";
				assert.equal(actual, expected);
				done();
			});
			
			let anonymousHandleName = subject.loggers["_anonymous"].handles[0];
			subject.handles[anonymousHandleName]["emitEvents"] = true;
			subject.handles[anonymousHandleName]["target"] = null;
			
			Loggerize.info("Log Message Test!");
		});
		
		it("#verbose() Should log message at verbose level when passed a string", function(done){
			
			Loggerize.on("logged", function(logRecord){
				let actual = logRecord["output"];
				let expected = "verbose Log Message Test!";
				assert.equal(actual, expected);
				done();
			});
			
			let anonymousHandleName = subject.loggers["_anonymous"].handles[0];
			subject.handles[anonymousHandleName]["emitEvents"] = true;
			subject.handles[anonymousHandleName]["target"] = null;
			
			Loggerize.verbose("Log Message Test!");
		});
		
		it("#debug() Should log message at debug level when passed a string", function(done){
			
			Loggerize.on("logged", function(logRecord){
				let actual = logRecord["output"];
				let expected = "debug Log Message Test!";
				assert.equal(actual, expected);
				done();
			});
			
			let anonymousHandleName = subject.loggers["_anonymous"].handles[0];
			subject.handles[anonymousHandleName]["emitEvents"] = true;
			subject.handles[anonymousHandleName]["target"] = null;
			
			Loggerize.debug("Log Message Test!");
		});
		
	});
	
	describe.skip('Level Colorization', function() {
		
		/** Because Loggerize proxies request to a singleton that maintaines state,
			it is require to purge cache on each test to ensure settings brought forward
			from previous test
		*/

		let Loggerize;
		let subject; // eslint-disable-line no-unused-vars
		beforeEach(function() {
			delete require.cache[require.resolve('../lib/index.js')];
			delete require.cache[require.resolve('../lib/logger.js')];
			delete require.cache[require.resolve('../lib/loggerproxy.js')];
			subject = require('../lib/logger.js'); //Singleton Logger Instance
			Loggerize = require('../lib/index.js');
		});
		
		it("#should colorize level accoring to defaults when no parameter is passed", function(){
			
			Loggerize.colorizeLevels();
			let logger = Loggerize.getLogger("_anonymous");			
			
			logger.log("error", "Color Coded Log Message");
			logger.log("warn", 	"Color Coded Log Message");
			logger.log("info", 	"Color Coded Log Message");
			logger.log("verbose", "Color Coded Log Message");
			logger.log("debug", "Color Coded Log Message");
		});
		
		it("#should colorize level accoring to defined colorMap", function(){
			
			var colorMap = {
				// "error": 	"redBright", 
				// "warning": 	"yellowBright", 
				// "info": 	"purpleBright", 
				// "verbose": 	"blueBright", 
				// "debug": 	"greenBright",
				
				"error": "red bgcyan", 
				"warn": ["yellow", "underline", ""], 
				"warning": ["yellow", "underline", ""], 
				"info": "purpleBright", 
				"verbose": "bgblue", 
				"debug": "green"	
			};
			
			Loggerize.colorizeLevels(colorMap);
			let logger = Loggerize.getLogger("_anonymous");			
			
			logger.log("error", "Color Coded Log Message");
			logger.log("warn", 	"Color Coded Log Message");
			logger.log("info", 	"Color Coded Log Message");
			logger.log("verbose", "Color Coded Log Message");
			logger.log("debug", "Color Coded Log Message");
			
		});

		it("#should remove level colors", function(){
			
			Loggerize.decolorizeLevels();
			let logger = Loggerize.getLogger("_anonymous");			
			
			logger.log("error", "Color Coded Log Message");
			logger.log("warn", 	"Color Coded Log Message");
			logger.log("info", 	"Color Coded Log Message");
			logger.log("verbose", "Color Coded Log Message");
			logger.log("debug", "Color Coded Log Message");
			
		});
		
	});
	
	
});


