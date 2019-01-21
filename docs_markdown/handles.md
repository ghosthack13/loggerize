## Handles

Loggerize's handles dicate how logs should be managed. A handle controls the options 
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

Handles can be created/defined in several ways. 

#### Create Handle while creating logger

The easiest method is probably to define the handle 
directly in the config object with passed to `createLogger`. The following example will create a 
logger with a handle called 'myHandle' at the 'info' severity level and attach it to the logger 
called 'myLogger'.

```javascript
let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle",
		level: "info",
	},
});

logger.info("Log Test!");	//Output => 'info Log Test!'
```

#### Create Handle via attachment to logger

Alternatively, one can create a handle simply by passing a handle config object to 
the `attachHandles` method of any logger. The following example will create the same 
handle as above while attaching it to the logger called 'myLogger'. The example also 
sets the `hasHandles` field to `false` which tells the logger not to attach the default 
handle. This is needed because `createLogger` automatically attaches the default handle 
if no other handles are defined/attached.

```javascript
let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false,
});

//Create and Attach the added handle called 'myHandle'
logger.attachHandles({
	name: "myHandle",
	level: "info",
});

logger.info("Log Test!");	//Output => 'info Log Test!'
```

#### Create Handle via module-level

The final way to add a handle is to use the module-level function `addHandle`.

```
Loggerize.addHandle({
	"name": "myHandle",
	"level": "info",
});

let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false	//Set to false to not add default handle
});

logger.attachHandles("myHandle");	//Attach the handle called 'myHandle'
logger.info("Log Test!");			//Output => 'info Log Test!'
```

This third method is actually how Loggerize adds handles internally. The previous two methods 
are just wrappers for the module-level `addHandle` method. All handles are created at the module-level. 
This allows the flexibility for any logger to use any handle simply by passing the desired handles' 
names to the `attachHandles` method of the logger. 

```javascript
let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false,
});

logger.attachHandles("default"); //Attach the handle called 'default'
logger.info("Log Test!");		//Output => 'info Log Test!'
```

### Deleting Handles

If you no longer want a logger to use a particular handle, that handle can be detached using the 
`detachHandle` method of that logger.

```javascript
var Loggerize = require("../lib/index.js");
Loggerize.addHandle({
	"name": "myHandle",
	"level": "info",
});

let logger = Loggerize.createLogger("myLogger");
logger.detachHandle("default");		//Detach the default handle added by `createLogger`
logger.attachHandle("myHandle");	//Attach the added handle called 'myHandle'

logger.info("Log Test!");	//Output => 'info Log Test!'
```

The above example will output 'info Log Test!' to the console a single time, since we detached 
the default handle that was added automatically by `createLogger`. Detaching a handle only removes 
a handle from use by a particular logger and will still be available to any other logger that wants 
to attach it later.

To permanently remove a handle, you must use the library-level function 
`removeHandle()`. `removeHandle()` accepts a string or an array of strings with names of handles to 
be removed as the only parameter. For example `removeHandle("myHandle")` will remove the named handle.

### The Uncaught Exception Handle

Loggerize allows you to capture Node's 'uncaughtException' event. When an exception occurs in your process 
and makes it way into Node's event loop without being caught, Node will automatically emit an 'uncaughtException' 
event with the details of the problem. Loggerize allows you to capture and log these details.

```javascript
var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false,
});

//Add the uncaught exception handle
Loggerize.addExceptionHandle({
	name: "_exception",
	target: 'console',
	formatter: 'exceptFmt',
	level: 'debug',
	emitEvents: true,
	levelMapper: 'npm',
});

// Run some application/server code
throw Error();
// Run some more application/server code

```
The above example uses the module-level `addExceptionHandle` function to create a handle that manages 
uncaught exceptions. `addExceptionHandle` took a handle config object as an argument will log 
uncaught exceptions to the console. The is actually the default config that `addExceptionHandle` uses 
and thus will produce the same output as if called without any arguments. To configure the uncaught exceptions 
to be save to a file instead simply choose 'file' as the target instead of the console and any other valid 
handle configurations you desire.

**Note**: Loggerize does not allow the option to continue the program after an uncaught even occurs. 
As a general programming best practice, you should **NEVER** continue running a program if an exception 
is left uncaught.

If you no longer want to log uncaught exceptions, you can easily remove the uncaught Exception 
handle using the module-level `Loggerize.removeExceptionHandle()`.
