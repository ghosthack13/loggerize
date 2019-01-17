## Logging Levels

Logging levels indicate the severity of an event in your program. Loggerize has several built in `levelMapper`s which
define how each `levelName` is mapped to a numeric severity level.
Loggerize uses the 'npm' `levelMapper` by default. Below are tables which defines how both `npm` and `syslog` maps names to severity levels.

### Level Mapper

Level Mapper (npm)

| error	| warn	| info	| verbose	| debug	| silly |
| ------------------------------------------------- |
| 0		| 1		| 2		| 3			| 4		| 5		|


Level Mapper (syslog)

| emerg	| alert	| crit	| error	| warning	| notice| info	| debug |
| ----------------------------------------------------------------- |
| 0		| 1		| 2		| 3		| 4			| 5		| 6		| 7		|

Both npm and syslog have severity levels that are numerically ascending from most important to least important
as specified by specified by RFC5424. npm goes from 0 to 5 where 0 is the most severe and 5 is the least severe
while syslog goes from 0 to 7 where 0 is the *most severe* and 7 is the *least severe*.

Conversely Loggerize also supports `python` logging levels which has severity levels that are numerically 
ascending from 10 to 50 *from severe* important to *most severe* as seen below.

| debug	| info	| warning	| error	| critical	|
| --------------------------------------------- |
| 10	| 20	| 30		| 40	| 50		|

To set an alternative logging level Mapping for your program such as `python` for example, use `Loggerize.setLevelMap("python")`.
This should be done before setting any other options because Loggerize will not alter levelMappers already defined on loggers and handles.
Additionally you can define your own levelMapper with associated logging levels as explained in the [advance](#) section.

### Using Logging Levels

Logging levels indicate the minimum severity that will cause the logger to output a log message.
The below example tells the logger to only output a message when the severity level is `warn` or above.

```javascript
var Loggerize = require("../lib/index.js");
let logger = Loggerize.createLogger("myLogger");
logger.setLevel("warn");	//Set severity to the 'warn' level (numeric severity == 1). Uses the npm levelMapper by default

logger.silly("Log Message Test!");	//No Output because 'silly' has a lower severity than 'warn'
logger.debug("Log Message Test!");	//No Output because 'debug' has a lower severity than 'warn'
logger.verbose("Log Message Test!"); //No Output because 'verbose' has a lower severity than 'warn'
logger.info("Log Message Test!");	//No Output because 'info' has a lower severity than 'warn'
logger.warn("Log Message Test!");	// Outputs => 'warn Log Message Test!' because severity equals minimum severity of logger
logger.error("Log Message Test!");	// Outputs => 'error Log Message Test!' because severity equals exceeds severity of logger

Additionally you have the option to colorize log levels sent to the console by calling the library-level 
function `Loggerize.colorizeLevels()`. See the [Formatter](#formatters) section for more details on how to colorize levels.
```

### Custom Logging Levels (Advance)














