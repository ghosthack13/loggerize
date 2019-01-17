## TARGETS
Targets are the destinations where the logRecord will be written. Loggerize's predefined targets comprise:
`console`, `file`, `rotatingFile` (interval/size), and `http`. Targets are defined on handles and that handle 
*manages* what properties that target will have.

See below for the properties made available on the handle whe using the predefined targets.

### Console Target
The console targets is the simplest. When set the logger will send log output to the console.
```javascript
var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger({ "name": "myLogger", "hasHandles": false });
logger.attachHandles({
	"name": "myHandle",	
	"target": "console" //Set the target of handle to 'console'
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
```

### File Target

The file target is equally simple and as one only needs to declare 'file' in the target property to use the file target.
If not explicitly set, Loggerize will automatically define properties such as directory and filename according to standard
programming conventions. See the below table config options available when using the file target.

#### File Config Options

| Field			| Default				| Description	|
| ------------- | --------------------- | ------------- |
| path 			| Not Set 				| Can be used to set directory, fileName, and fileExtension in one line	|
| directory 	| './logs/' 			| The directory in which to store log files	|
| fileName		| Name of source file	| The name of the file without extension	|
| fileExtension	| '.log' or extension of file if fileName explicitly defined | The last period '.' and subsequent characters of the filename |


```
// @filename example.js
var Loggerize = require("../lib/index.js");
let logger = Loggerize.createLogger({"name": "myLogger", "hasHandles": false});
logger.attachHandles({
	name: "myHandle",
	target: "file",				//Set the target of handle to 'console'
	//directory: './logs/',		//Default directory if not explicitly set
	//fileName: 'example',		//Default fileName if not explicitly set
	//fileExtension: '.log'		//Default fileExtension if not explicitly set
});
logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'
```

Loggerize tries to guess your intention and the file target will try to guess them as follows
1. If directory is not explicitly set it will default to the a directory called 'logs' in the current working directory
2. If fileName is not set, it will default to the file name of the main proces
3. Loggerize handles file extensions as follows:
	- If fileExtension is not set and 'fileName' is set WITH an extension, it will default to the extension on the fileName
	- If fileExtension is not set and 'fileName' is set without an extension, it will default to the '.log' extension
	- If fileExtension is not set and 'fileName' is not set, it will default to the '.log' extension


Loggerize can also deduce the desired target and options if only passed a `path`.
```javascript
var Loggerize = require("../lib/index.js");
let logger = Loggerize.createLogger({"name": "myLogger", "hasHandles": false});
logger.attachHandles({
	name: "myHandle",
	path: './logs/filelogtest.log',
	// target: "file",			//target is set to 'file' by default if path is set w/o rotation options
	// directory: './logs/',	//directory is deduced based on the path that is set
	// fileName: 'filelogtest',	//fileName is deduced based on the path that is set
	// fileExtension: '.log'	//fileExtension is deduced based on the the fileName that is based on the path that is set
});
logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'
```


### Rotating File Target

Loggerize supports rotating file targets by interval and size. File rotations are 
activated by using the `rotatingFile` field in the handle's config. You can 
explicitly state the desired rotation type using `rotationType` field. The 
`rotationType` does not have to explicitly be set however, as Loggerize will 
automatically deduce a `rotationType` of interval if the interval field is declared 
(obviously) or the rotateDay field is declared, and neither the maxFiles nor maxSize 
fields are present. Conversely `rotationType` will automatically be set to 'size' if 
either the maxFiles or maxSize fields are set and not the interval field.

#### Rotating File (Interval) Config Options

See the below table config options available when using the rotating file (interval) target.

| Field			| Default				| Description	|
| ------------- | --------------------- | ------------- |
| rotationType 	| 'interval' 			| Declares the type of rotation the log file will undergo	|
| interval	 	| 'day'		 			| Determines the rate at which logs will rotate. Valid intervals: 'year', 'month', 'week', 'day', 'hour', 'minute', 'second'	|
| rotateDay	 	| 'Sunday'		 		| Day on which to rotate if interval is set to 'week' |
| fileNamePattern | Not Set		 		| A fine-grained pattern to name the log file.Supports Date Directives	|
| path 			| Not Set 				| Can be used to set directory, fileName, and fileExtension in one line	|
| directory 	| './logs/' 			| The directory in which to store log files	|
| fileName		| Name of source file	| The name of the file without extension	|
| fileExtension	| '.log' or extension of file if fileName explicitly defined | The last period '.' and subsequent characters of the filename |


```javascript

// example.js
var Loggerize = require("../lib/index.js");
let logger = Loggerize.createLogger({"name": "myLogger", "hasHandles": false});
logger.attachHandles({
	name: "myHandle",
	target: "rotatingFile",		//Set target to rotatingFile
	rotationType: "interval",	//Set rotation type to rotate on an interval
	// interval: 'day',			//interval defaults to rotate on a daily basis if not explicitly set
	// directory: './logs/',	//Default directory
	// fileName: 'example', 	//Default fileName
	// fileExtension: '.log',   //Default fileExtension
});
// logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'
```
> Note the `path` property can also be used to quickly set directory, fileName and fileExtension options.

The default interval period is every day at 12:00 a.m. local time.
Valid rotation intervals comprise: "year", "month", "day", "hour", "minute", "second".
The rotatingFile target will append the date before the file extension in the form,
'fileName_Year_Month_Date_HOUR_MINUTE_SECOND.log'. Hence if the date is January 20th, 2030, 
with a fileName of "test", the file produced will be 'test_2030_01_20.log'.

Additionally the rotatingFile target allows fine-grained fileNamePatterns. The above example used
the `fileNamePattern` defined by "%\{fileName\}\_%Y_%m_%d%\{fileExtension\}" where %\{fileName} is the name of the file
as defined in the handle, %Y is Year with century, %m is the Month as a zero-padded decimal number 
and %d is the Day of the month as a zero-padded decimal number plus %\{fileExtension\} as the file extension.

Alternatively the property `fileNamePattern` could have been added to the handle and defined as 
`fileNamePattern: "%{fileName}-%Y-%b%{fileExtension}"` which would have produced a file called 
'example-2030-Jan.log'. See [Date Specifiers](#) in the Formatters section for more details.


### Rotating File Target - Size

Loggerize supports rotating file targets by size. See the below table config options 
available when using the rotating file (size) target.

#### Rotating File (size) Config Options

| Field			| Default				| Description	|
| ------------- | --------------------- | ------------- |
| rotationType 	| 'size' 				| Declares the type of rotation the log file will undergo	|
| maxSize	 	| Number.POSITIVE_INFINITY	| Determines the maximum size a log file will grow	|
| maxFiles	 	| Number.POSITIVE_INFINITY	| Determines the maximum number of log files to allow to exists |
| fileNamePattern | Not Set		 		| A fine-grained pattern to name the log file.Supports Date Directives	|
| path 			| Not Set 				| Can be used to set directory, fileName, and fileExtension in one line	|
| directory 	| './logs/' 			| The directory in which to store log files	|
| fileName		| Name of source file	| The name of the file without extension	|
| fileExtension	| '.log' or extension of file if fileName explicitly defined | The last period '.' and subsequent characters of the filename |

```javascript
// example.js
var Loggerize = require("../lib/index.js");
let logger = Loggerize.createLogger({"name": "myLogger", "hasHandles": false});
logger.attachHandles({
	name: "myHandle",
	target: "rotatingFile",	//Set target to rotatingFile
	rotationType: "size",	//Set rotation type to rotate on file size limit
	maxSize: "100 MB",		//Set file to rotate when file size exceeds 100 MB
	maxFiles: 10, 			//Set max file rotations to 10
	// directory: './logs/',	//Default directory
	// fileName: 'example', 	//Default fileName
	// fileExtension: '.log',   //Default fileExtension
});
// logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'
```

> Note the `path` property can also be used to quickly set directory, fileName and fileExtension options.

The above example rotates the target log file every 100 MB as stipulated by maxSize. maxSize accepts almost
any reasonable size declaration as it ignores whitespace and is case-insensitive.
Therefore "100mb", "100Mb", "100000kB", "104857600 b" and 104857600 (raw numeric values are considered bytes) 
are all interpreted as 100 megabytes. The maxFiles option accepts any number or string that can be parsed as an integer.

By default the rotatingFile target will append the `logNum` to the end of the filename (after the extension).
Hence the produced file will be name 'example.log.1'. `logNum` starts at 1.

Just like for the interval rotation the size rotation also allows fine-grained fileNamePatterns. The above example used
the `fileNamePattern` defined by "%\{fileName\}\%{fileExtension\}.\%{logNum\}" (Note the period before `logNum`).

Alternatively the property `fileNamePattern` could have been added to the handle and defined as 
`fileNamePattern: "%{fileName}-%{logNum}%{fileExtension}"` which would have produced a file called 
'example-1.log'.

**Note:** 

If maxSize or maxFiles are left undefined when rotating by size, these values will default 
to `Number.POSITIVE_INFINITY`. Not setting maxSize/maxFiles thus effectively causes the rotatingFile target
to behave exactly like the basic file target.


### HTTP Target

Loggerize supports sending logRecords to HTTP(S) servers across a local network or across the internet.
See the below table config options available when using the file target.

#### HTTP Config Options

| Field			| Default					| Description	|
| --------- 	| ------------------------- | ------------- |
| url			| \<user defined> 			| Required. Can be used to set directory, fileName, and fileExtension in one line	|
| port			| 80 (HTTP) or 443 (HTTPS)	| The directory in which to store log files	|
| method		| 'POST'					| The desired HTTP method to use	|
| headers		| {"User-Agent": "Remote Logger"} | HTTP Headers to include in requests |
| allowInsecure	| Not Set 					| Allows log to be sent using the unencrypted HTTP protocol |


```javascript
var Loggerize = require("../lib/index.js");
let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"hasHandles": false //set to false to avoid automatically adding the default handle
});

logger.attachHandles({
	name: "myHandle",
	target: "http",		//Set target to http
	url: "https://localhost/logreceiver", //Set url that will receive the logRecord
	// method: 'GET',	//method defaults to GET
    // port: 443,		//port defaults to 443 for HTTPS requests and defaults to 80 for HTTP requests
	// headers: {'User-Agent': 'Remote Logger'} //headers default to contain Loggerize's user agent
});

logger.info("Log Message Test!");	//Output to file => 'info Log Message Test!'
```

The only mandary property that the http target expects is the url which must include the protocol (http or https).
If the HTTP method is not set, the method will default to `GET` and the logRecord contents will be url encoded and 
passed in the log request. Conversely if the HTTP method is set to `POST`, the logRecord contents will be serialized 
and passed as a payload.

The port will be deduced from the protocol used in the url if no port is explicitly set. The port can be set 
both as a handle property as seen above or it can be defined inside the url as in `"https://localhost:3000/logreceiver"`.
If the port is defined on both the handle and inside the url, the port defined on the handle will override the one in the url.

Loggerize also allows user defined headers to be defined on the handle. If no user headers are defined Loggerize will 
pass its own predefined 'User-Agent' header. If the user defines a 'User-Agent', the default user agent will be overwritten.










