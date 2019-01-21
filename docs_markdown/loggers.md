
## Loggers

### Creating Loggers

A Logger provides the mechanism by which incidents in your application/server are recorded.
These incidents may have various levels of severity from the mundane such as recording of the 
webpage that was requested on a server to the dire such as running out of hard disk space.

Loggers are never instantiated directly but through the module-level function `createLogger()`.
The only mandatory option that `createLogger` requires is a name (either as a string or defined in an object).

```javascript
// @filename logger-create.js
var Loggerize = require("loggersize");

let logger = Loggerize.createLogger("myLogger");
```

This example created a logger named "myLogger" by passing a plain text string as the parameter.
Loggers also support period-separated hierarchical names such as 'foo.bar.baz'. 
See [Logger Hierarchy](#log-hierarchy) for more information on hierachial loggers.

For more fine-grained control over the type of logger created, the user can pass a config object
instead of a string as the parameter to `createLogger`. These configuration properties are 
displayed in the table below.

| Name          | Default								|  Description																	|
| ------------- | ------------------------------------- | -----------------------------------------------------------------------------	|
| 'name'       	| \<user defined>						| Required. The name of the logger instance									|
| 'level'       | Not set or adopts level of attached handles	| Log only when severity is greater than or equal to this level					|
| 'levelMapper' | Not set or adopts levelMapper of attached handles	| Defines valid log levels and thier order of severity (see [Level Mapper](#level-mapper))		|
| 'handle'		| `["default"]`  					   	| List of handles to process log message through								|
| 'hasHandles'  | `true`								| When false and the user did not define a handle, tell the logger not to attach the default handle as above							|
| 'filters'     | `[]`									| List of filters attached to this logger										|
| 'isMuted'     | `false`								| Determines if this logger is allowed to produce logs							|
| 'propogate'	| `true`								| Sends logRecords to this loggers ancestors and the root logger (See [Logger Hierarchy](#log-hierarchy))	|
| 'logOnRequest' | `false`								| Creates log on http requests (will *ONLY* have request information)			|
| 'logOnResponse'| `true`								| Creates log on http response (will have both request and repsonse information)|


The above defaults mean that calling `createLogger("myLogger")` with a text string 
is exactly the same as calling `createLogger` with a config object as seen below:

``` javascript
// @filename logger-create-config.js
var Loggerize = require("loggersize");

Loggerize.createLogger({
	"name": "myLogger",			//Defined by user
	"level": 'debug'			//Defined by default if not set
	"handles": [ 'default' ],	//Defined by default if not set
	"hasHandles": true,			//Defined by default if not set
	"filters": [],				//Defined by default if not set
	"isMuted": false,			//Defined by default if not set
	"levelMapper": 'npm',		//Defined by default if not set
	"propogate": true,			//Defined by default if not set
});
```

### Application Logging

In order to actually log an incident/event we need to call the `log` method on our logger. 
The standard way to create log output is to pass the name of a `level` as the first parameter 
and a log `message` as the second parameter.

```javascript
// @filename logger-log.js
var Loggerize = require("loggersize");

let logger = Loggerize.createLogger("myLogger");
logger.log("info", "Logger Test!"); // Outputs => 'info Logger Test!'
```

The above example wil output 'info Logger Test!' to the console. If however, a standard severity 
level and log message are not passed to the `log` method, Loggerize will try to interpret 
parameters passed to it and guess what you meant to have logged.

```javascript
// @filename logger-log.js
var Loggerize = require("loggersize");

let logger = Loggerize.createLogger("myLogger");

logger.log(new Error("Javascript Error Object!"));			// outputs => 'error Javascript Error Object!'. N.B. you have to define a formatter to output stack trace
logger.log({"level": "warn", "message": "Logger Test!"});	// outputs => 'warn Logger Test!'
logger.log("info", {"message": "Logger Test!"});			// outputs => 'info Logger Test!'
logger.log("verbose", "Logger Test");						// outputs => 'verbose Logger Test!'
logger.log("debug");										// outputs => 'debug Logger Test!'
```

All of the above are valid arguments that can be passed to `log`.
Additionally, instead of using the standard `log`, Loggerize provides several 
convenience methods which are called using the name of the severity level which 
then accepts a log message as its parameter.

```javascript
// @filename logger-log.js
//! Convenience methods also accept javascripts objects and error objects just like standard API above

logger.error("Logger Test!");	// outputs => 'error Logger Test!'
logger.warn("Logger Test!");	// outputs => 'warn Logger Test!'
logger.info("Logger Test!"); 	// outputs => 'info Logger Test!'
logger.verbose("Logger Test!"); // outputs => 'verbose Logger Test!'
logger.debug("Logger Test!");	// outputs => 'debug '
```

### HTTP/Middleware Logging

Loggerize natively supports logging request on both Node's standard HTTP server and 
express/connect middleware. The below example uses a vanilla HTTP server and will 
log all request to the console target using the Apache [combined](https://httpd.apache.org/docs/1.3/logs.html#combined ) log format.

```javascript
// @filename logger-http-vanilla.js
var Loggerize = require("../../lib/index.js");
	/* Finish Code Example */
```

Alternatively, one can log using express/connect middleware just as easily.

```javascript
// @filename logger-http-middleware.js
var Loggerize = require("../../lib/index.js");
	/* Finish Code Example */
```

Navigate your browser to http://localhost:3000/ and watch as log messages appear on the terminal.


#### Split Request/Response Logging

Loggerize can log HTTP request on both request and response or only log on one and not the other. 
By default Loggerize will log only on HTTP response. This means that a log will the most complete 
information will be recorded only once. 

```javascript
//Default http logger instructions
httplogger.logOnRequest = false;
httplogger.logOnResponse = true;
```

On the other hand if the logger config is set to log on request only, logs can be written even if 
the server has an error but response only information such as `statusCode` and `contentLength` will 
not be logged.

```javascript
httplogger.logOnRequest = true;
httplogger.logOnResponse = false;
```

To achieve the most detail information with greater fault tolterance, one can log on both request and 
response. This configuration will however place two log records with nearly identical log information. 
It is up to the user to decide which configuration will best suit their circumstances.

```javascript
httplogger.logOnRequest = true;
httplogger.logOnResponse = true;
```

### String Interpolation

Loggerize automatically detects string interpolation. Messages are interpolated based on node's [util.format](https://nodejs.org/api/util.html#util_util_format_format_args ).
Below are examples of string interpolation using the convenience methods, though the same effect can be achieved
using the standard `log`.

```javascript
// @filename logger-log-interpolated.js
var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger("myLogger");

logger.debug("Log %s Test!", "Message");		// outputs => 'debug Log Message Test!'
logger.verbose("%drd Log Message Test!", 103);	// outputs => 'verbose 103rd Log Message Test!'
logger.info("Log Message %s. %s!", "Test", "Success");	// outputs => 'info Log Message Test. Success!'
logger.warn("Log Message %s. %s!", "Test", "Success", "Finished");	// outputs => 'warn Log Message Test. Success! Finished'
```


