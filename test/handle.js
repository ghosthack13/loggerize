var assert = require('assert');
var path = require('path');

var http = require('http');
var https = require('https');

var parsers = require('../lib/options.js');
var Logger = require('../lib/logger.js');

describe("Manage Handles", function() {
	
	var predefinedHandles = ["default", "anonymous", "__exception__"];
  
	beforeEach(function(){
		delete require.cache[require.resolve('../lib/index.js')]
		delete require.cache[require.resolve('../lib/logger.js')]
		delete require.cache[require.resolve('../lib/loggerproxy.js')]
		Loggerize = require('../lib/index.js');
		subject = require('../lib/logger.js'); //Singleton Logger Instance
	});
	
	
	it("#deactivate - no params. All handles should be deactivated", function(){
		
		subject.addHandle([{"name": "myHandle1"}, {"name": "myHandle2"}, {"name": "myHandle3"}]);
		subject.deactivate(); //Deactivate all handles
		for (handleName in subject.handles){
			assert.strictEqual(subject.handles[handleName].active, false);
		}
		
	});
	
	it("#deactivate - array params. default and myHandle2 should be deactivated", function(){
		
		subject.addHandle([{"name": "myHandle1"}, {"name": "myHandle2"}, {"name": "myHandle3"}]);
		subject.deactivate(["myHandle2"]);
		
		for (handleName in subject.handles){
			let expected = (handleName == "myHandle2") ? false : true;
			assert.strictEqual(subject.handles[handleName].active, expected);
		}
		
	});
	
	it("#deactivate - string params. default and myHandle3 should be deactivated", function(){
		
		subject.addHandle([{"name": "myHandle1"}, {"name": "myHandle2"}, {"name": "myHandle3"}]);
		subject.deactivate("myHandle3");
		
		for (handleName in subject.handles){
			let expected = (handleName == "myHandle3") ? false : true;
			assert.strictEqual(subject.handles[handleName].active, expected);
		}
	});
	
	
	it("#activate - no params. All handles should be activated", function(){
		
		subject.addHandle([
			{"active": false, "name": "myHandle1"}, 
			{"active": false, "name": "myHandle2"}, 
			{"active": false, "name": "myHandle3"}
		]);
		
		subject.activate();
		for (handleName in subject.handles){
			// let expected = (handleName == "myHandle3") ? true : false;
			let actual = subject.handles[handleName].active;
			let expected = true;
			assert.strictEqual(actual, expected);
		}
	});
	
	it("#activate - array params. default and myHandle2 should be activated", function(){
		
		subject.addHandle([
			{"active": false, "name": "myHandle1"}, 
			{"active": false, "name": "myHandle2"}, 
			{"active": false, "name": "myHandle3"}
		]);
		
		subject.deactivate();
		subject.activate(["default", "myHandle2"]);		
		
		for (handleName in subject.handles){
			let expected = (handleName == "default" || handleName == "myHandle2") ? true : false;
			let actual = subject.handles[handleName].active;
			assert.strictEqual(actual, expected);
		}
	});
	
	it("#activate - string params. myHandle3 should be activated", function(){
		
		subject.addHandle([
			{"active": false, "name": "myHandle1"}, 
			{"active": false, "name": "myHandle2"}, 
			{"active": false, "name": "myHandle3"}
		]);
		
		subject.deactivate();
		subject.activate("myHandle3");
		
		for (handleName in subject.handles){
			let expected = (handleName == "myHandle3") ? true : false;
			let actual = subject.handles[handleName].active;
			assert.strictEqual(actual, expected);
		}
	});
	
	
	it("#renameHandle - myHandle should be renamed to renamedHandle", function(){
		
		subject.addHandle({"name": "myHandle"});
		let myHandle = JSON.parse(JSON.stringify(subject.handles["myHandle"]));
		
		subject.renameHandle("myHandle", "renamedHandle");
		
		assert.strictEqual(subject.handles["myHandle"], undefined);
		assert.deepEqual(subject.handles["renamedHandle"], myHandle);
		
	});

	it("#renameHandle - throws error when trying to rename default handle", function(){		
		actual = subject.renameHandle.bind(subject, "default", "renamedHandle");		
		expected = new Error("Cannot rename the 'default' handle");
		assert.throws(actual, expected);
	});
	
	it("#renameHandle - throws error when handle to rename does not exists", function(){		
		let oldName = "fsxdfasdfasdfacd";
		actual = subject.renameHandle.bind(subject, oldName, "renamedHandle");		
		expected = new Error("'" + oldName + " does not match any existing handles");
		assert.throws(actual, expected);
	});

	it("#renameHandle - throws error when name is not of type string", function(){		
		actual = subject.renameHandle.bind(subject, {}, "renamedHandle");		
		expected = new Error("Both names must be of type 'string'");
		assert.throws(actual, expected);
	});
	
	
	it("#addHandle - add handle named myHandle", function(){
		assert.strictEqual(subject.handles["myHandle"], undefined);
		subject.addHandle({"name": "myHandle"});
		assert.notStrictEqual(subject.handles["myHandle"], undefined);
	});
	
	it("#addHandle - handle successfully inherits from parent", function(){		
		
		assert.strictEqual(subject.handles["myHandle"], undefined);
		
		subject.addHandle({
			"name": "HandleToInherit",
			"target": "file",
			"directory": process.cwd(),
			"fileName": "myTest",
		});
		
		subject.addHandle({
			"name": "myHandle", 
			"target": "file", 
			"fileName": "test"
		}, 
		"HandleToInherit");
		
		actual = subject.handles["myHandle"];
		expected = {
			"active": true,
			"formatter": 'default',
			"level": subject.level,
			"levelMapper": subject.levelMapper,
			"target": "file",
			"directory": process.cwd() + path.sep,
			"fileExtension": ".log",
			"fileName": "test",
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it("#addHandle - throws error if parent handle is not defined", function(){
		let parentName = "myHandleParent";
		let opts = {"name": "myHandle"};
		actual = subject.addHandle.bind(subject, opts, parentName);		
		expected = new Error("'" + parentName + "' is not a valid handle");
		assert.throws(actual, expected);
	});
	
	it("#addHandle - throws error if parent handle is not of type 'string'", function(){		
		let opts = {"name": "myHandle"};
		actual = subject.addHandle.bind(subject, opts, ["parents"]);		
		expected = new TypeError("Parent Handle must be of type 'string'");
		assert.throws(actual, expected);
	});
	
	/* Double Check these
	it("#addHandle - throws error when handle is not of type object", function(){		
		actual = subject.addHandle.bind(subject, "myHandle");		
		expected = new Error('Handle must be of type object in the form --> {name: handleName, "handleProperty1": "value1", "handleProperty2": "value2"}');
		assert.throws(actual, expected);
	});
	
	it("#addHandle - throws error if handle doesn not have a 'name' option defined", function(){		
		let opts = {"target": "file"};
		actual = subject.addHandle.bind(subject, opts);		
		expected = new Error("Handle must have a 'name' option defined");
		assert.throws(actual, expected);
	});
	
	it("#addHandle - throws error if a handle named 'default' is added", function(){		
		let opts = {"name": "default"};
		actual = subject.addHandle.bind(subject, opts);		
		expected = new Error('The default handle is already defined and CANNOT be altered');
		assert.throws(actual, expected);
	});
	*/
	
	it("#addHandle - throws error if a handle named 'anonymous' is added", function(){		
		let opts = {"name": "anonymous"};
		actual = subject.addHandle.bind(subject, opts);		
		expected = new Error("The handle named 'anonymous' is reserved for undefined handles");
		assert.throws(actual, expected);
	});
	
	
	it("#removeHandle - remove nothing if handles to remove not specified", function(){		
		let expected = Object.keys(subject.handles);
		subject.removeHandle();
		let actual = Object.keys(subject.handles);
		assert.deepEqual(actual, expected);
	});
	
	it("#removeHandle - string params. remove myHandle2", function(){		
		
		
		subject.handles = {
			 "default": {
				active: false,
				level: 'debug',
				target: 'console',
				formatter: 'default' 
			},
			"myHandle1": { 
				active: true,
				level: 'debug',
				target: 'console',
				formatter: 'default' 
			},
			"myHandle2": { 
				active: true,
				level: 'debug',
				target: 'console',
				formatter: 'default' 
			}
		};
		subject.removeHandle("myHandle2");
		
		actual = subject.handles;
		expected = {
			"default": {
				active: false,
				formatter: 'default',
				level: "debug",
				target: 'console'
			},
			"myHandle1": { 
				active: true,
				level: 'debug',
				target: 'console',
				formatter: 'default' 
			},
		}
		
		assert.deepEqual(actual, expected);
	});
	
	it("#removeHandle - remove array of handles except default", function(){		
		
		
		subject.handles = {
			 "default": {
				active: false,
				level: 'debug',
				target: 'console',
				formatter: 'default' 
			},
			"myHandle1": { 
				active: true,
				level: 'debug',
				target: 'console',
				formatter: 'default' 
			},
			"myHandle2": { 
				active: true,
				level: 'debug',
				target: 'console',
				formatter: 'default' 
			}
		};
		subject.removeHandle(["myHandle1", "myHandle2"]);
		
		actual = subject.handles;
		expected = {
			"default": {
				active: false,
				formatter: 'default',
				level: "debug",
				target: 'console'
			}
		}
		
		assert.deepEqual(actual, expected);
	});
	
	it("#clearHandles - Handle list should only include default handles", function() {
		
		subject.addHandle([{"name": "myHandle1"}, {"name": "myHandle2"}]);
		subject.clearHandles.call(subject);
		
		actual = Object.keys(subject.handles);
		expected = predefinedHandles;
		assert.deepEqual(actual, expected);
		
	});
	
});