
## Loggers

A Logger provides the mechanism by which incidents in your application/server 
are recorded. These incidents may have various levels of severity from the 
mundane such as recording of the webpage that was requested on a server to 
the dire such as running out of hard disk space.

### Creating Loggers

Loggers are never instantiated directly but through the module-level function 
`createLogger()`. The only mandatory option that `createLogger` requires is a 
name (either as a string or defined in an object).

```javascript
// @filename logger-create.js
var Loggerize = require("loggersize");

let logger = Loggerize.createLogger("myLogger");
```

This example created a logger named "myLogger" by passing a plain text string 
as the parameter. Loggers also support period-separated hierarchical names 
such as 'foo.bar.baz'. See [Logger Hierarchy](#log-hierarchy) for more 
information on hierachial loggers.

For more fine-grained control over the type of logger created, the user can 
pass a config object instead of a string as the parameter to `createLogger`. 
Valid configurations are shown in the table below.

| Name          | Default								|  Description																	|
| ------------- | ------------------------------------- | -----------------------------------------------------------------------------	|
| 'name'       	| \<user defined>						| Required. The name of the logger instance									|
| 'level'       | Not set or adopts level of attached handles	| Log only when severity is greater than or equal to this level					|
| 'levelMapper' | Not set or adopts levelMapper of attached handles	| Defines valid log levels and thier order of severity (see [Level Mapper](#level-mapper))		|
| 'handle'		| `["default"]`  					   	| List of handles to process log message through								|
| 'hasHandles'  | `true`								| When false and the user did not define a handle, tell the logger not to attach the default handle as above							|
| 'filters'     | `[]`									| List of filters attached to this logger										|
| 'isMuted'     | `false`								| Determines if this logger is allowed to produce logs							|
| 'propogate'	| `true`								| Pass logs to this loggers ancestors and the root logger (See [Logger Hierarchy](#log-hierarchy))	|
| 'logOnRequest' | `false`								| Creates log on http requests (will *ONLY* have request information)			|
| 'logOnResponse'| `true`								| Creates log on http response (will have *BOTH* request and repsonse information)|


> **A logger's data members should NEVER be set or accessed directly, but always via 
the logger's public API methods.**

The defaults decribed in the table above ordains that calling 
`createLogger("myLogger")` with a text string is exactly the same as calling 
`createLogger` with the config object seen below.

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
// @filename logger-log-any.js
var Loggerize = require("../../lib/index.js");
let logger = Loggerize.createLogger("myLogger");

logger.log(new Error("Javascript Error Object!"));			// outputs => 'error Javascript Error Object!'. N.B. you have to define a formatter to output stack trace
logger.log({"level": "warn", "message": "Logger Test!"});	// outputs => 'warn Logger Test!'
logger.log("info", {"message": "Logger Test!"});			// outputs => 'info Logger Test!'
logger.log("verbose", "Logger Test!");						// outputs => 'verbose Logger Test!'
logger.log("debug");
```

All of the above are valid arguments that can be passed to `log`.
Additionally, instead of using the standard `log`, Loggerize provides several 
convenience methods which are called using the name of the severity level which 
then accepts a log message as its parameter. Convenience methods also accept 
javascripts objects and error objects just like the standard log API above.

```javascript
// @filename logger-log-convenience.js

var Loggerize = require("../../lib/index.js");
let logger = Loggerize.createLogger("myLogger");

logger.error("Logger Test!");	// outputs => 'error Logger Test!'
logger.warn("Logger Test!");	// outputs => 'warn Logger Test!'
logger.info("Logger Test!"); 	// outputs => 'info Logger Test!'
logger.verbose("Logger Test!"); // outputs => 'verbose Logger Test!'
logger.debug("Logger Test!");	// outputs => 'debug Logger Test!'
```

### HTTP Logging

Loggerize seamlessly support HTTP logging alongside the standard application/progam
logging. By default, http requests/responses are logged to the console target using the 
Apache [combined](https://httpd.apache.org/docs/1.3/logs.html#combined ) log format.

#### Split Request/Response Logging

Loggerize can log HTTP request on both request and response or only log on one 
and not the other. By default Loggerize will log only on HTTP response. The HTTP 
repsonse will create a log with the most complete information.

On the other hand if the logger config is set to log on request only, logs can 
be written even if the server has an error though response information such as 
`statusCode` and `contentLength` will not be available.

To achieve the most detail information with greater fault tolterance, one can 
log on both request and response. This configuration will however generate two 
log records with nearly identical log information.

It is up to the user to decide which configuration will best suit their 
circumstances. To configure split logging, set the properties 
`logOnRequest` and `logOnResponse` to `true` or `false` in the logger's 
configuration.

#### Vanilla HTTP Logging

The below example shows how to use Loggerize to track requests and responses in 
a vanilla HTTP server.

```javascript
// @filename logger-http-vanilla.js
var http = require('http');

var Loggerize = require('../../lib/index.js');

var myHTTPLogger = Loggerize.createHTTPLogger({
	"name": "myHTTPLogger",
	"level": "information",
	"handle": {
		"name": "myHTTPHandle",
		"target": "console",
		"formatter": "common",
		"levelMapper": "http",
	}
});

const PORT = 3000;
var server = http.createServer(function (req, res){
	
	myHTTPLogger.httpListener(req, res); // request/response logger
	
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(PORT);

// Console will print the message
console.log("Server listening on port " + PORT + "!");
```

Alternatively, one can use the convenience module-level function `requestListener` 
and implant it directly into Node's [requestListener](https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener).
When using this convenience method, the logger in the example below automatically 
defaults to the same configuration as explicitly defined in the example above.

```javascript
var http = require('http');

var loggerize = require('../../lib/index.js');

const PORT = 3000;
var server = http.createServer(function (req, res){
	
	loggerize.requestListener(req, res); // request/response logger
	
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(PORT);

// Console will print the message
console.log("Server listening on port " + PORT + "!");
```

Navigate your browser or any other web client to http://localhost:3000/ and watch 
as log messages appear on the terminal.

#### Express/Connect Middleware Logging

Loggerize supports the creation of middleware loggers. Express/Connect loggers 
can be conveniently created using a loggerize's special module-level `mw()` 
middleware function.

```javascript
// @filename logger-express-1.js
const express = require('express');
const app = express();
const PORT = 3000;

var loggerize = require("../../lib/index.js");
app.use(loggerize.mw());

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(PORT, () => console.log("Example app listening on port " + PORT + "!"))
```

Alternatively, one can use the more familiar interface of creating an HTTP logger 
then extracting the middleware function from the created logger. The above example 
is a convenience function for the below.

```javascript
// @filename logger-express-2.js
const express = require('express');
const app = express();
const PORT = 3000;

var loggerize = require("../../lib/index.js");

var httpLogger = loggerize.createHTTPLogger({name: "myHTTPLogger"});
app.use(httpLogger.getMiddleware());

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(PORT, () => console.log("Example app listening on port " + PORT + "!"))
```

Navigate your browser or any other web client to http://localhost:3000/ and watch 
as log messages appear on the terminal.

### String Interpolation

Loggerize automatically detects string interpolation. Messages are interpolated 
based on node's [util.format](https://nodejs.org/api/util.html#util_util_format_format_args ).
The string interpolation examples below use the convenience methods, though the 
same effect can be achieved using the standard `log`.

```javascript
// @filename logger-log-interpolated.js
var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger("myLogger");

logger.debug("Log %s Test!", "Message");		// outputs => 'debug Log Message Test!'
logger.verbose("%drd Log Message Test!", 103);	// outputs => 'verbose 103rd Log Message Test!'
logger.info("Log Message %s. %s!", "Test", "Success");	// outputs => 'info Log Message Test. Success!'
logger.warn("Log Message %s. %s!", "Test", "Success", "Finished");	// outputs => 'warn Log Message Test. Success! Finished'
```





