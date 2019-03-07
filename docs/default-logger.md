
## The Default Logger

The Default Logger is a simple, lightweight, quick access logger for people 
who just want to get the job done. This everyday logger does not do anything 
fancy with handles, transports, formatters, filters or the bells and whistles. 
It is a minimalist logger that maxmises speed and efficiency by providing all 
the core functionality of a logging library, but nothing more.

### Log Commands

Log commands follow the npm levels which go in numerically ascending order from 
most severe to least severe. The npm levels make six logging levels available 
from `error` (numeric level: 0) to `silly` (numeric level: 6).

```javascript

var logger = require("../../lib/index.js");

logger.error("Logger Test!");	// outputs => 'error Logger Test!'
logger.warn("Logger Test!");	// outputs => 'warn Logger Test!'
logger.info("Logger Test!"); 	// outputs => 'info Logger Test!'
logger.verbose("Logger Test!"); // outputs => 'verbose Logger Test!'
logger.debug("Logger Test!");	// outputs => 'debug Logger Test!'
logger.silly("Logger Test!");	// outputs => 'silly Logger Test!'
```

### Log Commands with String Interpolation

Log commands also automatically detects string interpolation. Messages are 
interpolated based on node's 
[util.format](https://nodejs.org/api/util.html#util_util_format_format_args ). 

```javascript
var logger = require("../../lib/index.js");

logger.debug("Log %s Test!", "Message");		// outputs => 'debug Log Message Test!'
logger.verbose("%drd Log Message Test!", 103);	// outputs => 'verbose 103rd Log Message Test!'
logger.info("Log Message %s. %s!", "Test", "Success");	// outputs => 'info Log Message Test. Success!'
logger.warn("Log Message %s. %s!", "Test", "Success", "Finished");	// outputs => 'warn Log Message Test. Success! Finished'
```
### Log Colorization

When using the default logger, it is possible to colorize the logging levels 
based on the severity of the event. Simply call the `colorizeLevels()` method. 

```javascript
logger.colorizeLevels();
```

Conversely, to decolorize the severity levels, simply call the 
`decolorizeLevels()` method.

```javascript
logger.decolorizeLevels();
```

### Getting/Setting Levels

`getLevel()` - Returns the 











