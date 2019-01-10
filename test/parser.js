var assert = require('assert');

var parsers = require('../lib/parser.js');

describe("Token/Placeholder Parser", function(){
	
	it("replace token in form %{<token>}", function(){
		
		let d = new Date();
		let patternStr = "%%{level} %{timestamp} %{level} '%{message}'";
		let logRecord = { 
			"level": 'debug',
			"message": 'placeholder replacement test',
			"DateObj": d,
			"timestamp": d.toGMTString()
		}
		
		let actual = parsers.parsePlaceholders(patternStr, logRecord);
		let expected = "%{level} " + d.toGMTString() + " debug 'placeholder replacement test'"
		
		assert.equal(actual, expected)
	});
	
	it("replace date specifiers", function(){
		
		let str = "%Y\n%%Y = %Y\n%%y = %y\n%%m = %m\n%%d = %d\n%%w = %w\n%%H = %H\n%%I = %I\n%%M = %M\n%%S = %S\n%%B = %B\n%%A = %A\n%%b = %b\n%%a = %a\n%%z = %z";
		
		let d = new Date(2018, 11, 13, 10, 58, 34);
		let actual = parsers.strptime(str, undefined, d);
		let expected = "2018\n%Y = 2018\n%y = 18\n%m = 12\n%d = 13\n%w = 04\n%H = 10\n%I = 10\n%M = 58\n%S = 34\n%B = December\n%A = Thursday\n%b = Dec\n%a = Thu\n%z = -0400"
		assert.equal(actual, expected)
		
	});
	
	
});