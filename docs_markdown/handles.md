## Handles

Loggerize's handles indicate how logs should be managed. A handle controls the options 
that defined how a target should operate, as well as acts as a link between the target and 
a formatter.

Every handle must have a 'name' field defined by the user. Beyond the name field, Loggerize 
will automatically set various required fields to default values as defined below.

| Name 		| Default		| Description
| --------- | -------------	| ------------------------------------------------------------------------- |
| name 		| <user defined>| Identifier to use to attach handle							|
| active 	| `true` 		| Determines if the handle is allowed to write log outputs				|
| target 	| 'console' 	| Dictates which target will receive log output (see [Targets](#targets)) 	|
| formatter	| 'default' 	| Dictates how output should look on the target (see [Formatters](#formatters)) |									|
| level 	| 'debug' 		| Outputs only if log severity is equal or greater than this level (see [Levels](#levels))			|
| levelMapper | 'npm' 		| (see [Level Mappers](#level-mappers))	| 
| emitEvents| `false` 		| Emit log events with the status of attempts to write log output (see [Events](#))		|

The above are fields that are available on every handle. Moreover, various targets 
employ additional handle fields, usable only when that specific target is selected. 
See [Targets](#targets) for more information.

### Creating Handles

Handles are created by passing a config object to the module-level funtion `addHandle`. Having 
handles created at the module-level allows the flexibility for any logger to use any handle 
simply by passing the desired handles' names to the `attachHandles` method of the logger. 
A logger cannot output a log message without having a handle attached that manages how that log 
output is supposed to be processed. 

```javascript
var Loggerize = require("../lib/index.js");
Loggerize.addHandle({
	"name": "myHandle",
	//"target": "console", // target defaults to console if not explicitly set
});

let logger = Loggerize.createLogger("myLogger");
logger.attachHandle("myHandle");	//Attach the added handle called 'myHandle'

logger.info("Log Test!");	//Output => 'info Log Test!'
```

The above example will output 'info Log Test!' to the console, twice. A logger can have an unlimited 
number of handles attached to it and will produce a log output as defined by each handle that 
is attached. Consequently, the logger will output 'info Log Test!' twice (on separate lines) 
because the `createLogger` would have automatically attached the 'default' handle.

### Deleting Handles

If we no longer want a logger to use a particular handle, that handle can be detached using the 
`detachHandle` method of that logger.

```javascript
var Loggerize = require("../lib/index.js");
Loggerize.addHandle({
	"name": "myHandle",
	//"target": "console", // target defaults to console if not explicitly set
});

let logger = Loggerize.createLogger("myLogger");
logger.attachHandle("myHandle");	//Attach the added handle called 'myHandle'
logger.detachHandle("default");		//Detach the default handle added by `createLogger`

logger.info("Log Test!");	//Output => 'info Log Test!'
```

The above example will output 'info Log Test!' to the console a single time, since we detached 
the default handle that was added automatically by `createLogger`. Detaching a handle only removes 
a handle from use by a particular logger and will still be available to any other logger that wants 
to attach it later.

To permanently remove a handle, you must use the library-level function 
`removeHandle()`. `removeHandle()` accepts a string or an array of strings with names of handles to 
be removed as the only parameter. For example `removeHandle("myHandle")` will remove the named handle.


