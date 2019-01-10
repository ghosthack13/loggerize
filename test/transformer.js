var assert = require('assert');
var path = require("path")

describe("", function(){
	
	var predefinedTransformers = ["uppercase", "lowercase"];
	beforeEach(function() {
		delete require.cache[require.resolve('../lib/logger.js')]
		subject = require('../lib/logger.js'); //Singleton Logger Instance
	});
	
	
	it("#loadTransformers should import the transformers contained in the transformers folder", function(){
		
		let transformerPath = __dirname + path.sep + ".." + path.sep + "lib" + path.sep + "transformers";
		transformerPath = path.normalize(transformerPath);
		
		subject.transformers = {};
		subject.loadTransformers.call(subject, transformerPath);
		
		let actual = Object.keys(subject.transformers).sort();
		let expected = predefinedTransformers.sort();
		assert.deepEqual(actual, expected);
	});
	
	it("#addTransformer should add the designated transformer to the list of available transformers when passed a name and a function", function(){
		
		subject.addTransformer.call(subject, "myTransformer", function(output){ return output.replace("test", "test works!"); });
		let actual = Object.keys(subject.transformers).sort();
		let expected = predefinedTransformers.concat("myTransformer").sort();
		assert.deepEqual(actual, expected);
	});
	
	it("#addTransformer should add the designated transformer to the list of available transformers when passed an object", function(){
		
		subject.addTransformer.call(subject, {"name": "myTransformer", "transformer": function(output){ return output.replace("test", "test works!"); }});
		
		let actual = Object.keys(subject.transformers).sort();
		let expected = predefinedTransformers.concat("myTransformer").sort();
		assert.deepEqual(actual, expected);
	});
	
	
	it("#removeTransformer should remove the designated transformer from the list of available transformers when passed a name", function(){
		
		subject.addTransformer.call(subject, "myTransformer", function(output){ return output.replace("test", "test works!"); });
		subject.removeTransformer.call(subject, "myTransformer");
		
		let actual = Object.keys(subject.transformers).sort();
		let expected = predefinedTransformers.sort();
		assert.deepEqual(actual, expected);
	});
	
	it("#removeTransformer should remove the designated transformers from the list of available transformers when passed an array", function(){
		
		subject.addTransformer.call(subject, "myTransformer", function(output){ return output.replace("test", "test works!"); });
		subject.addTransformer.call(subject, "myTransformer2", function(output){ return output.replace("test", "test works!"); });
		subject.addTransformer.call(subject, "myTransformer3", function(output){ return output.replace("test", "test works!"); });
		subject.removeTransformer.call(subject, ["myTransformer", "myTransformer3"]);
		
		let actual = Object.keys(subject.transformers).sort();
		let expected = predefinedTransformers.concat("myTransformer2").sort();
		assert.deepEqual(actual, expected);
	});
	
	
	it("#runTransformers should transform output as instructed by added transformer", function(){
		
		let mockLogRecord = {
			"level": "info", 
			"message": "runTransformers log test!", 
			"output": "info runTransformers log test!",
		};
		
		let myTransformer = function(output){ return output.replace("test", "test works!"); }
		subject.addTransformer.call(subject, "myTransformer", myTransformer);
		subject.runTransformers.call(subject, mockLogRecord, ["myTransformer"]);
		
		let actual = mockLogRecord["output"];
		let expected = "info runTransformers log test works!!";
		assert.strictEqual(actual, expected);
	});
	
	it("#runTransformers should transform output as instructed by added transformer and predefined Transformer when using multiple transformers", function(){
		
		let mockLogRecord = {
			"level": "info", 
			"message": "runTransformers log test!", 
			"output": "info runTransformers log test!",
		};
		
		let myTransformer = function(output){ return output.replace("test", "test works!"); }
		subject.addTransformer.call(subject, "myTransformer", myTransformer);
		subject.runTransformers.call(subject, mockLogRecord, ["myTransformer", "uppercase"]);
		
		let actual = mockLogRecord["output"];
		let expected = "INFO RUNTRANSFORMERS LOG TEST WORKS!!";
		assert.strictEqual(actual, expected);
	});

});