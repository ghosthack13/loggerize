
## Loggers

### Creating Loggers

A Logger provides the mechanism by which incidents in your application/server are recorded.
These incidents may have various levels of severity from the mundane such as recording of the 
webpage that was requested on a server to the dire such as running out of hard disk space.

Loggers are never instantiated directly but through the module-level function `createLogger()`.
The only mandatory option that `createLogger` requires is a name (either as a string or defined in an object).

```javascript
var Loggerize = require("loggersize");

let logger = Loggerize.createLogger("myLogger");
```

This above code will create a logger named "myLogger". Loggerize supports plain names such 
as 'myLogger' as well as period-separated hierarchical values such as 'foo.bar.baz'. 
See [Advance Loggers](#) for more information on hierachial loggers.

Each logger instance has several properties that can be defined by passing a config object 
to the `createLogger` function. These properties are displayed in the table below.

| Name          | Default								|  Description																	|
| ------------- | ------------------------------------- | -----------------------------------------------------------------------------	|
| 'name'       	| \<user defined>						| Required. The name of the logger instanceLog									|
| 'level'       | \<adopts level of attached handles>	| Log only when severity is greater than or equal to this level					|
| 'level'       | \<adopts level of attached handles>	| Log only when severity is greater than or equal to this level					|
| 'levelMapper' | \<adopts levelMapper of attached handles>	| Defines valid log levels and order of severity of logs (see advance)		|
| 'handle'		| `["default"]`  					   	| List of handles to process log message through								|
| 'hasHandles'  | `true`								| Check if current logger has handles attached							|
| 'filters'     | `[]`									| List of filters attached to this logger										|
| 'isMuted'     | `false`								| Determines if this logger is allowed to produce logs							|
| 'propogate'	| `true`								| Sends logRecords to this loggers ancestors and the root logger (see advance)	|
| 'logOnRequest' | `false`								| Creates log on http requests (will *ONLY* have request information)			|
| 'logOnResponse'| `true`								| Creates log on http response (will have both request and repsonse information)|


The above defaults mean that calling `Loggerize.createLogger("myLogger")` is exactly the same as calling:

``` javascript
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

### Logging

In order to actually log an incident/event we need to call the `log` method on our logger. 
The simplest way to create log output is to pass the name of a log level as the first parameter 
and a log message as the second parameter.

```javascript
var Loggerize = require("loggersize");

let logger = Loggerize.createLogger("myLogger");
logger.log("info", "Logger Test!"); // Outputs => 'info Logger Test!'
```

The above example wil output 'info Logger Test!' to the console. If however, a plain severity 
level and log message are not passed to the `log` method, Loggerize will try to interpret 
parameters passed to it and guess what you meant to have logged.

```javascript
var Loggerize = require("loggersize");

let logger = Loggerize.createLogger("myLogger");

logger.log(new Error("Javascript Error Object!"));			// outputs => 'error Javascript Error Object!'. N.B. you have to define a formatter to output stack trace
logger.log({"level": "warn", "message": "Logger Test!"});	// outputs => 'warn Logger Test!'
logger.log("info", {"message": "Logger Test!"});			// outputs => 'info Logger Test!'
logger.log("verbose", "Logger Test");						// outputs => 'verbose Logger Test!'
logger.log("debug");										// outputs => 'debug Logger Test!'
```

All of the above are valid arguments that can be passed to `log()`.
Additionally, instead of using the standard `log`, Loggerize provides several 
convenience methods which are called using the name of the severity level and accepts 
a log message as its parameter.

```javascript
//! Convenience methods also accept javascripts objects and error objects just like standard API above

logger.error("Logger Test!");	// outputs => 'error Logger Test!'
logger.warn("Logger Test!");	// outputs => 'warn Logger Test!'
logger.info("Logger Test!"); 	// outputs => 'info Logger Test!'
logger.verbose("Logger Test!"); // outputs => 'verbose Logger Test!'
logger.debug("Logger Test!");	// outputs => 'debug '
```

### String Interpolation

Loggerize automatically detects string interpolation and interpolated messages based on node's `util.format`.
Below are examples of string interpolation using th convenience methods, though the same effect can be achieved
using the standard `log`.

```javascript
logger.debug("Log %s Test!", "Message");		// outputs => 'debug Log Message Test!'
logger.verbose("%drd Log Message Test!", 103);	// outputs => 'verbose 103rd Log Message Test!'
logger.info("Log Message %s. %s!", "Test", "Success");	// outputs => 'info Log Message Test. Success!'
logger.warn("Log Message %s. %s!", "Test", "Success", "Finished");	// outputs => 'warn Log Message Test. Success! Finished'
```
