## TARGETS

Targets are the destinations where the log output will be written. Loggerize's 
predefined targets comprise: `console`, `file`, `rotatingFile` (interval/size), 
and `http`. Targets are set on handles using the target property and that handle 
*manages* what properties the target will have.

### Console Target

To send log output to the terminal, set the target property to 'console'.

```javascript
// @filename target-console.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		"name": "myHandle",
		"target": "console"
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
```

### File Target

The file target writes output to a standard text file. If the save location is 
not explicitly set, Loggerize will automatically define properties such as 
directory and filename according to standard programming conventions. See the 
table below for additonal config options available on the handle when using the 
file target.

#### File Target Configurations

| Field			| Default				| Description	|
| ------------- | --------------------- | ------------- |
| directory 	| './logs/' 			| Directory in which to store log files	|
| fileName		| Source file name		| Name of the file without extension	|
| fileExtension	| '.log' or extension of file if fileName explicitly defined | The last period '.' and subsequent characters of the filename |
| path 			| Not Set (and not needed)	|Set the directory, fileName, and fileExtension all in one go |

The example below configures a handle with a target set to 'file'. The example 
also explicitly sets the directory, fileName and fileExtension though they are 
not needed as it would have been set to the same values by default if not 
explicitly stated.

```
// @filename target-file.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		target: "file",			 //Set target to file
		directory: './logs/',	 //Explicitly set to what would be the default
		fileName: 'target-file', //Explicitly set to what would be the default
		fileExtension: '.log',   //Explicitly set to what would be the default
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
```

When file configurations are not explicitly set, Loggerize tries to guess your 
intentions as follows:
1. 	If the `directory` is not explicitly set it will default to the a directory called 'logs' 
	in the current working directory
2. If the `fileName` is not set, it should default to the file name of the source file.
3. If the `fileExtension` is not explicitly set Loggerize will default it as follows:
	- If `fileName` *is* set *with* an extension, `fileExtension` will default to 
		the extension on the `fileName`
	- If `fileName` *is* set *without* an extension, `fileExtension` will default to '.log'
	- If `fileName` *is not* set , `fileExtension` will default to '.log'


Loggerize can also deduce the desired target and options if only passed a `path`.

```javascript
// @filename target-file-path.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		path: './logdir/filelogtest.logext',
		// target: "file",			//target is set to 'file' by default if path is set w/o rotation options
		// directory: './logdir/',	//directory is deduced based on the path that is set
		// fileName: 'filelogtest',	//fileName is deduced based on the path that is set
		// fileExtension: '.logext'	//fileExtension is deduced based on the the fileName that is based on the path that is set
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
```

### Rotating File Target

Loggerize supports rotating file targets by interval and size. File rotations are 
activated by using the `rotatingFile` field in the handle's config. You can 
explicitly state the desired rotation type using `rotationType` field. The 
`rotationType` does not have to explicitly be set however, as Loggerize will 
automatically deduce a `rotationType` of interval if the interval or rotateDay 
fields are declared, and neither the maxFiles nor maxSize fields are present. 
Conversely `rotationType` will automatically be set to 'size' if either the 
maxFiles or maxSize fields are set and not the interval field.

#### Rotating File (Interval) Configurations

The table below list the config options made available when using the rotating 
file (interval) target.

| Field			| Default				| Description	|
| ------------- | --------------------- | ------------- |
| rotationType 	| 'interval' 			| Declares the type of rotation the log file will undergo	|
| interval	 	| 'day'		 			| Determines the rate at which logs will rotate. Valid intervals: 'year', 'month', 'week', 'day', 'hour', 'minute', 'second'	|
| rotateDay	 	| 'Sunday'		 		| Day on which to rotate if interval is set to 'week' |
| directory 	| './logs/' 			| The directory in which to store log files	|
| fileName		| Name of source file	| The name of the file without extension	|
| fileExtension	| '.log' or extension of file if fileName explicitly defined | The last period '.' and subsequent characters of the filename |
| path 			| Not Set 				| Can be used to set directory, fileName, and fileExtension in one line	|
| fileNamePattern | Not Set		 		| A fine-grained pattern to name the log file. Supports [Date/Time Directives](#date-time-directives)	|

```javascript
// @filename target-rotatefile-interval.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		target: "rotatingFile",	//Set target to rotatingFile
		rotationType: "interval",	//Set rotation type to rotate on an interval
		// interval: 'day',			//interval defaults to rotate on a daily basis if not explicitly set
		// directory: "./logs",		//Default directory
		// fileName: 'target-rotatefile-interval', //Default fileName
		// fileExtension: '.log',   //Default fileExtension
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
```

The default interval period is every day at 12:00 a.m. local time. 
The rotatingFile target will append the date before the file extension in the 
form, \<filename>\_\<year>\_\<month>\_\<date>\_\<hour>\_\<minute>\_\<second>.log
Hence if the current date is January 20th, 2030, and the `fileName` is called 
'test' that is rotated by day, the file produced will be 'test_2030_01_20.log'.

Additionally the rotatingFile target allows fine-grained `fileNamePattern`s. 
The above example can be thought to be using the `fileNamePattern` defined by 
"%\{fileName\}\_%Y_%m_%d%\{fileExtension\}", where %\{fileName} is the name of 
the file, and %\{fileExtension\} is the file extension. See 
[Date/Time Directives](#date-time-directives) in the Formatters section for 
more details on the %Y, %m, %d%.

Alternatively, the `fileNamePattern` could have defined as 
"%\{fileName}-%Y-%b%\{fileExtension}" which would have produced 
a file called 'target-rotatefile-interval-2030-Jan.log'. 

#### Rotating File (Size) Configurations

Loggerize supports rotating files by size. The table below displays the options 
available when using the rotating file (size) target.

| Field			| Default				| Description	|
| ------------- | --------------------- | ------------- |
| rotationType 	| 'size' 				| Declares the type of rotation the log file will undergo	|
| maxSize	 	| `Number.POSITIVE_INFINITY`| Designates the maximum size a log file will become	|
| maxFiles	 	| `Number.POSITIVE_INFINITY`| Designates the maximum number of log files that will exists |
| directory 	| './logs/' 			| The directory in which to store log files	|
| fileName		| Name of source file	| The name of the file without extension	|
| fileExtension	| '.log' or extension of file if fileName explicitly defined | The last period '.' and subsequent characters of the filename |
| path 			| Not Set 				| Can be used to set directory, fileName, and fileExtension in one line	|
| fileNamePattern | Not Set		 		| A fine-grained pattern to name the log file. Supports [Date/Time Directives](#date-time-directives)	|

```javascript
// @filename target-rotatefile-size.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		target: "rotatingFile",	//Set target to rotatingFile
		rotationType: "size",	//Set rotation type to rotate on file size limit
		maxSize: "100 MB",		//Set file to rotate when file size exceeds 100 MB
		maxFiles: "10", 			//Set max file rotations to 10
		// directory: "./logs",		//Default directory
		// fileName: "target-rotatefile-size",
		// fileExtension: '.log',   //Default fileExtension
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
```

The above example rotates the target log file every 100 MB as stipulated by maxSize. 
maxSize accepts almost any reasonable size declaration as it ignores whitespace 
and is case-insensitive. Therefore "100mb", "100Mb", "100000kB", "104857600 b" 
and 104857600 (raw numeric values are treated as bytes) are all interpreted as 
100 megabytes. The maxFiles option accepts any number or string that can be parsed 
as an integer.

By default the rotatingFile target will append the `logNum` to the end of the filename 
(after the extension). Hence the above example will produce a file named 
'target-rotatefile-size.log.1'. `logNum` starts at 1.

The rotating file (size) target also allows fine-grained fileNamePatterns. The 
above example can be thought of as using the `fileNamePattern` defined by 
"%\{fileName\}\%{fileExtension\}.\%{logNum\}" (Note the period, '.', before `logNum`).

Alternatively the property `fileNamePattern` could have been added to the handle and defined as 
`fileNamePattern: "%{fileName}.%{logNum}%{fileExtension}"` which would have produced a file called 
'example.1.log'.

**Note:** 

If maxSize is not explicitly set when rotating by size, it will default to 
`Number.POSITIVE_INFINITY`. Not setting maxSize thus effectively causes the 
rotatingFile target to behave exactly like the standard [File Target](#file-target).


### HTTP Target

Loggerize supports sending log data to HTTP(S) servers across a local network 
or across the internet. See the table below for options available when using 
the HTTP target.

#### HTTP Configurations

| Field			| Default					| Description	|
| ------------- | ------------------------- | ------------- |
| url			| User Defined				| Required. The address of the network/internet resource |
| port			| 80 (HTTP) or 443 (HTTPS)	| A network endpoint of communication	|
| method		| 'POST'					| The desired HTTP method	|
| headers		| `{"User-Agent": "loggerize/<version>"}` | HTTP Headers to include in requests |
| allowInsecure	| `false` 					| If true allows log to be sent using the unencrypted HTTP protocol |

```javascript
// @filename target-http.js
// Assuming a server is running on localhost:3000
var Loggerize = require("loggerize");

Loggerize.on("logged", function(logRecord){
	let response = logRecord["response"];
	console.log("Server Response:", response);
});

let logger = Loggerize.createLogger({
	"name": "myLogger",
	"handle": {
		name: "myHandle",
		target: "http",		//Set target to http
		url: "http://localhost/logreceiver", //Set url that will receive the logRecord
		port: 3000,		//port defaults to 443 for HTTPS requests and defaults to 80 for HTTP requests
		method: 'POST',	//HTTP method defaults to POST
		allowInsecure: true, //allow unencrypted http traffic
		emitEvents: true,
	}
});

logger.info("Log Message Test!");
```

The only mandary property that the http target expects is the url which must 
include the protocol (http or https). If the HTTP method is not set, the method 
will default to `GET` and the log data will be url encoded and passed in the 
log request. Conversely if the HTTP method is set to `POST`, the log data will 
be serialized and passed as a payload.

The port will be deduced from the protocol used in the url if no port is explicitly 
set. The port can be set both as a handle property as seen above or it can be defined 
inside the url as in `"https://localhost:3000/logreceiver"`. If the port is defined 
on both the handle and inside the url, the port defined on the handle will override 
the one in the url.

Loggerize also allows user defined headers to be defined on the handle. If no 
headers set, the headers will default to `{User-Agent: loggerize/<version>}`.
If the user defines a 'User-Agent', this default user agent will be overwritten.

The above example also introduced the concept of the [event](#events) and the 
[logRecord](#the-logrecord-advance). Loggerize uses events to report the status 
of log attempts. When using the http target, it is advised to listen for the 
'logged' event which returns a logRecord with the server's response.

## User-Defined Targets (Advance)

Where loggerize shines is its ease of configurability. To create a custom target 
requies nothing more than an anonymous function.

### A Simple Target

The simplest target is one that does nothing (a null target). The job of a null 
target is to drop all logs that pass through it. This may be useful for some 
test and profiling purposes, but is useless in production mode.

```javascript
var Loggerize = require("loggerize");

var myTarget = function(){};

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		"name": "myHandle",
		"target": myTarget
	}
});

logger.info("Log Message Test!");	//Output => ''
```

### A Practical Target

The null target defined above is not useful in production. To create a target 
that actually does something meaningful, let us add some more parameters.

```javascript
var Loggerize = require("loggerize");

var myTarget = function(logRecord){
	let output = logRecord["output"] + "\n";
	process.stdout.write(output);
};

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		"name": "myHandle",
		"target": myTarget
	}
});

logger.info("Log Message Test!");	//Output => ''
```

The example above makes use of the fact that the 
[LogRecord](logrecord.md#the-logrecord-advance) is passed as the first 
argument of all targets in loggerize. The 'output' field of the logRecord 
contains the *formatted* log information in string format. We created a 
*useful* target that outputs the formatted data to the standard output.

### A Robust Target

To create a more robust target we should add some error checking and emit events 
when things go right and when things go wrong.

```javascript
var Loggerize = require("loggerize");

var myTarget = function(logRecord, handleOpts){
	try{
		let output = logRecord["output"] + "\n";
		process.stdout.write(output);
		
		//emit success events 
		handleOpts["_emitter"].emit("logged", logRecord);
	}
	catch(err){
		//emit error events
		handleOpts["_emitter"].emit("error", err, logRecord);
	}
};

let logger = Loggerize.createLogger({
	name: "myLogger",
	emitEvents: true,
	handle: {
		"name": "myHandle",
		"target": myTarget,
		"emitEvents": true
	}
});

logger.on("logged", function(logRecord){
	console.log("logged logRecord: \n", logRecord);
});

logger.on("error", function(err, logRecord){
	console.log("Error: ", err.message);
});

logger.info("Log Message Test!");	//Output => ''
```

In loggerize you only use what you need. To create a more robust target, we need 
to take into account errors. Loggerize allows targets to emit events on both 
success and errors, instead of having the program crash by default.

All targets have their handle's configuration passed to them as the second 
parameter of the target's function definition. This 'handleOpts' has all the 
configurations you defined plus a few additional features such as the '_emitter' 
property which implements an 'emit' function you can use to easily emit events. 

### An Extended Target

Now that we have seen a robust target, let us have look at a target that also 
uses a third party library to extend its functionality. Previous targets all used 
Node's built in libaries to create user-defined targets. Sometimes, however, it is 
necessary to use third party libraries to create new targets. 

The example below shows a user-defined target that utilizes the 
[mysql](https://www.npmjs.com/package/mysql) library to access and save logs to 
a MySQL server.

```javascript
var mysql      = require('mysql');
var Loggerize = require("loggerize");

//Create custom target
var myTarget = function(logRecord, handleOpts){
	
	//Make timestamp's ISO Date MySQL compatible by removing the trailing 'Z'
	logRecord["timestamp"] = logRecord["DateObj"].toISOString().replace("Z", "");
	
	//Remove fields from logRecord that do not correspond to a table header
	delete logRecord["DateObj"];
	delete logRecord["output"];
	
	//Create connection object
	var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'nodeuser',
		password : '',
		database : 'test',
	});

	//Initiate connection
	connection.connect();
	
	//Create Query with placeholder
	var sql = "INSERT INTO `test`.`logs` SET ?";
	
	//Execute Query
	connection.query(sql, logRecord, function(err, result){
		
		//Add result to 'result' field of logRecord to be emitted
		logRecord["result"] = result;
		
		if (err){
			throw err;
			handleOpts["_emitter"].emit("error", err, logRecord);
		}else{
			handleOpts["_emitter"].emit("logged", logRecord);
		}
	});
	
	//Close Connection
	connection.end();
};


let logger = Loggerize.createLogger({
	name: "myLogger",
	emitEvents: true,
	handle: {
		"name": "myHandle",
		"target": myTarget,
		"emitEvents": true
	}
});

logger.on("logged", function(logRecord){
	console.log("logRecord", logRecord);
});

logger.on("error", function(err, logRecord){
	console.log("Error: ", err.message);
});

logger.info("Log Message Test!");
```

The above is the naive solution to creating logs in a MySQL server. More 
experienced developers may have realized that the MySQL connection will be 
created on each log call (which is highly inefficient). Continue reading 
for the non-naive approach.

### A Bespoke Target

To create a production ready, scalable user-defined target we can take advantage 
of one of Javascript's unique features, the fact that a function definition has 
visibility to all variables declared in the same scope of the function 
definition. This means we can move the creation of the connection object to the 
outside of the target function yet still maintain the same functionality.

```javascript
var mysql      = require('mysql');
var Loggerize = require("loggerize");

//Create connection object
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'nodeuser',
	password : '',
	database : 'test',
});

//Initiate connection
connection.connect();


//Create custom target
var myTarget = function(logRecord, handleOpts){
	
	//Make timestamp's ISO Date MySQL compatible by removing the trailing 'Z'
	logRecord["timestamp"] = logRecord["DateObj"].toISOString().replace("Z", "");
	
	//Remove fields from logRecord that do not correspond to a table header
	delete logRecord["DateObj"];
	delete logRecord["output"];
	
	//Create Query with placeholder
	var sql = "INSERT INTO `test`.`logs` SET ?";
	
	//Execute Query
	connection.query(sql, logRecord, function(err, result){
		
		//Add result to 'result' field of logRecord to be emitted
		logRecord["result"] = result;
		
		if (err){
			throw err;
			handleOpts["_emitter"].emit("error", err, logRecord);
		}else{
			handleOpts["_emitter"].emit("logged", logRecord);
		}
	});
	
};


let logger = Loggerize.createLogger({
	name: "myLogger",
	emitEvents: true,
	handle: {
		"name": "myHandle",
		"target": myTarget,
		"emitEvents": true
	}
});

logger.on("logged", function(logRecord){
	console.log("logRecord", logRecord);
});

logger.on("error", function(err, logRecord){
	console.log("Error: ", err.message);
});

logger.info("Log Message Test!");	//Output => ''

//Close Connection
connection.end();
```













