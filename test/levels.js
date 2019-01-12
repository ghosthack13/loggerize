"use strict";
 
var assert = require('assert');


describe("Manage Levels", function() {
	
	var predefinedLevelMappers = ['npm', 'http', 'syslog', 'python', 'defcon'];
	
	let subject;
	beforeEach(function(){
		delete require.cache[require.resolve('../lib/index.js')];
		delete require.cache[require.resolve('../lib/logger.js')];
		delete require.cache[require.resolve('../lib/loggerproxy.js')];
		subject = require('../lib/logger.js'); //Singleton Logger Instance
	});
	
	
	it("#defineLevels - should Define custom logging map", function(){
		
		let orderOfSeverity = -1;
		let mapper = "myLevelMap";
		let levelsObj = {
			"error": 	100,
			"warning": 	101,
			"info": 	201,
		};
		
		subject.defineLevels(mapper, levelsObj, orderOfSeverity);
		
		let actual = subject.levelMappings["myLevelMap"];
		let expected = levelsObj;
		assert.deepEqual(actual, expected);
	});
	
	it("#defineLevels - should Define reverse logging map when custom level map was already defined", function(){
		
		let levelsObj = {
			"error": 	100,
			"warning": 	101,
			"info": 	201,
		};
		
		let reverseMap = {
			100: "error",
			101: "warning",
			201: "info",
		};
		
		let orderOfSeverity = -1;
		let mapper = "myLevelMap";
		subject.defineLevels(mapper, levelsObj, orderOfSeverity);
		
		let actual = subject.reverseMappings["myLevelMap"];
		let expected = reverseMap;
		assert.deepEqual(actual, expected);
	});
	
	it("#loadLevels - should load levelMappings and reverseMappings", function(){
		
		delete subject.levelMappings; //clear levelMappings for test
		subject.loadLevels();
		
		let actual = Object.keys(subject.levelMappings);
		let expected = predefinedLevelMappers;
		assert.deepEqual(actual, expected);
	});
	
	it("#getLevel - should return the default level", function(){
		
		let actual = subject.getLevel();
		let expected = subject.level;
		assert.strictEqual(actual, expected);
	});
	
	it("#setLevel - should set the global level", function(){
		
		subject.setLevel("info");
		let actual = subject.getLevel();
		let expected = "info";
		assert.strictEqual(actual, expected);
		
		
	});
	
	it("#setLevelMap - should set the global levelMapper", function(){
		
		subject.setLevelMap("defcon");
		
		let actual = subject.levelMapper;
		let expected = "defcon";
		assert.strictEqual(actual, expected);
		
		
	});
	
	it("#getLevelName - should set the global levelMapper", function(){
		
		let actual = subject.getLevelName(2);
		let expected = "info";
		assert.strictEqual(actual, expected);
	});
	
	it("#getMinMaxSeverity - should get numeric levels representing the lowest and highest severity when using mapper of desc severity", function(){
		
		let actual = subject.getMinMaxSeverity("syslog");
		let expected = [7, 0];
		assert.deepEqual(actual, expected);
	});
	
	it("#getMinMaxSeverity - should get numeric levels representing the lowest and highest severity when using mapper of asc severity", function(){
		
		let actual = subject.getMinMaxSeverity("http");
		let expected = [100, 500];
		assert.deepEqual(actual, expected);
	});
	
	it("#defineLevels - throws error indicating level value is not a number", function(){
		
		let orderOfSeverity = -1;
		let mapper = "myLevelMap";
		let levelsObj = {
			"err": 	 100,
			"warn":  {},
			"info":  201,
		};
		
		let actual = subject.defineLevels.bind(subject, mapper, levelsObj, orderOfSeverity);
		let expected = new Error("Level value must be of type number");
		assert.throws(actual, expected);
	});
	
	
});