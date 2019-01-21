"use strict";

var assert = require('assert');

describe("Manage Formatters", function() {
	
	let subject;
	beforeEach(function() {
		delete require.cache[require.resolve('../lib/index.js')];
		delete require.cache[require.resolve('../lib/logger.js')];
		delete require.cache[require.resolve('../lib/loggerproxy.js')];
		subject = require('../lib/logger.js'); //Singleton Logger Instance
	});
	
	
	it("#addFormatter - Add formatter called 'myFormatter'", function() {
		
		subject.addFormatter({
			"name": "myFormatter",
			"format": "%{timestamp} %{level} '%{message}'"
		});
		
		let actual = subject.formatters["myFormatter"];
		let expected = { format: "%{timestamp} %{level} '%{message}'" };
		assert.deepEqual(actual, expected);
	});
	
	it("#addFormatter - Add formatters via array", function() {
		
		var predefinedFormatters = Object.keys(subject.formatters).sort();
		
		subject.addFormatter([
			{"name": "myFormatter1", "format": "%{timestamp} %{level} '%{message}'"},
			{"name": "myFormatter2", "format": "%{timestamp} %{level} '%{message}'"},
			{"name": "myFormatter3", "format": "%{timestamp} %{level} '%{message}'"}
		]);
		
		let actual = Object.keys(subject.formatters).sort();
		let expected = predefinedFormatters.concat(["myFormatter1", "myFormatter2", "myFormatter3"]).sort();
		
		assert.deepEqual(actual, expected);
	});
	
	it("#addFormatter - formatter successfully inherits from parent", function(){		
		
		let parentName = "FormatterToInherit";
		subject.addFormatter({
			"name": parentName,
			"timestamp": {"pattern": "%Y-%m"},
			"format": "%{timestamp} %{level} %{uuid} '%{message}'"
		});
		
		let opts = {
			"name": "myFormatter",
			"format": "%{timestamp} '%{message}'"
		};
		
		subject.addFormatter(opts, parentName);
		let actual = subject.formatters["myFormatter"];
		let expected = {
			"timestamp": {"pattern": "%Y-%m"},		//child inherits parent timestamp specification since it didn't have one previously
			"format": "%{timestamp} '%{message}'"	//child overwrites parent format because it has one defined of its own
		};
		
		assert.deepEqual(actual, expected);
	});
	
	it("#addFormatter - throws error if parent formatter is not defined", function(){
		
		let parentName = "myFormatterParent";
		let opts = {"name": "myFormatter"};
		let actual = subject.addFormatter.bind(subject, opts, parentName);
		let expected = new Error("'" + parentName + "' is not a valid formatter");
		assert.throws(actual, expected);
	});
	
	it("#addFormatter - throws error if parent formatter is not of type 'string'", function(){
		
		let opts = {"name": "myFormatter"};
		let actual = subject.addFormatter.bind(subject, opts, ["parents"]);		
		let expected = new TypeError("Parent formatter must be of type 'string'");
		assert.throws(actual, expected);
	});
	
	
	it("#removeFormatter - remove nothing if formatters to remove not specified", function(){		
		
		subject.addFormatter({
			"name": "myFormatter",
			"format": "%{timestamp} %{level} '%{message}'"
		});
		
		subject.removeFormatter();
		let actual = subject.formatters["myFormatter"];		
		let expected = { format: "%{timestamp} %{level} '%{message}'" };
		
		assert.deepEqual(actual, expected);
	});
	
	it("#removeFormatter - string params. remove myFormatter", function(){		
		
		subject.addFormatter({
			"name": "myFormatter",
			"format": "%{timestamp} %{level} '%{message}'"
		});
		
		subject.removeFormatter("myFormatter");
		let actual = subject.formatters["myFormatter"];
		let expected = undefined;
		
		assert.strictEqual(actual, expected);
	});
	
	it("#removeFormatter - array of strings as params. remove myFormatter1, myFormatter3", function(){		
		
		subject.addFormatter([
			{"name": "myFormatter1", "format": "%{timestamp} %{level} '%{message}'"},
			{"name": "myFormatter2", "format": "%{timestamp} %{level} '%{message}'"},
			{"name": "myFormatter3", "format": "%{timestamp} %{level} '%{message}'"},
			{"name": "myFormatter4", "format": "%{timestamp} %{level} '%{message}'"},
		]);
		
		subject.removeFormatter(["myFormatter2"]);
		
		let actual = subject.formatters["myFormatter2"];		
		let expected = undefined;
		assert.strictEqual(actual, expected);
	});
	
	
	it("#addTokens - Add custom tokens to be replaced via formatter substitution", function() {
		
		subject.addTokens({
			"tag": "%{timestamp}_myCustomToken",
			"label": "MyLabel: "
		});
		
		subject.clearFormatters();
		let actual = subject.customTokens;
		let expected = {
			"tag": "%{timestamp}_myCustomToken",
			"label": "MyLabel: "
		};
		assert.deepEqual(actual, expected);
	});
	
	it("#format - Substitute tokens via format", function() {
		
		let mockLogRecord = {
			"level": "debug",
			"message": "Sample Log Message",
			"DateObj": new Date(2020, 11, 14, 15, 0, 59)
		};
		
		subject.addTokens({
			"tag": "_myCustomToken",
			"label": "MyLabel:"
		});
		
		subject.addHandle({
			"name": "myHandle",
		});
		
		subject.addFormatter({
			"name": "myFormatter",
			"timestamp": {
				"pattern": "%Y-%m",
				// "pattern": "ISO"
			},
			"format": "%%{level} %{timestamp} %{level} %{label} '%{message}' %{tag}"
		});
		
		subject.setHandleOpts({"formatter": "myFormatter"}, "myHandle");
		
		let formattedLogRecord = subject.format(mockLogRecord, "myFormatter", subject.levelMapper);
		let actual = formattedLogRecord["output"];
		let expected = "%{level} 2020-12 debug MyLabel: 'Sample Log Message' _myCustomToken";
		assert.deepEqual(actual, expected);
	});
	
	it("#format - Set default substitution for missing tokens (program default is \"\", empty string)", function() {
		
		let mockLogRecord = {
			"level": "debug",
			"message": "Sample Log Message",
			"DateObj": new Date(2020, 11, 14, 15, 0, 59)
		};
		
		subject.addFormatter({
			"defaultSubstitution": "--",
			"name": "myFormatter",
			"fields": ["message"],
			"timestamp": {
				"pattern": "%Y-%m",
				// "pattern": "ISO"
			},
			"format": "%%{level} %{datetime} %{severity} '%{message}'"
		});
		
		subject.addHandle({
			"name": "myHandle",
			"formatter": "myFormatter"
		});
		
		let formattedLogRecord = subject.format(mockLogRecord, "myFormatter", subject.levelMapper);
		let actual = formattedLogRecord["output"];
		let expected = "%{level} -- -- 'Sample Log Message'";
		assert.equal(actual, expected);
	});
	
	it("#format - Set logRecord to output as JSON string", function() {
		
		let mockLogRecord = {
			"level": "debug",
			"message": "Sample Log Message",
			"DateObj": new Date(2020, 11, 14, 15, 0, 59)
		};
		
		subject.addFormatter({
			"defaultSubstitution": "--",
			"name": "myFormatter",
			"json": true,
			"fields": ["level", "message"],
			"timestamp": {
				"pattern": "%Y-%m",
				// "pattern": "ISO"
			},
			"format": "%%{level} %{datetime} %{level} '%{message}'"
		});
		
		subject.addHandle({
			"name": "myHandle",
			"formatter": "myFormatter"
		});
		
		let formattedLogRecord = subject.format(mockLogRecord, "myFormatter", subject.levelMapper);
		let actual = formattedLogRecord["output"];
		let expected = '{"level":"debug","message":"Sample Log Message"}';
		assert.equal(actual, expected);
	});
	
	it("#format - Transform individual token (level) to uppercase", function() {
		
		let mockLogRecord = {
			"level": "debug",
			"message": "Sample Log Message",
			"DateObj": new Date(2020, 11, 14, 15, 0, 59)
		};
		
		subject.addFormatter({
			"name": "myFormatter",
			"timestamp": {
				"pattern": "%Y-%m",
				// "pattern": "ISO"
			},
			"level": {
				"transformer": function(level){ return level.toUpperCase(); }
			},
			"format": "%%{level} %{timestamp} %{level} '%{message}'"
		});
		
		subject.addHandle({
			"name": "myHandle",
			"formatter": "myFormatter"
		});
		
		let formattedLogRecord = subject.format(mockLogRecord, "myFormatter", subject.levelMapper);
		let actual = formattedLogRecord["output"];
		let expected = "%{level} 2020-12 DEBUG 'Sample Log Message'";
		assert.equal(actual, expected);
	});
	
	it("#format - Transform whole output to uppercase", function() {
		
		let mockLogRecord = {
			"level": "debug",
			"message": "Sample Log Message",
			"DateObj": new Date(2020, 11, 14, 15, 0, 59)
		};
		
		subject.addFormatter({
			"name": "myFormatter",
			"timestamp": {
				"pattern": "%Y-%m",
				// "pattern": "ISO"
			},
			"transformer": function(input){ return input.toUpperCase(); },
			"format": "%%{level} %{timestamp} %{level} '%{message}'"
		});
		
		subject.addHandle({
			"name": "myHandle",
			"formatter": "myFormatter"
		});
		
		let formattedLogRecord = subject.format(mockLogRecord, "myFormatter", subject.levelMapper);
		let actual = formattedLogRecord["output"];
		let expected = "%{LEVEL} 2020-12 DEBUG 'SAMPLE LOG MESSAGE'";
		assert.equal(actual, expected);
	});
	
	
	it("#clearFormatters - Formatter list should only include default formatter", function() {
		
		var predefinedFormatters = Object.keys(subject.formatters).sort();
		
		subject.addFormatter({
			"name": "myFormatter",
			"format": '%{timestamp} %{level} %{message}'
		});
		subject.clearFormatters();
		
		let actual = Object.keys(subject.formatters).sort();
		
		let expected = predefinedFormatters;
		assert.deepEqual(actual, expected);
	});
	
});