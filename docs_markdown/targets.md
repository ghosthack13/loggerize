## TARGETS

Targets are the destinations where the logRecord will be written. Loggerize's 
predefined targets comprise: `console`, `file`, `rotatingFile` (interval/size), 
and `http`. Targets are defined on handles and that handle *manages* what 
properties the target will have.

### Console Target

The console targets is the simplest. When set, the logger will send log output 
to the console.

```javascript
// @filename targe-console.js
var Loggerize = require("../../lib/index.js");

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
table below for config options available on the handle when using the file target.

#### File Target Configuratons

| Field			| Default				| Description	|
| ------------- | --------------------- | ------------- |
| directory 	| './logs/' 			| Directory in which to store log files	|
| fileName		| Source file name		| Name of the file without extension	|
| fileExtension	| '.log' or extension of file if fileName explicitly defined | The last period '.' and subsequent characters of the filename |
| path 			| Not Set 				|Set the directory, fileName, and fileExtension all in one go |

```
// @filename target-file.js
var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		target: "file",	//Set target to file
		// directory: './logs/',	//Default directory as current directory
		// fileName: 'target-file', //Default fileName from source
		// fileExtension: '.log',   //Default fileExtension
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
```

Loggerize tries to guess your intention and the file target will try to guess them as follows
1. 	If the `directory` is not explicitly set it will default to the a directory called 'logs' 
	in the current working directory
2. If the `fileName` is not set, it will default to the file name of the main proces
3. If the `fileExtension` is not explicitly set Loggerize will default it as follows:
	- If `fileName` *is* set *with* an extension, `fileExtension` will default to 
		the extension on the `fileName`
	- If `fileName` *is* set *without* an extension, `fileExtension` will default to '.log'
	- If `fileName` *is not* set , `fileExtension` will default to '.log'


Loggerize can also deduce the desired target and options if only passed a `path`.

```javascript
// @filename target-file-path.js
var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		path: './logs/filelogtest.log',
		// target: "file",			//target is set to 'file' by default if path is set w/o rotation options
		// directory: './logs/',	//directory is deduced based on the path that is set
		// fileName: 'filelogtest',	//fileName is deduced based on the path that is set
		// fileExtension: '.log'	//fileExtension is deduced based on the the fileName that is based on the path that is set
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

#### Rotating File (Interval) Configuratons

The table below list the config options made available when using the rotating 
file (interval) target.

| Field			| Default				| Description	|
| ------------- | --------------------- | ------------- |
| rotationType 	| 'interval' 			| Declares the type of rotation the log file will undergo	|
| interval	 	| 'day'		 			| Determines the rate at which logs will rotate. Valid intervals: 'year', 'month', 'week', 'day', 'hour', 'minute', 'second'	|
| rotateDay	 	| 'Sunday'		 		| Day on which to rotate if interval is set to 'week' |
| directory 	| './logs/' 			| The directory in which to store log files	|
| fileName		| Name of source file	| The name of the file without extension	|
| fileNamePattern | Not Set		 		| A fine-grained pattern to name the log file. Supports [Date/Time Directives](#date-time-directives)	|
| fileExtension	| '.log' or extension of file if fileName explicitly defined | The last period '.' and subsequent characters of the filename |
| path 			| Not Set 				| Can be used to set directory, fileName, and fileExtension in one line	|

```javascript
// @filename target-rotatefile-interval.js
var Loggerize = require("../../lib/index.js");

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
Valid rotation intervals comprise: "year", "month", "day", "hour", "minute", "second".
The rotatingFile target will append the date before the file extension in the form,
'fileName_Year_Month_Date_HOUR_MINUTE_SECOND.log'. Hence if the current date is 
January 20th, 2030, and the `fileName` is called 'test', the file produced will 
be 'test_2030_01_20.log'.

Additionally the rotatingFile target allows fine-grained `fileNamePattern`s. 
The above example can be thought to be using the `fileNamePattern` defined by 
"%\{fileName\}\_%Y_%m_%d%\{fileExtension\}", where %\{fileName} is the name of 
the file, and %\{fileExtension\} is the file extension. See 
[Date/Time Directives](#date-time-directives) in the Formatters section for 
more details on the %Y, %m, %d%.

Alternatively, the `fileNamePattern` could have defined as 
"%\{fileName}-%Y-%b%\{fileExtension}" which would have produced 
a file called 'target-rotatefile-interval-2030-Jan.log'. 

#### Rotating File (size) Configuratons

Loggerize supports rotating files by size. The table below displays the options 
available when using the rotating file (size) target.

| Field			| Default				| Description	|
| ------------- | --------------------- | ------------- |
| rotationType 	| 'size' 				| Declares the type of rotation the log file will undergo	|
| maxSize	 	| `Number.POSITIVE_INFINITY`| Designates the maximum size a log file will become	|
| maxFiles	 	| `Number.POSITIVE_INFINITY`| Designates the maximum number of log files that will exists |
| directory 	| './logs/' 			| The directory in which to store log files	|
| fileName		| Name of source file	| The name of the file without extension	|
| fileNamePattern | Not Set		 		| A fine-grained pattern to name the log file. Supports [Date/Time Directives](#date-time-directives)	|
| fileExtension	| '.log' or extension of file if fileName explicitly defined | The last period '.' and subsequent characters of the filename |
| path 			| Not Set 				| Can be used to set directory, fileName, and fileExtension in one line	|

```javascript
// @filename target-rotatefile-size.js
var Loggerize = require("../../lib/index.js");

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

If maxSize or maxFiles are left undefined when rotating by size, these values will default 
to `Number.POSITIVE_INFINITY`. Not setting maxSize/maxFiles thus effectively causes the rotatingFile target
to behave exactly like the standard [File Target](#file-target).


### HTTP Target

Loggerize supports sending logRecords to HTTP(S) servers across a local network or across the internet.
See the table below for options available when using the HTTP target.

#### HTTP Configuratons

| Field			| Default					| Description	|
| ------------- | ------------------------- | ------------- |
| url			| User Defined				| Required. The address of the network/internet resource |
| port			| 80 (HTTP) or 443 (HTTPS)	| A network endpoint of communication	|
| method		| 'POST'					| The desired HTTP method	|
| headers		| `{"User-Agent": "Remote Logger"}` | HTTP Headers to include in requests |
| allowInsecure	| Not Set 					| If true allows log to be sent using the unencrypted HTTP protocol |

```javascript
var Loggerize = require("../../lib/index.js");

Loggerize.on("logged", function(logRecord){
	console.log(logRecord["response"]);
});

let logger = Loggerize.createLogger({
	"name": "myLogger",
	"handle": {
		name: "myHandle",
		target: "http",		//Set target to http
		url: "http://localhost/logreceiver", //Set url that will receive the logRecord
		port: 3000,		//port defaults to 443 for HTTPS requests and defaults to 80 for HTTP requests
		// method: 'POST',	//HTTP method defaults to POST
		allowInsecure: true,
		emitEvents: true,
	}
});

logger.info("Log Message Test!");
```

The only mandary property that the http target expects is the url which must 
include the protocol (http or https). If the HTTP method is not set, the method 
will default to `GET` and the logRecord contents will be url encoded and passed 
in the log request. Conversely if the HTTP method is set to `POST`, the logRecord 
contents will be serialized and passed as a payload.

The port will be deduced from the protocol used in the url if no port is explicitly 
set. The port can be set both as a handle property as seen above or it can be defined 
inside the url as in `"https://localhost:3000/logreceiver"`. If the port is defined 
on both the handle and inside the url, the port defined on the handle will override 
the one in the url.

Loggerize also allows user defined headers to be defined on the handle. If no 
headers set, the headers will default to `{User-Agent: loggerize/1.0}`.
If the user defines a 'User-Agent', this default user agent will be overwritten.










