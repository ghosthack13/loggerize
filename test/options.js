"use strict";

var assert = require('assert');
var path = require("path");

describe("Set Handle Options", function() {
	
	/** Because Loggerize proxies request to a singleton that maintaines state,
		it is require to purge cache on each test to ensure settings brought forward
		from previous test
	*/
	let subject;
	beforeEach(function() {
		delete require.cache[require.resolve('../lib/index.js')];
		delete require.cache[require.resolve('../lib/logger.js')];
		delete require.cache[require.resolve('../lib/loggerproxy.js')];
		subject = require('../lib/logger.js'); //Singleton Logger Instance
		//Loggerize = require('../lib/index.js');
	});
	
	
	it("#setHandleOpts - No handles options changed when empty object given", function() {
		
		subject.addHandle({
			"name": "myHandle"
		});
		
		subject.setHandleOpts.call(subject, {});
		
		let actual = subject.handles["myHandle"];
		let expected = {
			active: true,
			levelMapper: subject.levelMapper,
			level: subject.level,
			"emitEvents": false,
			target: 'console',
			formatter: 'default'
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleOpts - should change specified handle options when handle named specified in 2nd parameter", function() {
		
		subject.addHandle({"name": "myHandle"});
		subject.setHandleOpts({
			"target": "file", 
			"directory": process.cwd(),
			"fileName": "test.logy",
		}, "myHandle");
		
		let actual = subject.handles["myHandle"];
		let expected =  { 
			active: true,
			levelMapper: subject.levelMapper,
			level: subject.level,
			target: 'file',
			formatter: 'default',
			emitEvents: false,
			directory: process.cwd() + path.sep,
			fileName: 'test',
			fileExtension: '.logy'
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleOpts - Should alter handle options when named passed inside handle's options", function() {
		
		subject.addHandle({
			"name": "myHandle"
		});
		
		subject.setHandleOpts({
			"name": "myHandle", 
			"target": "file", 
			"directory": process.cwd(),
			"fileName": "test.logy",
		});
		
		let actual = subject.handles["myHandle"];
		let expected =  { 
			active: true,
			levelMapper: subject.levelMapper,
			level: subject.level,
			target: 'file',
			formatter: 'default',
			emitEvents: false,
			directory: process.cwd() + path.sep,
			fileName: 'test',
			fileExtension: '.logy'
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it.skip("#setHandleOpts - Change anonymous' handle options (i.e. no other handles were added)", function() {
		
		subject.setHandleOpts({
			"target": "file", 
			"directory": process.cwd(),
			"fileName": "test.logy",
		});
		// console.log(subject.handles);
		let actual = subject.handles;
		let expected =  { 
			"default": {
				active: false,
				levelMapper: subject.levelMapper,
				level: subject.level,
				target: 'console',
				formatter: 'default'
			},
			"anonymous": {
				target: 'file',
				directory: process.cwd() + path.sep,
				fileName: 'test',
				active: true,
				levelMapper: subject.levelMapper,
				level: subject.level,
				formatter: 'default',
				fileExtension: '.logy'
			} 
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleOpts - Should change multiple handle' options when given array of handle names", function() {
		
		subject.addHandle([
			{"name": "myHandle1"},
			{"name": "myHandle2"},
			{"name": "myHandle3"},
		]);
		
		subject.setHandleOpts({
			"target": "file", 
			"directory": process.cwd(),
			"fileName": "test.logy",
		}, ["myHandle1", "myHandle2"]);
		
		let expected1 = {
			active: true,
			levelMapper: subject.levelMapper,
			level: subject.level,
			target: 'file',
			formatter: 'default',
			emitEvents: false,
			directory: process.cwd() + path.sep,
			fileName: 'test',
			fileExtension: '.logy'
		};
		let expected2 = {
			active: true,
			levelMapper: subject.levelMapper,
			level: subject.level,
			target: 'file',
			formatter: 'default',
			emitEvents: false,
			directory: process.cwd() + path.sep,
			fileName: 'test',
			fileExtension: '.logy' 
		};
		
		assert.deepEqual(subject.handles["myHandle1"], expected1);
		assert.deepEqual(subject.handles["myHandle2"], expected2);
		
	});
	
	it("#setHandleOpts - Should throw error when handle options to change is ambiguous)", function() {
		
		subject.addHandle([
			{"name": "myHandle1"},
			{"name": "myHandle2"}
		]);
		
		let opts = ({
			"target": "file", 
			"directory": process.cwd(),
			"fileName": "test.logy",
		});
		
		let actual = subject.setHandleOpts.bind(subject, opts);
		let expected = new Error('Desired handle to change is ambiguous. Specify the handle(s) to change in the second argument');
		assert.throws(actual, expected);
	});
	
	
});

describe.skip("Set Formatter Options", function() {
	
	/** Because Loggerize proxies request to a singleton that maintaines state,
		it is require to purge cache on each test to ensure settings brought forward
		from previous test
	*/
	
	let subject;
	beforeEach(function() {
		delete require.cache[require.resolve('../lib/index.js')];
		delete require.cache[require.resolve('../lib/logger.js')];
		delete require.cache[require.resolve('../lib/loggerproxy.js')];
		subject = require('../lib/logger.js'); //Singleton Logger Instance
	});
	
	
	it("#setFormatterOpts - should do nothing when empty object given", function() {
		
		subject.addFormatter({
			"name": "myFormatter",
			"format": "%{timestamp} %{level} %{message}",
		});
		
		let origFormatters = JSON.parse(JSON.stringify(subject.formatters));
		subject.setFormatterOpts({}, "myFormatter");
		
		let actual = subject.formatters;
		let expected = origFormatters;
		assert.deepEqual(actual, expected);
	});
	
	it("#setFormatterOpts - should add a timestamp token mutator to the named formatter when named passed as 2nd argument", function() {
		
		subject.addFormatter({
			"name": "myFormatter",
			"format": "%{timestamp} %{level} %{message}",
		});
		
		subject.setFormatterOpts({
			"timestamp": {"pattern": "%Y-%b"}
		}, "myFormatter");
		
		let actual = subject.formatters["myFormatter"];
		let expected = { 
			"format": '%{timestamp} %{level} %{message}',
			"timestamp": { pattern: '%Y-%b' } 
		};
		assert.deepEqual(actual, expected);
	});
	
	it("#setFormatterOpts - Should alter formatter options when named passed inside formatter's options", function() {
		
		subject.addFormatter({
			"name": "myFormatter",
			"format": "%{timestamp} %{level} %{message}",
		});
		
		subject.setFormatterOpts({
			"name": "myFormatter", 
			"timestamp": {"pattern": "%Y-%b"}
		});
		
		let actual = subject.formatters["myFormatter"];
		let expected = { 
			"format": '%{timestamp} %{level} %{message}',
			"timestamp": { pattern: '%Y-%b' } 
		};
		assert.deepEqual(actual, expected);
	});
	
	it("#setFormatterOpts - Should change multiple formatters' options when given array of formatter names", function() {
		
		subject.addFormatter([
			{"name": "myFormatter1"},
			{"name": "myFormatter2"},
			{"name": "myFormatter3"},
		]);
		
		subject.setFormatterOpts({
			"format": "%{timestamp} %{level} %{message}",
		}, ["myFormatter1", "myFormatter2"]);
		
		assert.deepEqual(subject.formatters["myFormatter1"], { format: '%{timestamp} %{level} %{message}' });
		assert.deepEqual(subject.formatters["myFormatter2"], { format: '%{timestamp} %{level} %{message}' });
	});
	
	it("#setFormatterOpts - Throw Error if formatter's name is undefined", function() {
		
		subject.addFormatter([
			{"name": "myFormatter1"},
			{"name": "myFormatter2"}
		]);
		
		let opts = ({
			"target": "file", 
			"directory": process.cwd(),
			"fileName": "test.logy",
		});
		
		let actual = subject.setFormatterOpts.bind(subject, opts);
		let expected = new Error('Please specify the name of the formatter you will like to set options on');
		assert.throws(actual, expected);
	});
	
});

describe("Validate Handle Options", function() {
	
	/** Because Loggerize proxies request to a singleton that maintaines state,
		it is require to purge cache on each test to ensure settings brought forward
		from previous test
	*/
	let subject;
	beforeEach(function() {
		delete require.cache[require.resolve('../lib/index.js')];
		delete require.cache[require.resolve('../lib/logger.js')];
		delete require.cache[require.resolve('../lib/loggerproxy.js')];
		subject = require('../lib/logger.js'); //Singleton Logger Instance
	});
	
	
	it("#validateHandleOpts - throws error when handle is not of type object", function(){
		let opts = 32;
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error('Handle must be of type object in the form --> {name: handleName, "handleProperty1": "value1", "handleProperty2": "value2"}');
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - throws error if handle doesn not have a 'name' option defined", function(){
		let opts = {};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("Handle must have a 'name' option defined");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - throws error if a trying to alter options of default handle", function(){
		let opts = {"name": "default", "target": "file"};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("Cannot alter properties of 'default' handler");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error on incorrect target spelling", function() {
		
		let opts = {
			"name": "myHandle", 
			"target": 'rotatingFile',
			"maxsize": "123456789",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = Error;
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if handle name is not of type 'string'", function() {
		
		let opts = {
			"name": {"handleName": "myHandle"}
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = Error;
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if 'active' option is not of type 'Boolean' or type 'Number'", function() {
		
		let opts = {
			"name": "myHandle",
			"active": "truth",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new TypeError("Expected 'active' option to be of type 'Boolean' or type 'Number'");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if 'level' option is not a valid npm level", function(){
		
		let opts = {
			"name": "myHandle",
			"level": "errors",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new TypeError("'errors' is not a valid log level.\nUse a custom or predefined level mapping value.");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if selected formatter is not defined", function(){
		
		let opts = {
			"name": "myHandle",
			"formatter": "myFormatter",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("Formatter '" + opts["formatter"] + "' is not defined");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if on the fly formatter is not object", function(){
		
		let opts = {
			"name": "myHandle",
			"formatter": 21,
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("Formatter must be a named formatter of type 'string' or defined on the fly via an 'object' definition.");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if path is not of type 'string'", function(){
		
		let opts = {
			"name": "myHandle",
			"path": [],
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new TypeError("Expected path option to be of type 'string'");
		assert.throws(actual, expected);
	});
	
	it.skip("#validateHandleOpts - Throw Error if designated user does not have permission to alter designated path", function(){
		
		let opts = {
			"name": "myHandle",
			"path": "./logs",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = Error;
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if fileNamePattern contains spaces", function(){
		
		let opts = {
			"name": "myHandle",
			"target": "rotatingFile",
			"rotationType": "interval",
			"fileNamePattern": "%{fileName}-%Y-%b% {fileExtension}",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("The option 'fileNamePattern' cannot contain spaces/blanks");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if fileExtension is not of type string", function(){
		
		let opts = {
			"name": "myHandle",
			"target": "rotatingFile",
			"rotationType": "interval",
			"fileExtension": .123,
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new TypeError("fileExtension must be of type 'string'");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if target is invalid", function(){
		
		let opts = {
			"name": "myHandle",
			"target": "rotatingFiles",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("'rotatingFiles' is not a valid target");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if rotationType is invalid", function(){
		
		let opts = {
			"name": "myHandle",
			"target": "rotatingFile",
			"rotationType": "periodic",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("Invalid rotation type: 'periodic'");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if interval is invalid", function(){
		
		let opts = {
			"name": "myHandle",
			"target": "rotatingFile",
			"rotationType": "interval",
			"interval": "daily",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("Invalid rotation interval: '" + opts["interval"] + "'");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if rotateDay is invalid", function(){
		
		let opts = {
			"name": "myHandle",
			"target": "rotatingFile",
			"rotationType": "interval",
			"interval": "week",
			"rotateDay": "Tues" // 'Tue' is valid
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("Invalid rotation day: '" + opts["rotateDay"] + "'");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if protocol is http when allowInsecure is not true", function(){
		
		let opts = {
			"name": "myHandle",
			"target": "http",
			"url": "http://example.com/",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("Designated URL is not an HTTPS resource. Use the option 'allowInsecure' to permit unencrypted HTTP requests");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Does not Throw Error when valid filter added", function(){
		
		let opts = {
			"name": "myHandle",
			"target": "http",
			"url": "http://example.com/",
			"allowInsecure": true,
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		assert.doesNotThrow(actual);
	});
	
	it("#validateHandleOpts - Throw Error if filter object is invalid", function(){
		
		let opts = {
			"name": "myHandle",
			"target": "console",
			"filter": {"fakeFilter": {"dummyOpts": "dummyVal"}},
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("The filter 'fakeFilter' has not been defined!");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Throw Error if filter is not defined", function(){
		
		let opts = {
			"name": "myHandle",
			"target": "console",
			"filter": "someRandomFilter",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		let expected = new Error("The filter '" + opts["filter"] + "' has not been defined!");
		assert.throws(actual, expected);
	});
	
	it("#validateHandleOpts - Does not Throw Error when valid filter added", function(){
		
		
		subject.addFilter({
			"name": "myFilter",
			"filter": function(logRecord){ // eslint-disable-line no-unused-vars
				return false;
			}
		});
		
		let opts = {
			"name": "myHandle",
			"target": "console",
			"filter": "myFilter",
		};
		
		let actual = subject.validateHandleOpts.bind(subject, opts);
		assert.doesNotThrow(actual);
	});
	
});

describe("Validate Formatter Options", function() {
	
	/** Because Loggerize proxies request to a singleton that maintaines state,
		it is require to purge cache on each test to ensure settings brought forward
		from previous test
	*/
	let subject;
	beforeEach(function() {
		delete require.cache[require.resolve('../lib/index.js')];
		delete require.cache[require.resolve('../lib/logger.js')];
		delete require.cache[require.resolve('../lib/loggerproxy.js')];
		subject = require('../lib/logger.js'); //Singleton Logger Instance
	});
	
	
	it("#validateFormatterOpts - should throw error when formatter is not of type object", function(){
		
		let opts = 32;
		
		let actual = subject.validateFormatterOpts.bind(subject, opts);
		let expected = new Error('formatter must be of type object in the form --> {name: formatterName, "formatterProperty1": "value1", "formatterProperty2": "value2"}');
		assert.throws(actual, expected);
	});
	
	it("#validateFormatterOpts - should throw error if formatter doesn not have a 'name' option defined", function(){
		let opts = {};
		
		let actual = subject.validateFormatterOpts.bind(subject, opts);
		let expected = new Error("The formatter must have a 'name' option defined");
		assert.throws(actual, expected);
	});
	
	it("#validateFormatterOpts - should throw error if formatter's name is not of type string", function(){
		let opts = {"name": 32};
		
		let actual = subject.validateFormatterOpts.bind(subject, opts);
		let expected = new TypeError("formatter name must be of type 'string'");
		assert.throws(actual, expected);
	});
	
	it("#validateFormatterOpts - should throw error if a trying to alter options of default formatter", function(){
		let opts = {"name": "default", "format": "%{message}"};
		
		let actual = subject.validateFormatterOpts.bind(subject, opts);
		let expected = new Error('The default formatter is internally defined and CANNOT be altered');
		assert.throws(actual, expected);
	});
	
	it("#validateFormatterOpts - should throw error if format field is not of type string", function(){
		let opts = {"name": "myFormatter", "format": {}};
		
		let actual = subject.validateFormatterOpts.bind(subject, opts);
		let expected = new TypeError("Format must be of type 'string'");
		assert.throws(actual, expected);
	});
	
	it("#validateFormatterOpts - should throw error if json field is not of type boolean", function(){
		let opts = {"name": "myFormatter", "json": 1};
		
		let actual = subject.validateFormatterOpts.bind(subject, opts);
		let expected = new TypeError("The json property strictly accepts boolean values");
		assert.throws(actual, expected);
	});
	
	it("#validateFormatterOpts - should throw error if fields property is not of type string[]", function(){
		let opts = {"name": "myFormatter", "json": true, "fields": "message"};
		
		let actual = subject.validateFormatterOpts.bind(subject, opts);
		let expected = new TypeError("The fields property must be of type 'string[]'");
		assert.throws(actual, expected);
	});
	
	it("#validateFormatterOpts - should NOT throw error if json field is string of value 'true'", function(){
		let opts = {"name": "myFormatter", "json": "true"};
		
		let actual = subject.validateFormatterOpts.bind(subject, opts);
		assert.doesNotThrow(actual);
	});
	
	it("#validateFormatterOpts - should NOT throw error if json field is string of value 'false'", function(){
		let opts = {"name": "myFormatter", "json": "false"};
		
		let actual = subject.validateFormatterOpts.bind(subject, opts);
		assert.doesNotThrow(actual);
	});
	
	it("#validateFormatterOpts - should throw error if transformer is neither function nor string", function(){
		let opts = {"name": "myFormatter", "transformer": true, "format": "%{timestamp} %{message}"};
		
		let actual = subject.validateFormatterOpts.bind(subject, opts);
		let expected = new TypeError(
			"Expected transformer to be of type 'function' or type 'string' or array of string types\n" + 
			"Instead received type: " + typeof(opts["transformer"])
		);
		assert.throws(actual, expected);
	});
	
	it("#validateFormatterOpts - should throw error if transformer is not defined", function(){
		
		let transformer = "myTransformer";
		let opts = {"name": "myFormatter", "transformer": transformer, "format": "%{timestamp} %{message}"};
		
		let actual = subject.validateFormatterOpts.bind(subject, opts);
		let expected = new Error("The transformer '" + transformer + "' has not been defined!");
		assert.throws(actual, expected);
	});
	
});

describe("Set Default Handle Options", function() {
	
	/** Because Loggerize proxies request to a singleton that maintaines state,
		it is require to purge cache on each test to ensure settings brought forward
		from previous test
	*/
	let subject;
	beforeEach(function() {
		delete require.cache[require.resolve('../lib/index.js')];
		delete require.cache[require.resolve('../lib/logger.js')];
		delete require.cache[require.resolve('../lib/loggerproxy.js')];
		subject = require('../lib/logger.js'); //Singleton Logger Instance
	});
	
	var DEFAULT_USER_AGENT = "loggerize" + path.sep + require(path.join(__dirname, "..", "package.json")).version;
	assert(
		/loggerize[\\/]+?\d+\.\d+\.\d+/.test(DEFAULT_USER_AGENT), 
		"Invalid version number, thus cannot set User-Agent"
	);
	
	var logDir =  path.join(process.cwd(), "logs" + path.sep);
	
	it("#setHandleDefaults - Empty opts object given", function() {
		
		let opts = {};			
		subject.setHandleDefaults(opts);
		
		let actual = opts;
		let expected = {
			active: true,
			levelMapper: subject.levelMapper,
			level: subject.level,
			target: 'console',
			emitEvents: false,
			formatter: 'default',
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleDefaults - should set default directory, fileName and extension when 'file' target is set", function() {
		
		let opts = {"name": "myHandle", "target": 'file'};			
		subject.setHandleDefaults(opts);
		
		let actual = opts;
		let expected = {
			"active": true,
			"levelMapper": subject.levelMapper,
			"level": subject.level,
			"name": "myHandle",
			emitEvents: false,
			"target": 'file',
			"formatter": 'default',
			"directory": logDir,
			"fileName": 'options',
			"fileExtension": '.log',
		};
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleDefaults - should default to 'file' target when 'path' is defined", function() {
		
		let opts = {
			"name": "myHandle", 
			"path": path.join(__dirname, "logs", "testfile.logy"),
		};			
		subject.setHandleDefaults(opts);
		
		let actual = opts;
		let expected = {
			"active": true,
			levelMapper: subject.levelMapper,
			level: subject.level,
			emitEvents: false,
			"name": "myHandle",
			"target": 'file',
			"formatter": 'default',
			"path": path.join(__dirname, "logs", "testfile.logy"),
			"directory": path.join(__dirname, "logs") + path.sep,
			"fileName": 'testfile',
			"fileExtension": '.logy',
		};
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleDefaults - should default to interval when 'rotatingFile' is set without a 'rotationType'", function() {
		
		let opts = {
			"name": "myHandle", 
			"target": 'rotatingFile',
		};			
		subject.setHandleDefaults(opts);
		
		let actual = opts;
		let expected = {
			"active": true,
			levelMapper: subject.levelMapper,
			level: subject.level,
			emitEvents: false,
			"name": "myHandle",
			"target": 'rotatingFile',
			"formatter": 'default',
			
			"rotationType": "interval",
			"interval": 'day',
			
			"directory": logDir,
			"fileName": 'options',
			"fileExtension": '.log',
		};
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleDefaults - should default to a rotateDay of 'sunday' when rotating on week interval", function() {
		
		let opts = {
			"name": "myHandle", 
			"target": 'rotatingFile',
			"interval": 'week',
		};			
		subject.setHandleDefaults(opts);
		
		let actual = opts;
		let expected = {
			"active": true,
			levelMapper: subject.levelMapper,
			level: subject.level,
			"name": "myHandle",
			"target": 'rotatingFile',
			"formatter": 'default',
			"emitEvents": false,
			"rotationType": "interval",
			"interval": 'week',
			"rotateDay": "sunday",
			
			"directory": logDir,
			"fileName": 'options',
			"fileExtension": '.log',
		};
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleDefaults - should default maxFiles to Infinity when rotating file by size", function() {
		
		let opts = {
			"name": "myHandle", 
			"target": 'rotatingFile',
			"maxSize": 123456789,
		};			
		subject.setHandleDefaults(opts);
		
		let actual = opts;
		let expected = {
			"active": true,
			levelMapper: subject.levelMapper,
			level: subject.level,
			"name": "myHandle",
			"target": 'rotatingFile',
			"formatter": 'default',
			"emitEvents": false,
			"maxFiles": Number.POSITIVE_INFINITY,
			"maxSize": 123456789,
			"rotationType": "size",
			
			"directory": logDir,
			"fileName": 'options',
			"fileExtension": '.log',
		};
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleDefaults - should default method to get and port to 80 when given a url under the http target", function() {
		
		let opts = {
			"name": "myHandle", 
			"target": 'http',
			"url": "http://example.com/test?apikey=1234567890",
		};
		
		subject.setHandleDefaults(opts);
		
		let actual = opts;
		let expected = {
			"active": true,
			"levelMapper": subject.levelMapper,
			"level": subject.level,
			"name": "myHandle",
			"target": 'http',
			"formatter": 'default',
			"emitEvents": false,
			"keepAlive": true,
			"path": "/test?apikey=1234567890",
			"method": "POST",
			"host": "example.com",
			"port": 80,
			"headers": {"User-Agent": DEFAULT_USER_AGENT},
			"allowInsecure": false,
			"url": "http://example.com/test?apikey=1234567890",
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleDefaults - should overide port defined in URL when port defined on handle", function() {
		
		let opts = {
			"name": "myHandle", 
			"target": 'http',
			"url": "http://example.com:80/test?apikey=1234567890",
			"port": 3000,
			"allowInsecure": true,
		};
		
		subject.setHandleDefaults(opts);
		
		let actual = opts;
		let expected = {
			"active": true,
			"levelMapper": subject.levelMapper,
			"level": subject.level,
			"name": "myHandle",
			"target": 'http',
			"formatter": 'default',
			"emitEvents": false,
			"keepAlive": true,
			"path": "/test?apikey=1234567890",
			"method": "POST",
			"host": "example.com",
			"port": 3000,
			"headers": {"User-Agent": DEFAULT_USER_AGENT},
			
			"allowInsecure": true,
			"url": "http://example.com:80/test?apikey=1234567890",
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleDefaults - should overide default user agent when header with user agent defined on handle", function() {
		
		let opts = {
			"name": "myHandle", 
			"target": 'http',
			"url": "http://example.com:80/test?apikey=1234567890",
			"port": 3000,
			"headers": {"User-Agent": "myAgent"},
			"allowInsecure": true,
		};
		
		subject.setHandleDefaults(opts);
		
		let actual = opts;
		let expected = {
			"active": true,
			"levelMapper": subject.levelMapper,
			"level": subject.level,
			"name": "myHandle",
			"target": 'http',
			"formatter": 'default',
			"emitEvents": false,
			"keepAlive": true,
			"path": "/test?apikey=1234567890",
			"method": "POST",
			"host": "example.com",
			"port": 3000,
			"headers": {"User-Agent": "myAgent"},
			
			"allowInsecure": true,
			"url": "http://example.com:80/test?apikey=1234567890",
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleDefaults - should deduce port from protocol when no port is given", function() {
		
		let opts = {
			"name": "myHandle", 
			"target": 'http',
			"url": "https://example.com/test?apikey=1234567890",
			"headers": {"User-Agent": "myAgent"}
		};
		
		subject.setHandleDefaults(opts);
		
		let actual = opts;
		let expected = {
			"active": true,
			"levelMapper": subject.levelMapper,
			"level": subject.level,
			"name": "myHandle",
			"target": 'http',
			"formatter": 'default',
			"emitEvents": false,
			
			"keepAlive": true,
			"path": "/test?apikey=1234567890",
			"method": "POST",
			"host": "example.com",
			"port": 443,
			"headers": {"User-Agent": "myAgent"},
			
			"allowInsecure": false,
			"url": "https://example.com/test?apikey=1234567890",
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it("#setHandleDefaults - should throw error when rotationType is ambiguous", function() {
		
		let opts = {
			"name": "myHandle", 
			"target": 'rotatingFile',
			"interval": "day",
			"maxSize": "123456789",
		};
		
		let actual = subject.setHandleDefaults.bind(subject, opts);
		let expected = Error;
		
		assert.throws(actual, expected);
	});
	
});


