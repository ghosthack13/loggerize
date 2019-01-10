var assert = require('assert');
var path = require("path")

describe("", function(){
	
	beforeEach(function() {
		delete require.cache[require.resolve('../lib/logger.js')]
		subject = require('../lib/logger.js'); //Singleton Logger Instance
	});
	
	var predefinedFilters = ["burst", "dynamicLevel", "level", "regex"];
	
	it("#loadFilters should import the filters contained in the filters folder", function(){
		
		let filterPath = __dirname + path.sep + ".." + path.sep + "lib" + path.sep + "filters";
		filterPath = path.normalize(filterPath);
		
		subject.filters = {};
		subject.loadFilters.call(subject, filterPath);
		
		let actual = Object.keys(subject.filters).sort();
		let expected = predefinedFilters.sort();
		assert.deepEqual(actual, expected);
	});
	
	
	it("#LogFilter should construct a an object that initializes level and target when passed a handle (context) as a parameter", function(){
		
		let opts = {};
		let mockHandle = {
			'active': true,
			'level': "debug",
			'target': "console",
			'formatter': "default",
			'levelMapper': "npm",
			"filter": {"regex": {"pattern": /debug/}}
		};
		
		let actual = new subject.LogFilter(opts, mockHandle);
		let expected = { level: 'debug', target: 'console' };
		assert.deepEqual(actual, expected);
	});
	
	it("#LogFilter should construct an object that initializes pattern when passed an options object in parameter", function(){
		
		let opts = {"pattern": /debug/};
		let mockHandle = {
			'active': true,
			'level': "debug",
			'target': "console",
			'formatter': "default",
			'levelMapper': "npm",
			"filter": {"regex": {"pattern": /debug/}}
		};
		
		let actual = new subject.LogFilter(opts, mockHandle);
		let expected = { pattern: /debug/, level: 'debug', target: 'console' };
		assert.deepEqual(actual, expected);
	});
	
	it("#LogFilterFactory should return a LogFilter with a 'filter' method defined as the function passed in 1st argument", function(){
		
		let myFilter = function(){return true;}
		let logFilter = subject.LogFilterFactory.call(subject, myFilter);
		
		let actual = logFilter.filter.toString();
		let expected = "function(){return true;}";
		assert.equal(actual, expected);
	});
	
	
	it("#addFilter should add the designated filter to the list of available filters when passed a name and a function", function(){
		
		subject.addFilter.call(subject, "myFilter", function(){return true;});
		let actual = Object.keys(subject.filters).sort();
		let expected = predefinedFilters.concat("myFilter").sort();
		assert.deepEqual(actual, expected);
	});
	
	it("#addFilter should add the designated filter to the list of available filters when passed an object", function(){
		
		subject.addFilter.call(subject, {"name": "myFilter", "filter": function(){return true;}});
		let actual = Object.keys(subject.filters).sort();
		let expected = predefinedFilters.concat("myFilter").sort();
		assert.deepEqual(actual, expected);
	});
	
	
	it("#removeFilter should remove the designated filter from the list of available filters when passed a name", function(){
		
		subject.addFilter.call(subject, "myFilter", function(){return true;});
		subject.removeFilter.call(subject, "myFilter");
		
		let actual = Object.keys(subject.filters).sort();
		let expected = predefinedFilters.sort();
		assert.deepEqual(actual, expected);
	});
	
	it("#removeFilter should remove the designated filters from the list of available filters when passed an array", function(){
		
		subject.addFilter.call(subject, "myFilter", function(){return true;});
		subject.addFilter.call(subject, "myFilter2", function(){return false;});
		subject.addFilter.call(subject, "myFilter3", function(){return true;});
		subject.removeFilter.call(subject, ["myFilter", "myFilter3"]);
		
		let actual = Object.keys(subject.filters).sort();
		let expected = predefinedFilters.concat("myFilter2").sort();
		assert.deepEqual(actual, expected);
	});
	
	
	it("#runFilters should return true when passed a logRecord and array of constructed filters", function(){
		
		let mockLogRecord = {"level": "info", "message": "runFilters log test!"};
		let myFilter = function(){return true;}
		let logFilter = subject.LogFilterFactory.call(subject, myFilter);
		let _filters = [logFilter];
		
		let actual = subject.runFilters.call(subject, mockLogRecord, _filters);
		let expected = true;
		assert.strictEqual(actual, expected);
	});
	
	it("#runFilters should return false when any filter in filter array returns false", function(){
		
		let myFilter = function(){return true;}
		let myFilter2 = function(){return false;}
		let logFilter = subject.LogFilterFactory.call(subject, myFilter);
		let logFilter2 = subject.LogFilterFactory.call(subject, myFilter2);
		
		let _filters = [logFilter, logFilter2];
		let mockLogRecord = {"level": "info", "message": "runFilters log test!"};
		
		let actual = subject.runFilters.call(subject, mockLogRecord, _filters);
		let expected = false;
		assert.strictEqual(actual, expected);
	});
	
	
	it("#affixFilters should construct logFilter objects and append to _filter property of context (e.g. handle) passed as parameter", function(){
		
		let mockHandle = {
			'active': true,
			'level': "debug",
			'target': "console",
			'formatter': "default",
			'levelMapper': "npm",
			"filter": {"regex": {"pattern": /debug/}}
		};
		
		subject.affixFilters.call(subject, mockHandle);
		
		let actual = mockHandle["_filters"];
		let expected = [{
			pattern: /debug/,
			filterName: 'regex',
			level: 'debug',
			target: 'console' 
		}];
		
		assert.deepEqual(actual, expected);
	});
	
	
})

