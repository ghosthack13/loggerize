## Levels

Logging levels indicate the severity of an event in your application or server.

### Level Mappers (Intermediate)

A `levelMapper` defines how the name of a logging level is assigned to a 
corresponding numeric severity level. Loggerize uses the 'npm' level mapper by 
default while also providing other common level mappings such as 'syslog', 
'python', 'http' and more.

The tables below show how `npm` and `syslog` maps level names to numeric severities.

Level Mapper (npm)

| LEVEL NAME| error	| warn	| info	| verbose	| debug	| silly |
| --------- | -----	|------ |------	| --------- | ----- | ----- |
| SEVERITY	| 0		| 1		| 2		| 3			| 4		| 5		|


Level Mapper (syslog)

| LEVEL NAME| emerg	| alert	| crit	| error	| warning	| notice| info	| debug |
| --------- | -----	|------ |------	| ----- | --------- | ----- | ----- | ----- |
| SEVERITY	| 0		| 1		| 2		| 3		| 4			| 5		| 6		| 7		|

Both npm and syslog have severity levels proceeding from most important to least important
as specified by specified by [RFC 5424](https://tools.ietf.org/html/rfc5424). The npm 
severity levels go from 0 to 5, where 0 is the *most severe* and 5 is the *least severe*.
Comparably, syslog goes from 0 to 7, where 0 is the *most severe* and 7 is the *least severe*.

Loggerize also supports `python` logging levels which has severity levels that proceed 
from *least severe* to *most severe*, ranging from 10 to 50 (in steps of ten), where 10 is the 
*least severe* and 50 is the *most severe*.

Level Mapper (python)

| LEVEL NAME| debug	| info	| warning	| error	| critical	|
| --------- | -----	|------ |----------	| ----- | --------- |
| SEVERITY	| 10	| 20	| 30		| 40	| 50		|


To change the default `levelMapper` of your program use the module-level function `Loggerize.setLevelMapper(<string>)`.
If you want to use the `syslog` levelMapper for example, call `Loggerize.setLevelMapper("syslog")`.
This should be done before creating any other loggers or adding any other [handles](handles) 
because Loggerize will not alter levelMappers already defined on loggers and handles.

```javascript
// @filenmae levels-setlevelmapper.js
var Loggerize = require("loggerize");

Loggerize.setLevelMapper("syslog");
let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {name: "mySyslogHandle", levelMapper: "syslog"}
});

logger.debug("Log Message Test!");	// Outputs => 'debug Log Message Test!'
logger.info("Log Message Test!");	// Outputs => 'info Log Message Test!'
logger.notice("Log Message Test!");	// Outputs => 'notice Log Message Test!'
logger.warning("Log Message Test!");// Outputs => 'warning Log Message Test!'
logger.err("Log Message Test!");	// Outputs => 'err Log Message Test!'
logger.crit("Log Message Test!"); 	// Outputs => 'crit Log Message Test!'
logger.alert("Log Message Test!"); 	// Outputs => 'alert Log Message Test!'
logger.emerg("Log Message Test!");	// Outputs => 'emerg Log Message Test!'
```

The above example sets the `levelMapper` to 'syslog' and uses the convenience 
methods to output a message at each of the syslog severity levels. The above 
example also introduced the concept of the [handle](#handles). In short, every 
logger must have a handle attached to produced output. The `createLogger` 
function automatically attached the default handle for us in the previous 
examples. The default handle **always** uses the `npm` levelMapper and since 
we want to use a different levelMapper we need to create a new handle that 
also uses the syslog `levelMapper`.

### Using Logging Levels

Logging levels are used to indicate the minimum severity of an event that will 
cause the logger (or handle) to output a log message. The below example tells 
the logger to only output a message when the severity level is `warn` or above.

```javascript
// @filenmae levels-setlevel.js
var Loggerize = require("../lib/index.js");
let logger = Loggerize.createLogger("myLogger");
logger.setLevelMapper("warn");	//Set severity to the 'warn' level (numeric severity == 1). Uses the npm levelMapper by default

logger.silly("Log Message Test!");	//No Output because 'silly' has a lower severity than 'warn'
logger.debug("Log Message Test!");	//No Output because 'debug' has a lower severity than 'warn'
logger.verbose("Log Message Test!"); //No Output because 'verbose' has a lower severity than 'warn'
logger.info("Log Message Test!");	//No Output because 'info' has a lower severity than 'warn'
logger.warn("Log Message Test!");	// Outputs => 'warn Log Message Test!' because event severity equals minimum severity of logger
logger.error("Log Message Test!");	// Outputs => 'error Log Message Test!' because event severity exceeds severity of logger
```

Additionally you have the option to colorize logs sent to the console by 
calling the library-level function `Loggerize.colorizeLevels()`. See the 
[Setting Level Colors](#setting-level-colors) section for more details on how to colorize levels.

### User-Defined Logging Levels (Advance)

For users that love to customize everything, Loggerize allows you to customize 
your log levels too. Using the module-level function `createLevelMap`, you can 
define your own level mappings to suit your taste.

```javascript
// @filenmae levels-createlevelmap.js
var Loggerize = require("../lib/index.js");

//level config object
let levelMap = {
	"MadMax": 0,	// Max Max world comes true
	"zombie": 1,	// Zombie Apocalypse
	"robot": 2,		// Robot Apocalypse
	"alien": 3,		// Alien Apocalypse
	"goblin": 4,	// Goblin Apocalypse
};

//Define level Mapper called 'apocalypse' based on level config
Loggerize.createLevelMap("apocalypse", levelMap, "desc");
Loggerize.setLevelMapper("apocalypse");

let logger = Loggerize.createLogger({
	"name": "myLogger",
	"handle": {
		"name": "myHandle",
		"levelMapper": "apocalypse",
	},
});

logger.log("zombie", "The Apocalypse has begun!"); //Outputs => 'zombie The Apocalypse has begun!'
```

The above example created a custom level mapping using `createLevelMap`. 
`createLevelMap` has two required parameters, the name of the `levelMapper` 
and the config object that defines how level names are mapped to a numeric 
severity level. The above example creates a `levelMapper` called 'apocalypse' 
with severity levels ranging from 0 to 4.

The 3rd parameter sets the order of severity for the level mapping. Using the 
"desc" argument says that the level mapping descreases in severity as it moves 
to higher numeric values. This is the default behaviour on Loggerize and most 
logging libraries (though being counter-intuitive). Conversely, one can use 
the "asc" argument to make the level mapping increase in severity as it 
moves to higher numeric values.







