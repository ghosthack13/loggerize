"use strict";

var assert = require('assert');

//Style 
//<method>_Should<expected>_When<condition> | E.g. Deposit_ShouldIncreaseBalance_WhenGivenPositiveValue

describe('LogRecord (logrecord.js)', function(){
	
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
	
	it("cloneRecord - should create a clone of the logrecord when passed a standard logrecord", function(){
		
		var logRecord = {
			"DateObj": new Date(2020, 11, 14, 15, 0, 59),
			"timestamp": "14 Dec 2020 15:00:59 -0600",		
			"loggerName": "myLogger",
			"level": "debug",
			"levelNum": 4,
			"message": "Sample Log Message",
			"uuid": "3cf2552c-1dba-11e9-ab14-d663bd873d93",
			"output": "debug Sample Log Message"
		};
		
		let actual = subject.cloneRecord(logRecord);
		let expected = logRecord;
		assert.deepEqual(actual, expected);
	});
	
	it("cloneRecord - should create a clone of the logrecord when passed a logrecord with custom tokens", function(){
		
		subject.customTokens = {"myToken": "Go Token!"};
		
		var logRecord = {
			"DateObj": new Date(2020, 11, 14, 15, 0, 59),
			"timestamp": "14 Dec 2020 15:00:59 -0600",		
			"loggerName": "myLogger",
			"level": "debug",
			"levelNum": 4,
			"message": "Sample Log Message",
			"uuid": "3cf2552c-1dba-11e9-ab14-d663bd873d93",
			"output": "debug Sample Log Message"
		};
		
		let actual = subject.cloneRecord.call(subject, logRecord);
		let expected = Object.assign(logRecord, {"myToken": "Go Token!"});
		assert.deepEqual(actual, expected);
	});
	
	it("cloneRecord - should create a clone of the logrecord when passed a HTTP logrecord", function(){
		
		var logRecord = {
			_isHTTPRecord: true,
			"DateObj": new Date(2020, 11, 14, 15, 0, 59),
			remoteIPv4: '192.168.154.1',
			method: 'GET',
			protocol: 'HTTP',
			version: '1.1',
			hostname: '192.168.154.130',
			path: '/',
			url: 'http://192.168.154.130/',
			referer: undefined,
			referrer: undefined,
			userAgent: 'curl/7.55.1',
			'req.contentLength': undefined,
			loggerName: '__HTTPLogger1551047058615',
			statusCode: 200,
			levelNum: 200,
			message: 'OK',
			levelGroup: 'success',
			levelGroupNum: 200,
			responseTime: 16,
			'res.contentLength': 12,
			timestamp: '24/Feb/2019:18:24:20 -0400',
			output: '192.168.154.1 - - [24/Feb/2019:18:24:20 -0400] "GET / HTTP/1.1" 200 12' 
		};
		
		let actual = subject.cloneRecord(logRecord);
		let expected = logRecord;
		assert.deepEqual(actual, expected);
	});
	
});


