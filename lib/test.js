var Logger = require('./logger.js');
var path = require("path");
var fs = require("fs");
var os = require("os");
var http = require('http');
var https = require('https');
var assert = require('assert');
var url = require("url");

const { querystring } = require('querystring');

// console.log(Logger.prototype);
// process.exit();

var parsers = require('../lib/parser.js');

// var Library = require('../lib/library.js');
var Library = require('./index.js');
var Loggerize = require('./index.js');

function testLog(){
	
	var logger = new Logger();
	logger.debug("Test Logger");
}

function testAnonymous(){
	
	var logger = new Logger();
	
	//Test Setters
	logger.setLevel(2);
	// logger.setTarget("file");
	
	//Test Getter
	// console.log("Level: " + logger.getLevel());
	// console.log("Target: " + logger.getTarget());
	
	//Enable/Disable
	// logger.enable();
	// logger.enable("default");
	// logger.disable();
	
	//Rename Anonymous
	// logger.renameHandle("anonymous", "renamed");
	
	console.log("handles", logger.handles);
	logger.debug("Test Logger");
}

function testHandlers(){
	
	var logger = new Logger();
	
	logger.setLevel(3);
	
	logger.addFormatter({"name": "file_fmt", "format": "%{level} %{timestamp} %{message}"});
	// console.log("formatters", logger.formatters);

	logger.addHandle({"name": "cout", "target": "rotateFile"});
	// logger.addHandle({"file": {}});
	// logger.addHandle({"file": {"target": "rotateFile", "formatter": "file_fmt"}});
	// console.log("handles", logger.handles);
	
	//Rename Anonymous
	// logger.renameAnonymousHandle("renamed");
	
	// console.log("handles", logger.handles);
	console.log(logger.getConfig());
	// logger.debug("Test Logger");
}

function test_addHandle(){
	
	var logger = new Logger();
	
	//Helpers
	logger.addFormatter({"name": "file_fmt", "format": "%{level} %{timestamp} %{message}"});
	
	//Correct
	// logger.addHandle({"handleName": []});
	// logger.addHandle({"handleName": {}});
	// logger.addHandle({"handleName": {"target": "rotateFile"}});
	// logger.addHandle({"handleName": {"target": "rotateFile", "formatter": "file_fmt"}});
	
	//Error Producing
	// logger.addHandle();
	// logger.addHandle({});
	// logger.addHandle({"handleName": ""});
	
	console.log(logger.handles);
}

function test_AddFormatter(){
	
	var logger = new Logger();
	
	//Correct
	// logger.addFormatter({"formatterName": []});
	// logger.addFormatter({"file_fmt": {"format": "%{level} %{timestamp} %{message}"}});
	
	logger.addFormatter(
		{
			"background": {"color": "red"},
			"name": "formatterName",
			"message": {
				"background": {"color": "blue"}
			},
			"timestamp": {
				// "pattern": "%Y to %m",
				// "pattern": "%ISO",
				"font": {"color": "yellow"}
			},
			"format": "%{timestamp} %{level} %{uuid} %{message}"
		}
	);
	
	//Error Producing
	
	//Helpers
	logger.addHandle({"name": "handleName", "formatter": "formatterName"});
	logger.debug("Testing formatter and placeholders");
	console.log(logger.formatters);
	
}

function test_JSON_SERIALIZER(){
	
	var logger = new Logger();
	logger.addFormatter({
		"name": "formatterName",
		"json": true,
		"fields": ["uuid", "level", "timestamp"],
		// "format": "%{timestamp} %{level} %{message}",
	});
	
	logger.addHandle({"name": "handleName", "formatter": "formatterName"});	
	logger.debug("Color Coded Log Message");
}

function test_TRANSFORM(){
	
	var logger = new Logger();
	
	//Add transformer globally
	let myTransformer = {
		"test": function(logRecord){
			return logRecord["output"].toUpperCase();
		}
	}
	logger.addTransformer(myTransformer);
	
	//Add transformer to specific formatter
	logger.addFormatter({
		"name": "formatterName",
		// "json": true,
		// "object": true,
		// "fields": ["level", "timestamp"],
		"format": "%{timestamp} %{level} %{message}",
		"transformer": function(logRecord){
			return logRecord["output"].toUpperCase();
		}
		// "transformer": "test"
	});	
	logger.addHandle({"name": "handleName", "formatter": "formatterName"});	
	
	logger.debug("Transformed Log Message");
}

function test_StringInterpolation(){
	
	let logger = new Logger();
	
	logger.log('info', 'test message');
	
	// info: test message my string {}
	logger.log('info', 'test message %s', 'my string');
	logger.info('test message %s', 'my string');
	
	// info: test message 123 {}
	logger.log('info', 'test message %d', 123);
	logger.info('test message %d', 123);

	// info: test message first second {number: 123}
	logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });
	logger.info('test message %s, %s', 'first', 'second', { number: 123 });
}

function test_Filters(){
	
	let logger = new Logger();
	
	let myFilter = {
		"test": function(logRecord){
			// console.log(logRecord);
			console.log("Filtering Out"); 
			return false;
		}
	}
	logger.addFilter(myFilter);
	// console.log(logger.filters);
	// console.log(logger.handles);
	logger.setHandleOpts({"filter": "test"});
	
	logger.info("test log message");
}

function test_ErrorEmitter(){
	
	let logger = new Logger();
	
	logger.on("logged", function(logRecord){
		console.log("Successfully Logged: " + logRecord["output"]);
	});
	
	logger.on("error", function(err, logRecord){
		console.log("Caught Emmitted Error");
		console.log(err);
		console.log(logRecord);
		
	});
	
	// logger.setOpts({"fileName": "test", "target": "file"});
	logger.debug("Log Test");
}

function test_DateParser(){
	// let str = "%Y | %%Y = %Y | %%y = %y | %%m = %m | %%d = %d | %%w = %w | %%H = %H | %%I = %I | %%M = %M | %%S = %S | %%B = %B | %%A = %A | %%b = %b | %%a = %a | %%z = %z";
	let str = "%Y\n%%Y = %Y\n%%y = %y\n%%m = %m\n%%d = %d\n%%w = %w\n%%H = %H\n%%I = %I\n%%M = %M\n%%S = %S\n%%B = %B\n%%A = %A\n%%b = %b\n%%a = %a \n%%z = %z";
	console.log(parsers.strptime(str));
	// console.log(parsers.strptime(str, "utc"));
	// console.log(parsers.strptime(str, "UTC"));
}

function test_TokenParser(){
	
	logger = Library.getLogger("anonymous");
	
	Library.addFormatter({
		"name": "formatterName",
		"timestamp": {
			// "pattern": "%Y to %m",
			"pattern": "ISO"
		},
		"timestamp": {"pattern": "%d/%b/%Y:%H:%M:%S %z"},
		"format": "%%{level} %{timestamp} %{level} %{uuid} '%{message}'"
	});
	Library.addHandle({"name": "handleName", "formatter": "formatterName"});
	
	logger.attachHandles("handleName");
	logger.detachHandles("default"); //If default is not unset it will also print
	// console.log(logger);
	// console.log(Library.handles);
	logger.log("debug", "placeholder replacement test");
}

function test_JavascriptDates(){
	console.log("toString: ", new Date().toString());
	console.log("toDateString: ", new Date().toDateString());
	console.log("toLocaleString: ", new Date().toLocaleString());
	console.log("toLocaleDateString: ", new Date().toLocaleDateString());
}

function test_LogFormats(){
	
	let logger = new Logger();	
	logger.addFormatter([
		
		//Extended Log Format		
		{
			"name": "extended",
			//   12:21:16 GET /foo/bar.html
			//   10/Oct/2000:13:55:36 +0000			
			"timestamp": {
				// "pattern": "%H:%M:%S",
				"pattern": "%d/%b/%Y:%H:%M:%S %z"
			},
			"format": "%{timestamp} %{method} %{originalUrl}"
		},		
		
		//Combined Log Format
		{
			"name": "combined",
			//   127.0.0.1 user-identifier frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
			//   :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
			"timestamp": {
				"pattern": "%d/%b/%Y:%H:%M:%S %z"
			},
			"format": '%{ip} - [%{timestamp}] "%{method} %{originalUrl} %{protocol}" %{status} %{contentLenght} %{referer} %{userAgent}'
		},
		
		//Common Log Format
		{
			"name": "common",
			//   127.0.0.1 user-identifier frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
			//   :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]
			"timestamp": {
				"pattern": "%d/%b/%Y:%H:%M:%S %z"
			},
			"format": '%{ip} - [%{timestamp}] "%{method} %{originalUrl} %{protocol}" %{status} %{contentLenght}'
		}
		
	]);
	
	//Error Producing
	
	//Helpers
	logger.addHandle({"name": "handleName", "formatter": "extended"});
	logger.disable("default");
	
	logger.info("Test Logger");
}

function test_File(){
	
	let logger = new Logger();
	
	logger.on("logged", function(logRecord){
		console.log("Event: Successfully Logged -->  " + logRecord["output"]);
	});
	logger.on("error", function(err, logRecord){
		console.log("Caught Emmitted Error");
		console.log(err);
		console.log(logRecord);
	});
	
	let directory = process.cwd();
	let fileName = "filetargettest.log";
	logger.addHandle({
		"name": "myHandle",
		"target": "file",
		"directory": directory,
		"fileName": fileName,
	});
	
	console.log("Dir: " + directory);
	logger.debug("File Target Test Line 1");
	logger.info("File Target Test Line 2");
}

function test_validateHandleOpts(){
	
	let logger = new Logger(); //logger.addFormatter({"name": "myFormatter"});
	let opts = {
		"name": "myHandle",
		"target": "rotatingFile",
		"rotationType": "periodic",
	};
	logger.validateHandleOpts(opts);
	console.log(opts);
}

function test_RotateFileLogger(){
	
	let directory = process.cwd();
	
	let logger = new Logger();
	logger.setHandleOpts({
		"target": "rotatingFile",
		"formatter": {
			"name": "myFormatter",
			"format": "%{timestamp} %{level} %{message}"
		},
		"fileName": "rotatingFileSizeTest",
		"fileNamePattern": "%{fileName}%{fileExtension}.%{logNum}",
		"directory": directory,
		"maxSize": 60,
		"maxFiles": "3",
	});
	
	logger.on("logged", function(logRecord){
		console.log("Successfully Logged --> " + logRecord["output"]);
	});
	
	setInterval(function(){
		logger.debug("File Log Test");
	}, 500);
}

function test_RESTTarget(){
	
	let logger = new Logger();
	logger.addHandle({
		"name": "RESTHandle",
		"target": "rest",
		"formatter": {
			"name": "rest_fmt", 
			"fields": ["message", "timestamp", "level"]
		},
		"url": "http://192.168.154.130/test",
		"port": 3000,
		// "method": "GET",
		"method": "POST",
	});
	
	logger.on("logged", function(err, logRecord, data){
		// console.log("Successfully Logged --> ");
		// console.log(logRecord);
	});
	
	// let randInterval = 1000 * Math.random() + 1
	setInterval(function(){
		logger.debug("File Log Test");
	}, 1234);
	
	// logger.info("Another File Log Test");
}


function test_Loggers(){
	
	logger = Library.getLogger("anonymous");
	
	// logger.configureLevels("syslog");
	// logger.setLevel("error");
	// logger.setFilter("level", {"orderOfSeverity": -1});
	// logger.log("info", "Log Test!");
	// console.log(logger.getEffectiveLevel());
	
	// logger.unsetHandles();
	// console.log(logger);
	// console.log(logger["filters"]);
	// console.log(logger["_filters"]);
	
	Library.on("logged", function(logRecord){
		// console.log(logRecord);
		console.log("Successfully Logged: " + logRecord["output"]);
	});
	
	Library.addFormatter({
		"name": "myFormatter",
		"format": "%{timestamp} %{level} - %{message}",
	});
	
	Library.addHandle({
		
		"name": "myHandle",
		"formatter": "myFormatter",
		
		"target": "console",
		// "target": "null",
		// "target": "file",
		// "target": "rotatingFile",
		
		// "interval": "day",
		// "fileNamePattern": "test.%Y-%b.log",
		// "maxSize": 50,
		// "fileNamePattern": "test_%{logNum}_log",
		
		// "target": "rest",
		// "url": "http://192.168.154.130/test", //+ paramsStr,
		// "port": 3000,
		// "method": "GET",
		// "method": "POST",
		
		"emitEvents": true,
	});
	
	logger.attachHandles("myHandle");
	logger.detachHandles("default"); //If default is not unset it will also print
	// logger.setHandles("null");
	
	Library.setUncaughtOpts({
		// "handleUncaught": false,
		// "handleUncaught": true,
		// "exitOnUncaught": false,
		// "exitOnUncaught": true,
	});
	
	// throw Error("Testing uncaught exception handler");
	
	logger.log("info", "Log Message Test!");
	// console.log(logger);
	// console.log("Continued...");
}

function test_MiddleWare(){
	
	var http = require('http');
	var querystring = require('querystring');

	//!Load express middleware
	var express = require('express');
	var app = express();

	//!Support json/url encoded bodies
	var bodyParser = require('body-parser');
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	// logger = Library.getLogger("anonymous");
	app.use(Library.mw({"name": "mw", "logOnRequest": false}));
	app.use(function(req, res, next) {
		// console.log("Middleware called");
		next()
	});
	
	app.get("/", function(req, res, next){
		res.send("Accessed Homepage @ " + (new Date()));
		res.end();
	});
	
	app.get("/test", function(req, res, next){
		res.send("Accessed Test Page @ " + (new Date()));
		res.end();
	});

	app.post("/test", function(req, res, next){
		
		let message = "\nReceived 'POST' with Content-Type: " 
		+ req.header("Content-Type") + "Content-Length: " 
		+ req.header("Content-Length");
		
		console.log(message);
		console.log("Payload: ", req.body);
		
		res.send(message);
	});

	const NODE_HTTP_PORT = 3000;
	var httpServer = http.createServer(app);
	httpServer.listen(NODE_HTTP_PORT, function(){
		console.log('HTTP Server listening on port ' + NODE_HTTP_PORT);
	});
	
}

function old_test_Colorizers(){
	
	var logger = new Logger();
	
	//Helpers
	logger.addFormatter([
		{
			"name": "level",
			"colorMap": {
				"error": {"font": {"color": "red", "modifiers": ["bold"]}},
				"warn": {"font": {"color": "yellow", "modifiers": ["bold"]}},
				"warning": {"font": {"color": "yellow", "modifiers": ["bold"]}},
				"info": {"font": {"color": "purple", "modifiers": ["bold"]}},
				"verbose": {"font": {"color": "blue", "modifiers": ["bold"]}},
				"debug": {"font": {"color": "green", "modifiers": ["bold"]}},
			}
		},
		{
			"name": "formatterName",
			"message": {
				// "background": {"color": "blue"}
			},
			"timestamp": {
				"pattern": "%Y to %m",
				// "pattern": "ISO",
				"font": {"color": "yellow"}
			},
			"format": "%{timestamp} %{level} %{message}"
		}
	]);
	
	logger.addHandle({"name":"handleName", "formatter": "formatterName"});
	
	let colorOpts = {
		"error": "red bgcyan", 
		"warning": ["yellow", "underline", ""], 
		"info": "purpleBright", 
		"verbose": "bgblue", 
		"debug": "green"		
	};
	// logger.setLevelColors(colorOpts);
	
	logger.error("Color Coded Log Message");
	logger.warn("Color Coded Log Message");
	logger.info("Color Coded Log Message");
	logger.verbose("Color Coded Log Message");
	logger.debug("Color Coded Log Message");
	
	// console.log(logger.formatters);
	// console.log(logger.formatters["level"]["colorMap"]);
}

function test_Colorizers(){
	
	logger = Library.getLogger("anonymous");
	
	Library.on("logged", function(logRecord){
		// console.log(logRecord);
		// console.log("Successfully Logged: " + logRecord["output"]);
	});
	
	var colorMap = {
		
		"error": 	"redBright", 
		"warning": 	"yellowBright", 
		"info": 	"purpleBright", 
		"verbose": 	"blueBright", 
		"debug": 	"greenBright",
		
		"error": "red bgcyan", 
		"warn": ["yellow", "underline", ""], 
		"warning": ["yellow", "underline", ""], 
		"info": "purpleBright", 
		"verbose": "bgblue", 
		"debug": "green"	
	};
	
	// Library.colorizeLevels();
	Library.colorizeLevels(colorMap);
	// Library.decolorizeLevels("npm");
	// Library.decolorizeLevels();

	logger.log("error", "Color Coded Log Message");
	logger.log("warn", 	"Color Coded Log Message");
	logger.log("info", 	"Color Coded Log Message");
	logger.log("verbose", "Color Coded Log Message");
	logger.log("debug", "Color Coded Log Message");
}

function generalTest(){
	
	Loggerize.addHandle({
		"emitEvents": true,
		"name": "myHandle",
		"formatter": {
			"name": "ancestorFmt",
			"format": "%{level} %{message} | %{loggerName}"
		}
	});
	
	let rootLogger = Loggerize.getRootLogger();
	rootLogger.setLevel("silly");
	rootLogger.attachHandles("myHandle");
	
	let myGrandParent = Loggerize.createLogger("myGrandParent");
	myGrandParent.setLevel("warn");
	myGrandParent.attachHandles("myHandle");
	myGrandParent.detachHandles("default");
	
	let myParent = Loggerize.createLogger("myGrandParent.myParent");
	myParent.setLevel("info");
	myParent.attachHandles("myHandle");
	myParent.detachHandles("default");
	
	let myChild = Loggerize.createLogger("myGrandParent.myParent.myChild");
	myChild.setLevel("debug");
	myChild.attachHandles("myHandle");
	myChild.detachHandles("default");
	
	// myChild.warn("Log Message Test!");
	// myChild.info("Log Message Test!");
	myChild.debug("Log Message Test!");
	
}

function generalTest2(){
	
	Loggerize.addHandle([{
		"emitEvents": true,
		"name": "myHandle",
		"target": "console",
		"formatter": {
			"name": "ancestorFmt",
			"format": "%{level} %{message} | %{loggerName}"
		}
	},{
		"emitEvents": true,
		"name": "myHandle2",
		"levelMapper": "defcon",
		"target": "console",
		"formatter": {
			"name": "ancestorFmt",
			"format": "%{level} %{message} | %{loggerName}"
		}
	}]);
	
	let myParent = Loggerize.createLogger("myGrandParent.myParent");
	myParent.setLevelMap("defcon");
	myParent.setLevel("defcon5");
	myParent.attachHandles("myHandle2");
	myParent.detachHandles("default");
	// console.log(myParent);
	
	let myChild = Loggerize.createLogger("myGrandParent.myParent.myChild");
	myChild.setLevel("debug");
	myChild.attachHandles("myHandle");
	myChild.detachHandles("default");
	
	//Log and send up ancestor tree
	myChild.log("debug", "Log Message Test!");
	
}

function generalTest3(){
	
	var logDir =  path.join(__dirname, "logs" + path.sep);
	
	subject = require('../lib/logger.js'); //Singleton Logger Instance
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
	let targetPath = path.join(logDir, "test.log.1");
	
	subject.on("logged", function(logRecord){
		// return;
		//Set options and Delete target file if already exists
		fs.stat(targetPath, function(err, stats){
			
			if (err){
				throw err;
			}
			
			//Read file contents to assert it was written successfully
			fs.readFile(targetPath, {"encoding": "utf8"}, function (err, data){
				
				//Check for error
				if (err){ throw err; }
				
				//Assert File contents match expected
				let actual = data;
				let expected = "info Rotating File (Size)" + os.EOL;
				// assert.equal(actual, expected);
				
				//Remove just created file
				// fs.unlinkSync(targetPath);
				
				//Declare asynchronous code finished
				// done();
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
			"message": "Rotating File (Size)",
		};
		subject.render(mockLogRecord, subject.handles["myHandle"]);
		
	});

}

function generalTest4(){
	
	var PORT = 3000;
	var server = http.createServer(function (req, res){
		
		var pathname = url.parse(req.url).pathname;
		
		if (req.method === 'POST') {
			let body = "";
			req.on('data', function(chunk){
				body += chunk.toString();
			});
			req.on('end', () => {
				
				let message = "\nReceived 'POST' with Content-Type: " 
				+ req.getHeader("Content-Type") + "Content-Length: " 
				+ req.getHeader("Content-Length");
				
				console.log(message);
				console.log("Payload: ", querystring(body));
				
				res.end(message);
			});
		}
		else{
			// Send the HTTP header 
			// HTTP Status: 200 : OK
			// Content Type: text/plain
			res.writeHead(200, {'Content-Type': 'text/plain'});
			
			if (pathname == "/"){
				// Send the response body as "Hello World"
				res.end("Accessed Homepage @ " + (new Date()));
			}
			if (pathname == "/test"){
				// Send the response body as "Hello World"
				res.end("Accessed Test Page @ " + (new Date()));
			}
			
			//Graceful shutdown
			// server.close(() => {
				// console.log('Http server closed.');
			// });
		}
	}).listen(PORT);

	// Console will print the message
	console.log("Server running at http://127.0.0.1:" + PORT + "/");
}

function profiler(){
	
	Library.addHandle({
		"name": "myHandle",
		"formatter": "simple",
		"target": "console",
		"target": "null",
	});
	
	logger = Library.getLogger("anonymous");
	logger.detachHandles("default");
	logger.attachHandles("myHandle");
	
	let testName = "Log Rate";
	let iterations = 10000;
	
	let start = (new Date()).getTime();
	for (var i = 0; i < iterations; i++){
		logger.log("info", "Log Message Test!");
		if ((new Date()).getTime() - start > 1000){
			break
		}
	}
	
	console.log((new Date()).getTime() - start);
}

function profilerRate(){
	
	Library.addHandle({
		"name": "myHandle",
		// "formatter": "simple",
		"formatter": {"name": "myFormatter", "format": "%{timestamp} %{level} %{uuid} %{message}"},
		// "target": "console",
		"target": "null",
	});
	
	logger = Library.getLogger("anonymous");
	logger.detachHandles("default");
	logger.attachHandles("myHandle");
	
	let start = (new Date()).getTime();
	let i = 0;
	while(++i){
		logger.log("info", "Log Message Test!");
		if ((new Date()).getTime() - start >= 1000){
			break
		}
	}
	
	console.log("logs/sec: " + i);
}

function testRequestListener(){
	
	var myReqListener = Loggerize.createRequestListener("myReqListenerBoy");
	
	var PORT = 3000;
	var server = http.createServer(function (req, res){
		
		// Loggerize.reqListener(req, res); //Shortcut way
		// myReqListener.requestListener(req, res); //After creating own logger
		
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
				res.end("Received GET Request");
			}
		}
		
		//Gracefully shutdown server
		// server.close(function(){ console.log('Http server closed.'); });
		
	}).listen(PORT);
	
	// Console will print the message
	console.log("Server running at http://127.0.0.1:" + PORT + "/");
}

// profilerRate();
// profiler();
// test_Colorizers();
// test_Loggers();
// test_MiddleWare();
// generalTest();
// generalTest2();
// generalTest3();
// generalTest4();
testRequestListener();

// test_RESTTarget();
// test_RotateFileLogger();

// testLog();
// testAnonymous();
// testHandlers();
// test_addHandle();
// test_AddFormatter();
// test_Colorizers();
// test_JSON_SERIALIZER();
// test_TRANSFORM();

//Test Features
// test_StringInterpolation();
// test_Filters();
// test_ErrorEmitter();
// test_DateParser();
// test_TokenParser();
// test_LogFormats();
// test_File();
// test_validateHandleOpts();


