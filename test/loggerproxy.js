"use strict";
 
var assert = require('assert');

//Style 
//<method>_Should<expected>_When<condition> | E.g. Deposit_ShouldIncreaseBalance_WhenGivenPositiveValue

var fs = require("fs");
var path = require("path");

describe('LoggerProxy', function() {
	
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
	
	
	it('#attachHandles(handleName) should attach handle named in parameter and set logger\'s previously undefined level map to match attached handler', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.attachHandles("default");
		
		let actual = logger;
		let expected = {
			name: 'myLogger',
			propogate: true,
			isMuted: false,
			handles: [ 'default' ],
			hasHandles: true,
			filters: [],
			levelMapper: subject.handles["default"]["levelMapper"],
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it('#attachHandles(handleNames) should attach handles named in parameter', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.attachHandles(["default", "_anonymous"]);
		
		let actual = logger;
		let expected = {
			name: 'myLogger',
			propogate: true,
			isMuted: false,
			handles: [ 'default',  '_anonymous' ],
			hasHandles: true,
			filters: [],
			levelMapper: 'npm'
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it('#attachHandles(handleOpts) should attach a handle defined by the given options to logger', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		
		let opts = {
			"name": "myAutoHandle",
			"emitEvents": true,
			"formatter": "default",
			"target": null
		};
		logger.attachHandles(opts);
		
		let actual = logger;
		let expected = {
			name: 'myLogger',
			propogate: true,
			isMuted: false,
			handles: [ "myAutoHandle" ],
			hasHandles: true,
			filters: [],
			levelMapper: 'npm'
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it('#attachHandles(handleOpts) should add a handle defined by the given options to global list of handles', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		
		let opts = {
			"name": "myAutoHandle",
			"emitEvents": true,
			"formatter": "default",
			"target": null
		};
		logger.attachHandles(opts);
		
		let actual = subject.handles["myAutoHandle"];
		let expected = {
			emitEvents: true,
			formatter: 'default',
			target: null,
			active: true,
			levelMapper: subject.levelMapper,
			level: subject.level,
		};
		
		assert.deepEqual(actual, expected);
	});
	
	
	it('#detachHandles(handleName) should detach handle named in parameter', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.attachHandles(["default", "_anonymous"]);
		logger.detachHandles("_anonymous");
		
		let actual = logger;
		let expected = {
			name: 'myLogger',
			propogate: true,
			isMuted: false,
			handles: ["default"],
			hasHandles: true,
			filters: [],
			"levelMapper": "npm",
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it('#detachHandles(handleNames) should detach handles named in parameter', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.attachHandles(["default", "_anonymous"]);
		logger.detachHandles(["default"]);
		
		let actual = logger;
		let expected = {
			name: 'myLogger',
			propogate: true,
			isMuted: false,
			handles: ["_anonymous"],
			hasHandles: true,
			filters: [],
			"levelMapper": "npm",
		};
		
		assert.deepEqual(actual, expected);
	});
	
	
	it('#attachFilter(filterName[, opts]) should attach filter named in parameter with its options', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.attachFilter("regex", {"onMatch": "deny"});
		
		let actual = logger;
		let expected = {
			name: 'myLogger',
			propogate: true,
			isMuted: false,
			handles: [],
			hasHandles: false,
			filters: ["regex"]
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it('#detachFilter(filterName) should detach filter named when passed a single string parameter', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.attachFilter("regex", {"onMatch": "deny"});
		
		logger.detachFilter("regex");
		
		let actual = logger;
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
	
	it('#detachFilter(filterNames) should detach filters named when passed an array of names', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.attachFilter("regex", {"onMatch": "deny"});
		
		logger.detachFilter(["regex"]);
		
		let actual = logger;
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
	
	
	it('#mute() should prevent all logs coming out of this logger', function(){
		
		const millis = (new Date()).valueOf();
		let myPath = __dirname + path.sep + "mutetest_" + millis + ".log";
		Loggerize.addHandle({
			"name": "myHandle", 
			"path": myPath,
		});
		
		let logger = Loggerize.getLogger("myLogger");
		logger.attachHandles("myHandle");
		logger.mute();
		logger.log("info", "Testing mute function");
		
		fs.stat(myPath, function(err, stats){ //eslint-disable-line no-unused-vars
			if (err){
				assert(true);
			}
			else{
				assert(false);
			}
		});
		
	});
	
	it('#unmute() should allow all logs from this logger', function(){
		
		const millis = (new Date()).valueOf();
		let myPath = __dirname + path.sep + "mutetest_" + millis + ".log";
		Loggerize.addHandle({
			"name": "myHandle", 
			"path": myPath,
		});
		
		let logger = Loggerize.getLogger("myLogger");
		logger.attachHandles("myHandle");
		logger.mute();
		logger.unmute();
		logger.log("info", "Testing unmute function");
		
		fs.stat(myPath, function(err, stats){ //eslint-disable-line no-unused-vars
			if (err){
				assert(false);
			}
			else{
				assert(true);
				fs.unlink(myPath, function(){
					if (err) throw err;
				});
			}
		});
		
	});
	
	it('#isMuted() should show that the logger is muted', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.mute();
		
		let actual = logger;
		let expected = {
			name: 'myLogger',
			propogate: true,
			isMuted: true,
			handles: [],
			hasHandles: false,
			filters: []
		};
		
		assert.deepEqual(actual, expected);
		
	});
	
	
	it('#setLevelMapper() should define/change the levelMapper of the logger', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.setLevelMapper("python");
		
		let actual = logger;
		let expected = {
			name: 'myLogger',
			propogate: true,
			isMuted: false,
			handles: [],
			hasHandles: false,
			filters: [],
			levelMapper: "python",
		};
		
		assert.deepEqual(actual, expected);
		
	});
	
	it('#setLevel() should define/change the level of the logger', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.setLevelMapper("defcon");
		logger.setLevel("defcon5");
		
		let actual = logger;
		let expected = {
			name: 'myLogger',
			propogate: true,
			isMuted: false,
			handles: [],
			hasHandles: false,
			filters: [],
			level: "defcon5",
			levelMapper: "defcon",
		};
		
		assert.deepEqual(actual, expected);
		
	});
	
	it('#getLevel() should return undefined when logger\'s level was not assigned', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		
		let actual = logger.getLevel();
		let expected = undefined;
		assert.strictEqual(actual, expected);
	});
	
	it('#getLevel() should get the level the logger was assigned', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.setLevelMapper("defcon");
		logger.setLevel("defcon5");
		
		let actual = logger.getLevel();
		let expected = "defcon5";
		assert.strictEqual(actual, expected);
		
	});
	
	it('#getEffectiveLevel() effective level should equal the level the logger was assigned', function(){
		
		let logger = Loggerize.getLogger("myLogger");
		logger.setLevelMapper("defcon");
		logger.setLevel("defcon5");
		
		let actual = logger.getEffectiveLevel();
		let expected = "defcon5";
		assert.strictEqual(actual, expected);
		
	});
	
	it('#getEffectiveLevel() effective level for a logger w/an undefined level should equal the level of its least severe ancestor', function(){
		
		let parentLogger = Loggerize.getLogger("myParentLogger");
		parentLogger.setLevelMapper("npm");
		parentLogger.setLevel("warn");
		
		let childLogger = Loggerize.getLogger("myParentLogger.myChildLogger");
		childLogger.setLevelMapper("npm");
		
		let actual = childLogger.getEffectiveLevel();
		let expected = "warn";
		assert.strictEqual(actual, expected);
		
	});
	
	
	it("#log() should log level and message when passed level and message", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "info Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"formatter": "default",
			"target": null
		});
		
		logger.attachHandles("myHandle");
		
		logger.log("info", "Log Message Test!");
	});
	
	it("#log() should log level and message when passed object with level and message properties", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "info Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"formatter": "default",
			"target": null
		});
		
		logger.attachHandles("myHandle");
		logger.log({"level": "info", "message": "Log Message Test!"});
	});
	
	it("#log() should guess level and log message when passed only an Error object", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "error Error object test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"formatter": "default",
			"target": null
		});
		
		logger.attachHandles("myHandle");
		logger.log(new Error("Error object test!"));
	});
	
	it("#log() override level in Error object but log message extracted", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "info Error object test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"formatter": "default",
			"target": null
		});
		
		logger.attachHandles("myHandle");
		logger.log("info", new Error("Error object test!"));
	});
	
	it("#log() override level in custom object but log message extracted", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "info ";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"formatter": "default",
			"target": null
		});
		
		logger.attachHandles("myHandle");
		logger.log("info", {"level": "debug", "message": ""});
	});
	
	//Log and propogate up ancestor tree
	it("#log() should output log message from every ancestor when logging at most severe level across ancestor tree", function(){
		
		var outputs = [];
		Loggerize.on("logged", function(logRecord){
			outputs.push(logRecord["output"]);
		});
		
		Loggerize.on("finished", function(){
			let actual = outputs;
			let expected = [
				'warn Log Message Test! | myGrandParent.myParent.myChild',
				'warn Log Message Test! | myGrandParent.myParent',
				'warn Log Message Test! | myGrandParent',
			];
			assert.deepEqual(actual, expected);
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"target": null,
			"formatter": {
				"name": "ancestorFmt",
				"format": "%{level} %{message} | %{loggerName}"
			}
		});
		
		// let rootLogger = Loggerize.getRootLogger();
		// rootLogger.setLevel("silly");
		// rootLogger.attachHandles("myHandle");
		
		//Create Ancestor Tree
		let myGrandParent = Loggerize.createLogger("myGrandParent");
		myGrandParent.setLevel("warn");
		myGrandParent.attachHandles("myHandle");
		myGrandParent.detachHandles("default");
		
		let myParent = Loggerize.createLogger("myGrandParent.myParent");
		myParent.setLevel("info");
		myParent.attachHandles("myHandle");
		myParent.detachHandles("default");
		
		let myChild = Loggerize.createLogger("myGrandParent.myParent.myChild");
		myChild.setLevel("debug");
		myChild.attachHandles("myHandle");
		myChild.detachHandles("default");
		
		//Log and send up ancestor tree
		myChild.log("warn", "Log Message Test!");
		
		Loggerize.shutdown();
	});
	
	it("#log() should output log message from every ancestor but ignore non-existent parents when logging at most severe level across ancestor tree", function(){
		
		var outputs = [];
		Loggerize.on("logged", function(logRecord){
			outputs.push(logRecord["output"]);
		});
		
		Loggerize.on("finished", function(){
			let actual = outputs;
			let expected = [
				'warn Log Message Test! | myGrandParent.myParent.myChild',
				//'warn Log Message Test! | myGrandParent.myParent',
				'warn Log Message Test! | myGrandParent',
			];
			assert.deepEqual(actual, expected);
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"target": null,
			"formatter": {
				"name": "ancestorFmt",
				"format": "%{level} %{message} | %{loggerName}"
			}
		});
		
		// let rootLogger = Loggerize.getRootLogger();
		// rootLogger.setLevel("silly");
		// rootLogger.attachHandles("myHandle");
		
		//Create Ancestor Tree
		let myGrandParent = Loggerize.createLogger("myGrandParent");
		myGrandParent.setLevel("warn");
		myGrandParent.attachHandles("myHandle");
		myGrandParent.detachHandles("default");
		
		// let myParent = Loggerize.createLogger("myGrandParent.myParent");
		// myParent.setLevel("info");
		// myParent.attachHandles("myHandle");
		// myParent.detachHandles("default");
		
		let myChild = Loggerize.createLogger("myGrandParent.myParent.myChild");
		myChild.setLevel("debug");
		myChild.attachHandles("myHandle");
		myChild.detachHandles("default");
		
		//Log and send up ancestor tree
		myChild.log("warn", "Log Message Test!");
		
		Loggerize.shutdown();
	});
	
	it("#log() should output log message from every ancestor including root logger when logging at most severe level across ancestor tree", function(){
		
		var outputs = [];
		Loggerize.on("logged", function(logRecord){
			outputs.push(logRecord["output"]);
		});
		
		Loggerize.on("finished", function(){
			let actual = outputs;
			let expected = [
				'warn Log Message Test! | myGrandParent.myParent.myChild',
				'warn Log Message Test! | myGrandParent.myParent',
				'warn Log Message Test! | myGrandParent',
				"warn Log Message Test! | root",
			];
			assert.deepEqual(actual, expected);
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"target": null,
			"formatter": {
				"name": "ancestorFmt",
				"format": "%{level} %{message} | %{loggerName}"
			}
		});
		
		let rootLogger = Loggerize.getRootLogger();
		rootLogger.setLevel("silly");
		rootLogger.attachHandles("myHandle");
		
		//Create Ancestor Tree
		let myGrandParent = Loggerize.createLogger("myGrandParent");
		myGrandParent.setLevel("warn");
		myGrandParent.attachHandles("myHandle");
		myGrandParent.detachHandles("default");
		
		let myParent = Loggerize.createLogger("myGrandParent.myParent");
		myParent.setLevel("info");
		myParent.attachHandles("myHandle");
		myParent.detachHandles("default");
		
		let myChild = Loggerize.createLogger("myGrandParent.myParent.myChild");
		myChild.setLevel("debug");
		myChild.attachHandles("myHandle");
		myChild.detachHandles("default");
		
		//Log and send up ancestor tree
		myChild.log("warn", "Log Message Test!");
		
		Loggerize.shutdown();
	});
	
	it("#log() should output log message only from ancestors with a equal/lower log level than designated", function(){
		
		var outputs = [];
		Loggerize.on("logged", function(logRecord){
			outputs.push(logRecord["output"]);
		});
		
		Loggerize.on("finished", function(){
			let actual = outputs;
			let expected = [ 
				'debug Log Message Test! | myGrandParent.myParent.myChild',
				'debug Log Message Test! | root'
			];
			assert.deepEqual(actual, expected);
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"target": null,
			"formatter": {
				"name": "ancestorFmt",
				"format": "%{level} %{message} | %{loggerName}"
			}
		});
		
		//Get root logger
		let rootLogger = Loggerize.getRootLogger();
		rootLogger.setLevel("silly");
		rootLogger.attachHandles("myHandle");
		
		//Create Ancestor Tree
		let myGrandParent = Loggerize.createLogger("myGrandParent");
		myGrandParent.setLevel("warn");
		myGrandParent.attachHandles("myHandle");
		myGrandParent.detachHandles("default");
		
		let myParent = Loggerize.createLogger("myGrandParent.myParent");
		myParent.setLevel("info");
		myParent.attachHandles("myHandle");
		myParent.detachHandles("default");
		
		let myChild = Loggerize.createLogger("myGrandParent.myParent.myChild");
		myChild.setLevel("debug");
		myChild.attachHandles("myHandle");
		myChild.detachHandles("default");
		
		//Log and send up ancestor tree
		myChild.log("debug", "Log Message Test!");
		
		Loggerize.shutdown();
	});
	
	it("#log() should log message from loggers up ancestor tree that have matching level mappers and equal/lower severity", function(){
		
		var outputs = [];
		Loggerize.on("logged", function(logRecord){
			outputs.push(logRecord["output"]);
		});
		
		Loggerize.on("finished", function(){
			let actual = outputs;
			let expected = [ 
				'debug Log Message Test! | myGrandParent.myParent.myChild',
				'debug Log Message Test! | root'
			];
			assert.deepEqual(actual, expected);
		});
		
		Loggerize.addHandle([{
			"emitEvents": true,
			"name": "myHandle",
			"target": null,
			"formatter": {
				"name": "ancestorFmt",
				"format": "%{level} %{message} | %{loggerName}"
			}
		},{
			"emitEvents": true,
			"name": "myHandle2",
			"levelMapper": "defcon",
			"target": null,
			"formatter": {
				"name": "ancestorFmt",
				"format": "%{level} %{message} | %{loggerName}"
			}
		}]);
		
		//Get root logger
		let rootLogger = Loggerize.getRootLogger();
		rootLogger.setLevel("silly");
		rootLogger.attachHandles("myHandle");
		
		//Create Ancestor Tree
		let myGrandParent = Loggerize.createLogger("myGrandParent");
		myGrandParent.setLevel("warn");
		myGrandParent.attachHandles("myHandle");
		myGrandParent.detachHandles("default");
		
		let myParent = Loggerize.createLogger("myGrandParent.myParent");
		myParent.setLevelMapper("defcon");
		myParent.setLevel("defcon5");
		myParent.attachHandles("myHandle2");
		myParent.detachHandles("default");
		
		let myChild = Loggerize.createLogger("myGrandParent.myParent.myChild");
		myChild.setLevel("debug");
		myChild.attachHandles("myHandle");
		myChild.detachHandles("default");
		
		//Log and send up ancestor tree
		myChild.log("debug", "Log Message Test!");
		
		Loggerize.shutdown();
	});
	
	it("#log() should log via ancestors up tree but skip the logger that has filter attached", function(){
		
		var outputs = [];
		Loggerize.on("logged", function(logRecord){
			outputs.push(logRecord["output"]);
		});
		
		Loggerize.on("finished", function(){
			let actual = outputs;
			let expected = [
				'warn Log Message Test! | myGrandParent.myParent.myChild',
				// 'warn Log Message Test! | myGrandParent.myParent',
				'warn Log Message Test! | myGrandParent',
			];
			assert.deepEqual(actual, expected);
		});
		
		Loggerize.addHandle([{
			"emitEvents": true,
			"name": "myHandle",
			"target": null,
			"formatter": {
				"name": "ancestorFmt",
				"format": "%{level} %{message} | %{loggerName}"
			}
		}]);
		
		//Create Ancestor Tree
		let myGrandParent = Loggerize.createLogger("myGrandParent");
		myGrandParent.setLevel("warn");
		myGrandParent.attachHandles("myHandle");
		myGrandParent.detachHandles("default");
		
		let myParent = Loggerize.createLogger("myGrandParent.myParent");
		myParent.setLevel("info");
		myParent.attachFilter("regex", {"pattern": /.*myParent.*/, "onMatch": "deny"});
		myParent.attachHandles("myHandle");
		myParent.detachHandles("default");
		
		let myChild = Loggerize.createLogger("myGrandParent.myParent.myChild");
		myChild.setLevel("debug");
		myChild.attachHandles("myHandle");
		myChild.detachHandles("default");
		
		//Log and send up ancestor tree
		myChild.log("warn", "Log Message Test!");
		
		Loggerize.shutdown();
	});
	
	it("#log() should log via ancestors up tree but skip the the two loggers that have filters attached", function(){
		
		var outputs = [];
		Loggerize.on("logged", function(logRecord){
			outputs.push(logRecord["output"]);
		});
		
		Loggerize.on("finished", function(){
			let actual = outputs;
			let expected = [
				'warn Log Message Test! | myGrandParent.myParent.myChild',
				// 'warn Log Message Test! | myGrandParent.myParent',
				// 'warn Log Message Test! | myGrandParent',
			];
			assert.deepEqual(actual, expected);
		});
		
		Loggerize.addHandle([{
			"emitEvents": true,
			"name": "myHandle",
			"target": null,
			"formatter": {
				"name": "ancestorFmt",
				"format": "%{level} %{message} | %{loggerName}"
			}
		}]);
		
		//Create Ancestor Tree
		let myGrandParent = Loggerize.createLogger("myGrandParent");
		myGrandParent.setLevel("warn");
		myGrandParent.attachFilter("regex", {"pattern": /.*myParent.*/, "onMatch": "deny"});
		myGrandParent.attachHandles("myHandle");
		myGrandParent.detachHandles("default");
		
		let myParent = Loggerize.createLogger("myGrandParent.myParent");
		myParent.setLevel("info");
		myParent.attachFilter("regex", {"pattern": /.*myParent.*/, "onMatch": "deny"});
		myParent.attachHandles("myHandle");
		myParent.detachHandles("default");
		
		let myChild = Loggerize.createLogger("myGrandParent.myParent.myChild");
		myChild.setLevel("debug");
		myChild.attachHandles("myHandle");
		myChild.detachHandles("default");
		
		//Log and send up ancestor tree
		myChild.log("warn", "Log Message Test!");
		
		Loggerize.shutdown();
	});
	
	it("#log() should log multiple times when ancestor has multiple handless ", function(){
		
		var outputs = [];
		Loggerize.on("logged", function(logRecord){
			outputs.push(logRecord["output"]);
		});
		
		Loggerize.on("finished", function(){
			let actual = outputs;
			let expected = [ 
				'warn Log Message Test! | myGrandParent.myParent.myChild',
				'warn Log Message Test! | myGrandParent.myParent',
				'warn Log Message Test! | myGrandParent',
				"warn Log Message Test! | myGrandParent's second handle"
			];
			assert.deepEqual(actual, expected);
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"target": null,
			"formatter": {
				"name": "ancestorFmt",
				"format": "%{level} %{message} | %{loggerName}"
			}
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle2",
			"target": null,
			"formatter": {
				"name": "ancestorFmt2",
				"format": "%{level} %{message} | %{loggerName}'s second handle"
			}
		});
		
		
		//Create Ancestor Tree
		let myGrandParent = Loggerize.createLogger("myGrandParent");
		myGrandParent.setLevel("warn");
		myGrandParent.attachHandles("myHandle");
		myGrandParent.attachHandles("myHandle2");
		myGrandParent.detachHandles("default");
		
		let myParent = Loggerize.createLogger("myGrandParent.myParent");
		myParent.setLevel("info");
		myParent.attachHandles("myHandle");
		myParent.detachHandles("default");
		
		let myChild = Loggerize.createLogger("myGrandParent.myParent.myChild");
		myChild.setLevel("debug");
		myChild.attachHandles("myHandle");
		myChild.detachHandles("default");
		
		//Log and send up ancestor tree
		myChild.log("warn", "Log Message Test!");
		
		Loggerize.shutdown();
	});
	
	it("#log() should not propogate logs when lowest child has propogate set to false", function(){
		
		var outputs = [];
		Loggerize.on("logged", function(logRecord){
			outputs.push(logRecord["output"]);
		});
		
		Loggerize.on("finished", function(){
			let actual = outputs;
			let expected = ["warn Log Message Test! | myGrandParent.myParent.myChild"];
			assert.deepEqual(actual, expected);
		});
		
		Loggerize.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"target": null,
			"formatter": {
				"name": "ancestorFmt",
				"format": "%{level} %{message} | %{loggerName}"
			}
		});
		
		
		//Create Ancestor Tree
		let myGrandParent = Loggerize.createLogger("myGrandParent");
		myGrandParent.setLevel("warn");
		myGrandParent.attachHandles("myHandle");
		myGrandParent.detachHandles("default");
		
		let myParent = Loggerize.createLogger("myGrandParent.myParent");
		myParent.setLevel("info");
		myParent.attachHandles("myHandle");
		myParent.detachHandles("default");
		
		let myChild = Loggerize.createLogger("myGrandParent.myParent.myChild");
		myChild.setLevel("debug");
		myChild.attachHandles("myHandle");
		myChild.detachHandles("default");
		myChild.propogate = false;
		
		//Log and send up ancestor tree
		myChild.log("warn", "Log Message Test!");
		
		Loggerize.shutdown();
	});
	
	//Log using quick log interface
	it("#silly() should log message at silly level when passed a message string under the npm level mapper", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "silly Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "npm",
			"level": "silly",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("npm");
		logger.attachHandles("myHandle");
		logger.silly("Log Message Test!");
		
	});
	
	it("#debug() should log and string interpolate message at debug level under the npm level mapper when passed two message strings", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "debug Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "npm",
			"level": "debug",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("npm");
		logger.attachHandles("myHandle");
		logger.debug("Log %s Test!", "Message");
		
	});
	
	it("#verbose() should log and string interpolate message at verbose level under the npm level mapper when passed a string and a number", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "verbose 103rd Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "npm",
			"level": "verbose",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("npm");
		logger.attachHandles("myHandle");
		logger.verbose("%drd Log Message Test!", 103);
		
	});
	
	it("#info() should log and string interpolate message at info level under the npm level mapper when passed three strings", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "info Log Message Test. Success!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "npm",
			"level": "info",
			"emitEvents": true,
			"target": null
		});
		
		logger.setLevelMapper("npm");
		logger.attachHandles("myHandle");
		logger.info("Log Message %s. %s!", "Test", "Success");
		
	});
	
	it("#warn() should log and string interpolate/merge message at warn level under the npm level mapper when passed four strings", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "warn Log Message Test. Success! Finished";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "npm",
			"level": "warn",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("npm");
		logger.attachHandles("myHandle");
		logger.warn("Log Message %s. %s!", "Test", "Success", "Finished");
		
	});
	
	it("#error() should log message at error level under the npm level mapper when passed single object", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "error Basic error object log test";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "npm",
			"level": "error",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("npm");
		logger.attachHandles("myHandle");
		logger.error(new TypeError("Basic error object log test"));
		
	});
	
	
	it("#notice() should log message at notice level when passed a message string under the syslog level mapper", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "notice Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "syslog",
			"level": "notice",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("syslog");
		logger.attachHandles("myHandle");
		logger.notice("Log Message Test!");
		
	});
	
	it("#warning() should log message at warning level when passed a message string under the syslog level mapper", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "warning Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "syslog",
			"level": "warning",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("syslog");
		logger.attachHandles("myHandle");
		logger.warning("Log Message Test!");
		
	});
	
	it("#err() should log message at err level when passed a message string under the syslog level mapper", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "err Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "syslog",
			"level": "err",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("syslog");
		logger.attachHandles("myHandle");
		logger.err("Log Message Test!");
		
	});
	
	it("#crit() should log message at crit level when passed a message string under the syslog level mapper", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "crit Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "syslog",
			"level": "crit",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("syslog");
		logger.attachHandles("myHandle");
		logger.crit("Log Message Test!");
		
	});
	
	it("#alert() should log message at alert level when passed a message string under the syslog level mapper", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "alert Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "syslog",
			"level": "alert",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("syslog");
		logger.attachHandles("myHandle");
		logger.alert("Log Message Test!");
		
	});
	
	it("#emerg() should log message at emerg level when passed a message string under the syslog level mapper", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "emerg Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "syslog",
			"level": "emerg",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("syslog");
		logger.attachHandles("myHandle");
		logger.emerg("Log Message Test!");
		
	});
	
	
	it("#critical() should log message at critical level when passed a message string under the python level mapper", function(){
		
		let logger = Loggerize.getLogger("myLogger");
		Loggerize.on("logged", function(logRecord){
			let actual = logRecord["output"];
			let expected = "critical Log Message Test!";
			assert.equal(actual, expected);
		});
		
		Loggerize.addHandle({
			"name": "myHandle",
			"formatter": "default",
			"levelMapper": "python",
			"level": "critical",
			"emitEvents": true,
			"target": null,
		});
		
		logger.setLevelMapper("python");
		logger.attachHandles("myHandle");
		logger.critical("Log Message Test!");
		
	});
	
	
});