"use strict";

var assert = require('assert');

var os = require('os');
var fs = require('fs');
var path = require('path');

var http = require('http');
// var https = require('https');

var url = require("url");
var querystring= require('querystring');

var tool = require("../lib/tools.js");

function createMockServer(PORT){
	
	PORT = PORT || 3000;
	var server = http.createServer(function (req, res){
		
		var urlParts = url.parse(req.url);
		var pathname = urlParts.pathname;
		
		if (req.method === 'POST') {
			let body = "";
			req.on('data', function(chunk){
				body += chunk.toString();
			});
			req.on('end', () => {
				var query = querystring.parse(body);
				res.end("Received POST Request with payload: " + JSON.stringify(query));
			});
		}
		else{
			// Send the HTTP header - HTTP Status: 200 : OK, Content Type: text/plain
			res.writeHead(200, {'Content-Type': 'text/plain'});
			if (pathname == "/"){
				res.end("Received GET Request with query: " + decodeURIComponent(urlParts.search.replace("?", "")));
			}
		}
		
		//Gracefully shutdown server
		server.close(function(){ 
			// console.log('Http server closed.'); 
		});
		
	}).listen(PORT);

	// Console will print the message
	// console.log("Server running at http://127.0.0.1:" + PORT + "/");
}

describe("Targets (Intergation Test)", function(){
	
	var logDir =  path.join(__dirname, "logs" + path.sep);
	
	let subject;
	beforeEach(function() {
		delete require.cache[require.resolve('../lib/index.js')];
		delete require.cache[require.resolve('../lib/logger.js')];
		delete require.cache[require.resolve('../lib/loggerproxy.js')];
		subject = require('../lib/logger.js'); //Singleton Logger Instance
	});
	
	after(function(){
		try{
			tool.removeSync(logDir);
		}
		catch(err){
			//Error means no file exits and thus no need for deletion. No need to throw.
			//throw err;
		}
	});
	
	
	it("#file Target should write output field of logRecord to file", function(done){
		
		//Set Directory and file name
		let fileName = "filetargettest.log";
		let targetPath = path.join(logDir, fileName);
		//Set options and Delete target file if already exists
		fs.stat(targetPath, function(err, stats){
			
			//Delete File Synchronously
			if (stats){
				fs.unlinkSync(targetPath);
			}
			
			subject.addHandle({
				"name": "myHandle",
				"target": "file",
				"directory": logDir,
				"fileName": fileName,
			});
			
			let mockLogRecord = {
				"level": "info", 
				"message": "File Target Test Line 1",
				"DateObj": new Date(),
			};
			subject.render(mockLogRecord, subject.handles["myHandle"]);
			
			//Read file contents to assert it was written successfully
			fs.readFile(targetPath, {"encoding": "utf8"}, function (err, data){
				
				if (err){
					done(err);
				}
				
				//Check
				let actual = data;
				let expected = "info File Target Test Line 1" + os.EOL;
				assert.equal(actual, expected);
				
				//remove test file after test
				// fs.unlink(targetPath, function(err){});
				
				//Declare asynchronous code finished
				done();
			});
		});
	});
	
	
	it("#rotateFileByInterval should write output field of logRecord to file named according to ISO format", function(done){
		
		subject.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			// "target": null,
			"target": "rotatingFile",
			// "target": "console",
			"directory": logDir,
			"interval": "second",
		});
		
		//Construct target path
		let targetPath = path.join(logDir, subject.handles["myHandle"]["fileName"] + "_2020_02_28_14_00_00.log");
		
		subject.on("logged", function(logRecord){ // eslint-disable-line no-unused-vars
			//Set options and Delete target file if already exists
			fs.stat(targetPath, function(err, stats){ // eslint-disable-line no-unused-vars
				
				if (err){
					throw err;
				}
				
				//Read file contents to assert it was written successfully
				fs.readFile(targetPath, {"encoding": "utf8"}, function (err, data){
					
					//Check for error
					if (err){ throw err; }
					
					//Assert File contents match expected
					let actual = data;
					let expected = "info Rotating File (Interval) Target Test" + os.EOL;
					assert.equal(actual, expected);
					
					//Remove just created file
					//fs.unlinkSync(targetPath);
					
					//Declare asynchronous code finished
					done();
				});
			});
		});
		
		fs.stat(targetPath, function(err, stats){
			
			if (typeof(stats) != "undefined"){
				fs.unlinkSync(targetPath);
			}
			
			let mockLogRecord = {
				"DateObj": new Date(2020, 1, 28, 10, 0, 0),
				"level": "info", 
				"message": "Rotating File (Interval) Target Test",
			};
			subject.render(mockLogRecord, subject.handles["myHandle"]);
			
		});
	});
	
	it("#rotateFileByInterval should write output field of logRecord to file named according to custom fileNamePattern", function(done){
		
		subject.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			// "target": null,
			// "target": "console",
			"target": "rotatingFile",
			"directory": logDir,
			"interval": "second",
			"fileNamePattern": "%{fileName}-%Y-%b.log",
			"formatter": {"name": "myFormatter", "format": "%{level} %{message} %{timestamp}"}
		});
		
		//Construct target path
		let targetPath = path.join(logDir, subject.handles["myHandle"]["fileName"] + "-2020-Feb.log");
		
		subject.on("logged", function(logRecord){ // eslint-disable-line no-unused-vars
			//Set options and Delete target file if already exists
			fs.stat(targetPath, function(err, stats){ // eslint-disable-line no-unused-vars
				
				if (err){
					throw err;
				}
				
				//Read file contents to assert it was written successfully
				fs.readFile(targetPath, {"encoding": "utf8"}, function (err, data){
					
					//Check for error
					if (err){ throw err; }
					
					//Assert File contents match expected
					let actual = data;
					let expected = "info Rotating File (Interval) Target Test 28 Feb 2020 10:00:00 -0400" + os.EOL;
					assert.equal(actual, expected);
					
					//Remove just created file
					//fs.unlinkSync(targetPath);
					
					//Declare asynchronous code finished
					done();
				});
			});
		});
		
		fs.stat(targetPath, function(err, stats){
			
			if (typeof(stats) != "undefined"){
				fs.unlinkSync(targetPath);
			}
			
			let mockLogRecord = {
				"DateObj": new Date(2020, 1, 28, 10, 0, 0),
				"level": "info", 
				"message": "Rotating File (Interval) Target Test",
			};
			subject.render(mockLogRecord, subject.handles["myHandle"]);
			
		});
	});
	
	
	it("#rotateFileBySize should write output field of logRecord to file named with logNum suffix", function(done){
		
		subject.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			// "target": null,
			// "target": "console",
			"target": "rotatingFile",
			"directory": logDir,
			"maxSize": "1mb",
			// "fileNamePattern": "%{fileName}_%{logNum}_.log",
			"formatter": {"name": "myFormatter", "format": "%{level} %{message} %{timestamp}"}
		});
		
		//Construct target path
		let targetPath = path.join(logDir, "targets.log.1");
		
		subject.on("logged", function(logRecord){ // eslint-disable-line no-unused-vars
			//Set options and Delete target file if already exists
			fs.stat(targetPath, function(err, stats){ // eslint-disable-line no-unused-vars
				
				if (err){
					throw err;
				}
				
				//Read file contents to assert it was written successfully
				fs.readFile(targetPath, {"encoding": "utf8"}, function (err, data){
					
					//Check for error
					if (err){ throw err; }
					
					//Assert File contents match expected
					let actual = data;
					let expected = "info Rotating File (Interval) Target Test 28 Feb 2020 10:00:00 -0400" + os.EOL;
					assert.equal(actual, expected);
					
					//Remove just created file
					//fs.unlinkSync(targetPath);
					
					//Declare asynchronous code finished
					done();
				});
			});
		});
		
		fs.stat(targetPath, function(err, stats){
			
			if (typeof(stats) != "undefined"){
				fs.unlinkSync(targetPath);
			}
			
			let mockLogRecord = {
				"DateObj": new Date(2020, 1, 28, 10, 0, 0),
				"level": "info", 
				"message": "Rotating File (Interval) Target Test",
			};
			subject.render(mockLogRecord, subject.handles["myHandle"]);
			
		});
		
	});
	
	it("#rotateFileBySize should write output field of logRecord to file named according to custom fileNamePattern", function(done){
		
		subject.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			// "target": null,
			// "target": "console",
			"target": "rotatingFile",
			"directory": logDir,
			"maxSize": "1mb",
			"fileNamePattern": "%{fileName}_%{logNum}_.log",
			"formatter": {"name": "myFormatter", "format": "%{level} %{message} %{timestamp}"}
		});
		
		//Construct target path
		let targetPath = path.join(logDir, "targets_1_.log");
		
		subject.on("logged", function(logRecord){ // eslint-disable-line no-unused-vars
			//Set options and Delete target file if already exists
			fs.stat(targetPath, function(err, stats){ // eslint-disable-line no-unused-vars
				
				if (err){
					throw err;
				}
				
				//Read file contents to assert it was written successfully
				fs.readFile(targetPath, {"encoding": "utf8"}, function (err, data){
					
					//Check for error
					if (err){ throw err; }
					
					//Assert File contents match expected
					let actual = data;
					let expected = "info Rotating File (Interval) Target Test 28 Feb 2020 10:00:00 -0400" + os.EOL;
					assert.equal(actual, expected);
					
					//Remove just created file
					//fs.unlinkSync(targetPath);
					
					//Declare asynchronous code finished
					done();
				});
			});
		});
		
		fs.stat(targetPath, function(err, stats){
			
			if (typeof(stats) != "undefined"){
				fs.unlinkSync(targetPath);
			}
			
			let mockLogRecord = {
				"DateObj": new Date(2020, 1, 28, 10, 0, 0),
				"level": "info", 
				"message": "Rotating File (Interval) Target Test",
			};
			subject.render(mockLogRecord, subject.handles["myHandle"]);
			
		});
		
	});
	
	
	it("#http should log request to mock server when sending a GET request", function(done){
		
		createMockServer();
		
		subject.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"target": "http",
			"port": 3000,
			"method": "GET",
			"url": "http://192.168.154.130/",
			"formatter": {
				"name": "myFormatter", 
				"format": "%{level} %{message} %{timestamp}"
			}
		});
		
		subject.on("logged", function(logRecord){
			//Assert File contents match expected
			let actual = logRecord["response"];
			let expected = "Received GET Request with query: level=info&message=HTTP Target Test!&timestamp=28 Feb 2020 10:00:00 -0400&output=info HTTP Target Test! 28 Feb 2020 10:00:00 -0400";
			assert.equal(actual, expected);
			
			//Declare asynchronous code finished for Mocha
			done();
		});
		
		let mockLogRecord = {
			"DateObj": new Date(2020, 1, 28, 10, 0, 0),
			"level": "info", 
			"message": "HTTP Target Test!",
		};
		subject.render(mockLogRecord, subject.handles["myHandle"]);
		
	});
	
	it("#http should log request to mock server when sending a POST request", function(done){
		
		createMockServer();
		
		subject.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"target": "http",
			"port": 3000,
			"method": "POST",
			"url": "http://192.168.154.130/",
			"formatter": {
				"name": "myFormatter", 
				"format": "%{level} %{message} %{timestamp}"
			}
		});
		
		subject.on("logged", function(logRecord){
			//Assert File contents match expected
			let actual = logRecord["response"];
			let expected = 'Received POST Request with payload: {"level":"info","message":"HTTP Target Test!","timestamp":"28 Feb 2020 10:00:00 -0400","output":"info HTTP Target Test! 28 Feb 2020 10:00:00 -0400"}';
			assert.equal(actual, expected);
			
			//Declare asynchronous code finished for Mocha
			done();
		});
		
		let mockLogRecord = {
			"DateObj": new Date(2020, 1, 28, 10, 0, 0),
			"level": "info", 
			"message": "HTTP Target Test!",
		};
		subject.render(mockLogRecord, subject.handles["myHandle"]);
		
	});
	
	
	it("#customTarget should write output field of logRecord when custom target defined on handle", function(done){
		
		subject.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"target": function(logRecord, handleOpts){
				
				let targetPath = path.join(handleOpts["directory"], handleOpts["fileName"]);
				fs.writeFile(targetPath, logRecord["output"] + os.EOL, function(err){
					if (err) throw err;
					handleOpts["_emitter"].emit("logged", logRecord);
				});
				
				//Alternative
				// console.log(logRecord["output"]);
				// handleOpts["_emitter"].emit("logged", logRecord);
			},
			"directory": logDir,
			"fileName": "customTargetTest.log",
			"targetSpecificOption": "randomSetting",
		});
		
		//Construct target path
		let targetPath = path.join(logDir, subject.handles["myHandle"]["fileName"]);
		
		subject.on("logged", function(logRecord){ // eslint-disable-line no-unused-vars
			
			//Set options and Delete target file if already exists
			fs.stat(targetPath, function(err, stats){ // eslint-disable-line no-unused-vars
				
				if (err){
					throw err;
				}
				
				//Read file contents to assert it was written successfully
				fs.readFile(targetPath, {"encoding": "utf8"}, function (err, data){
					
					//Check for error
					if (err){ throw err; }
					
					//Assert File contents match expected
					let actual = data;
					let expected = "info Custom Target Test" + os.EOL;
					assert.equal(actual, expected);
					
					//Remove just created file
					//fs.unlinkSync(targetPath);
					
					//Declare asynchronous code finished
					done();
				});
			});
		});
		
		fs.stat(targetPath, function(err, stats){ 
			
			if (typeof(stats) != "undefined"){
				fs.unlinkSync(targetPath);
			}
			
			let mockLogRecord = {
				"DateObj": new Date(2020, 1, 28, 10, 0, 0),
				"level": "info", 
				"message": "Custom Target Test",
			};
			subject.render(mockLogRecord, subject.handles["myHandle"]);
			
		});
	});
	
	it("#customTarget should write output field of logRecord when custom target added to global and assigned to handle", function(done){
		
		subject.addTarget("myTarget", function(logRecord, handleOpts){
			
			let targetPath = path.join(handleOpts["directory"], handleOpts["fileName"]);
			fs.writeFile(targetPath, logRecord["output"] + os.EOL, function(err){
				if (err) throw err;
				handleOpts["_emitter"].emit("logged", logRecord);
			});
			
			//Alternative
			// console.log(logRecord["output"]);
			// handleOpts["_emitter"].emit("logged", logRecord);
		});
		
		subject.addHandle({
			"emitEvents": true,
			"name": "myHandle",
			"target": "myTarget",
			"directory": logDir,
			"fileName": "customTargetTest.log",
			"targetSpecificOption": "randomSetting",
		});
		
		//Construct target path
		let targetPath = path.join(logDir, subject.handles["myHandle"]["fileName"]);
		
		subject.on("logged", function(logRecord){ // eslint-disable-line no-unused-vars
			
			//Set options and Delete target file if already exists
			fs.stat(targetPath, function(err, stats){ // eslint-disable-line no-unused-vars
				
				if (err){
					throw err;
				}
				
				//Read file contents to assert it was written successfully
				fs.readFile(targetPath, {"encoding": "utf8"}, function (err, data){
					
					//Check for error
					if (err){ throw err; }
					
					//Assert File contents match expected
					let actual = data;
					let expected = "info Custom Target Test" + os.EOL;
					assert.equal(actual, expected);
					
					//Remove just created file
					//fs.unlinkSync(targetPath);
					
					//Declare asynchronous code finished
					done();
				});
			});
		});
		
		fs.stat(targetPath, function(err, stats){
			
			if (typeof(stats) != "undefined"){
				fs.unlinkSync(targetPath);
			}
			
			let mockLogRecord = {
				"DateObj": new Date(2020, 1, 28, 10, 0, 0),
				"level": "info", 
				"message": "Custom Target Test",
			};
			subject.render(mockLogRecord, subject.handles["myHandle"]);
			
		});
	});
	
	
});