"use strict";

var assert = require('assert');
var path = require("path");
var http = require('http');

describe("Manage Filters", function(){
	
	let subject;
	let loggerize;
	beforeEach(function(){
		delete require.cache[require.resolve('../lib/index.js')];
		delete require.cache[require.resolve('../lib/logger.js')];
		delete require.cache[require.resolve('../lib/loggerproxy.js')];
		subject = require('../lib/logger.js'); //Singleton Logger Instance
		loggerize = require('../lib/index.js');
	});
	
	var server;
	after(function(){
		if (server){
			server.close();
		}
	});
	
	var predefinedFilters = [
		//"burst", "dynamicLevel", "level", 
		"regex"
	];
	
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
		
		//In the function the space before the parenthesis IS IMPORTANT when 
		//converting to string
		let myFilter = function (){return true;};
		let logFilter = subject.LogFilterFactory.call(subject, myFilter);
		
		let actual = logFilter.filter.toString();
		let expected = "function (){return true;}";
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
		let myFilter = function(){return true;};
		let logFilter = subject.LogFilterFactory.call(subject, myFilter);
		let _filters = [logFilter];
		
		let context = {
			"level": "debug",
			"levelNum": 4,
			"levelMapper": "npm",
			"_filters": _filters,
		};
		
		let actual = subject.runFilters.call(subject, mockLogRecord, context);
		let expected = true;
		assert.strictEqual(actual, expected);
	});
	
	it("#runFilters should return false when any filter in filter array returns false", function(){
		
		let myFilter = function(){return true;};
		let myFilter2 = function(){return false;};
		let logFilter = subject.LogFilterFactory.call(subject, myFilter);
		let logFilter2 = subject.LogFilterFactory.call(subject, myFilter2);
		
		let _filters = [logFilter, logFilter2];
		let mockLogRecord = {"level": "info", "message": "runFilters log test!"};
		let context = {
			"level": "debug",
			"levelNum": 4,
			"levelMapper": "npm",
			"_filters": _filters,
		};
		
		let actual = subject.runFilters.call(subject, mockLogRecord, context);
		let expected = false;
		assert.strictEqual(actual, expected);
	});
	
	
	
	it("Should filter output when the logger has higher severity than event", function(done){
		
		loggerize.on("filtered", function(logRecord){
			assert(true);
			done();
		});
		
		loggerize.on("logged", function(logRecord){
			assert(false);
			done();
		});
		
		let logger = loggerize.createLogger({
			name: "myLogger",
			level: "warn",
			emitEvents: true,
			propogate: false,
		});
		logger.log("info", "Logger Test!");
		
	});
	
	it("Should filter output when the handle has higher severity than event", function(done){
		
		loggerize.on("filtered", function(logRecord){
			assert(true);
			done();
		});
		
		loggerize.on("logged", function(logRecord){
			assert(false);
			done();
		});
		
		let logger = loggerize.createLogger({
			name: "myLogger",
			propogate: false,
			handle: {
				name: "myHandle",
				level: "warn",
				emitEvents: true,
			}
		});
		logger.log("info", "Logger Test!");
		
	});
	
	
	it("Should filter both request and response when both options set to false on logger", function(done){
		
		let numFiltered = 0;
		let numLogged = 0;
		
		loggerize.on("filtered", function(logRecord){
			++numFiltered;
		});
		
		loggerize.on("logged", function(logRecord){
			++numLogged;
		});
		
		loggerize.on("finished", function(){
			if (numFiltered === 2){
				assert(true);
			}
			else{
				assert(false);
			}
			server.close();
			done();
		});
		
		
		let httpLogger = loggerize.createHTTPLogger({
			name: "myHTTPLogger",
			logOnResponse: false,
			logOnRequest: false,
			emitEvents: true,
			handle: {
				name: "myHandle",
				target: null,
				emitEvents: true,
			}
		});
		
		server = http.createServer(function (req, res){
			httpLogger.httpListener(req, res);
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.end('okay');
		}).listen(3000);
		
		const req = http.request("http://localhost:3000", function(res){
			let data = "";
			res.setEncoding('utf8');		
			res.on('data', function(chunk){
				data += chunk;
			});
			res.on('end', function(){
				subject.emit("finished");
			});
			res.on('error', function(){
				assert(false);
				server.close();
				done();
			});
		});
		
		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});
		
		req.end();
		
	});
	
	it("Should log both request and response when both options set to true on logger", function(done){
		
		let numFiltered = 0;
		let numLogged = 0;
		
		loggerize.on("filtered", function(logRecord){
			++numFiltered;
		});
		
		loggerize.on("logged", function(logRecord){
			++numLogged;
		});
		
		loggerize.on("finished", function(){
			if (numFiltered === 0 && numLogged === 2){
				assert(true);
			}
			else{
				assert(false);
			}
			server.close();
			done();
		});
		
		
		let httpLogger = loggerize.createHTTPLogger({
			name: "myHTTPLogger",
			logOnResponse: true,
			logOnRequest: true,
			emitEvents: true,
			handle: {
				name: "myHandle",
				target: null,
				emitEvents: true,
			}
		});
		
		server = http.createServer(function (req, res){
			httpLogger.httpListener(req, res);
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.end('okay');
		}).listen(3000);
		
		const req = http.request("http://localhost:3000", function(res){
			let data = "";
			res.setEncoding('utf8');		
			res.on('data', function(chunk){
				data += chunk;
			});
			res.on('end', function(){
				subject.emit("finished");
			});
			res.on('error', function(){
				assert(false);
				server.close();
				done();
			});
		});
		
		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});
		
		req.end();
		
	});
	
	it("Should filter request and log response when logOnRequest set to false and logOnResponse set to true", function(done){
		
		let numFiltered = 0;
		let numLogged = 0;
		
		loggerize.on("filtered", function(logRecord){
			assert((typeof(logRecord["statusCode"]) != "number"), "Response is not supposed to be filtered");
			++numFiltered;
		});
		
		loggerize.on("logged", function(logRecord){
			assert((typeof(logRecord["statusCode"]) == "number"), "Only Response is supposed to be logged");
			++numLogged;
		});
		
		loggerize.on("finished", function(){
			if (numFiltered === 1 && numLogged === 1){
				assert(true);
			}
			else{
				assert(false);
			}
			server.close();
			done();
		});
		
		
		let httpLogger = loggerize.createHTTPLogger({
			name: "myHTTPLogger",
			logOnResponse: true,
			logOnRequest: false,
			emitEvents: true,
			handle: {
				name: "myHandle",
				target: null,
				emitEvents: true,
			}
		});
		
		server = http.createServer(function (req, res){
			httpLogger.httpListener(req, res);
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.end('okay');
		}).listen(3000);
		
		const req = http.request("http://localhost:3000", function(res){
			let data = "";
			res.setEncoding('utf8');		
			res.on('data', function(chunk){
				data += chunk;
			});
			res.on('end', function(){
				subject.emit("finished");
			});
			res.on('error', function(){
				assert(false);
				server.close();
				done();
			});
		});
		
		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});
		
		req.end();
		
	});
	
	it("Should filter response and log request when logOnRequest set to true and logOnResponse set to false", function(done){
		
		let numFiltered = 0;
		let numLogged = 0;
		
		loggerize.on("filtered", function(logRecord){
			assert((typeof(logRecord["statusCode"]) == "number"), "Response is supposed to be filtered");
			++numFiltered;
		});
		
		loggerize.on("logged", function(logRecord){
			assert((typeof(logRecord["statusCode"]) != "number"), "Only Request is supposed to be logged");
			++numLogged;
		});
		
		loggerize.on("finished", function(){
			if (numFiltered === 1 && numLogged === 1){
				assert(true);
			}
			else{
				assert(false);
			}
			server.close();
			done();
		});
		
		
		let httpLogger = loggerize.createHTTPLogger({
			name: "myHTTPLogger",
			logOnResponse: false,
			logOnRequest: true,
			emitEvents: true,
			handle: {
				name: "myHandle",
				target: null,
				emitEvents: true,
			}
		});
		
		server = http.createServer(function (req, res){
			httpLogger.httpListener(req, res);
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.end('okay');
		}).listen(3000);
		
		const req = http.request("http://localhost:3000", function(res){
			let data = "";
			res.setEncoding('utf8');		
			res.on('data', function(chunk){
				data += chunk;
			});
			res.on('end', function(){
				subject.emit("finished");
			});
			res.on('error', function(){
				assert(false);
				server.close();
				done();
			});
		});
		
		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});
		
		req.end();
		
	});
	
	
	
});

