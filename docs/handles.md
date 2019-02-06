## Handles

Loggerize's handles dicate how logs should be managed. A handle controls the options 
that defined how a target should operate, as well as acts as a link between said 
target and a formatter.

Handles are used by attaching the handle to a logger. Loggers and handle have a 
many-to-many relationship, meaning, any one logger can have an unlimited number of 
handles attached and any one handle can be attached to an unlimited number of loggers.
The only restriction on handle attachment is that both the logger and the handle 
MUST have the same [Level Mapper](#level-mappers).


Every handle must have a 'name' field defined by the user. Beyond the name field, Loggerize 
will automatically set various required fields to default values as defined below.

| Name 		| Default		| Description
| --------- | -------------	| ------------------------------------------------------------------------- |
| name 		| User Defined	| Handle's unique identifier												|
| target 	| 'console' 	| Dictates which target will receive the log output (see [Targets](#targets)) |
| formatter	| 'default' 	| Names the formatter which which will determines how output should look on the target (see [Formatters](#formatters)) |									|
| level 	| 'debug' 		| The minimum severity that will activate log output (see [Levels](#levels)) |
| levelMapper | 'npm' 		| (see [Level Mappers](#level-mappers))	| 
| emitEvents| `false` 		| Emit the status of attempts to write log output (see [Events](#))		|

The above are fields that are available on every handle. Moreover, various targets 
employ additional handle fields, usable only when that specific target is selected. 
See [Targets](#targets) for more information.

### Creating Handles

Handles can be created/defined in several ways. 

#### Create Handle while creating logger

The easiest method is probably to define the handle directly in the config object 
that is passed to `createLogger`. The following example will create a logger with 
a handle called 'myHandle' at the 'info' severity level and attach it to the 
logger called 'myLogger'.

```javascript
// @filename handle-create-1.js
let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle",
		level: "info",
	},
});

logger.info("Log Test!");	//Output => 'info Log Test!'
```

#### Create Handle while attaching to logger

Handles can be created simply by passing a handle config object to the `attachHandles` 
method of any logger. The following example will create the same handle as the above 
example while attaching it to the logger called 'myLogger'. The next example also sets 
the `hasHandles` field to `false` which tells the logger not to attach the default 
handle. This is needed because `createLogger` automatically attaches the default 
handle if no other handles are attached.

```javascript
var Loggerize = require("../../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false,
});

//Create handle during logger attachment
logger.attachHandles({
	name: "myHandle",
	level: "info",
});

logger.info("Log Test!");	//Output => 'info Log Test!'
```

#### Create Handle via module-level function

Handles can be created using the module-level function `addHandle`. This method 
is actually how Loggerize adds handles internally. The previous two methods 
are just wrappers for the module-level `addHandle` method. All handles are 
created at the module-level and available to all loggers.


```javascript
var Loggerize = require("../../lib/index.js");

Loggerize.addHandle({
	"name": "myHandle",
	"level": "info",
});

let logger = Loggerize.createLogger({
	name: "myLogger", 
	hasHandles: false	//Set to false to not add default handle
});

logger.attachHandles("myHandle");	//Attach the handle called 'myHandle'
logger.info("Log Test!");	//Output => 'info Log Test!'
```

Loggeize module-level handles allows the flexibility for any logger to use any 
handle simply by passing the desired handles' name or array of names to the 
`attachHandles` method of the logger. 

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

Loggerize allows you to capture Node's [uncaughtException](https://nodejs.org/api/process.html#process_event_uncaughtexception) 
event. When an exception occurs in your process and makes it way into Node's event 
loop without being caught, Node will automatically emit an 'uncaughtException' 
event with the details of the problem. Loggerize allows you to capture and log 
these details.

```javascript
// @filename handle-uncaught.js
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
```

The above example uses the module-level `addExceptionHandle` function to create a 
handle that manages uncaught exceptions. `addExceptionHandle` takes a handle 
config object as an argument and will log uncaught exceptions to the designated target. 
The config in the above example is actually the default config that `addExceptionHandle` 
uses if no config was passed. This means that the same output will be produced as 
if `addExceptionHandle` was called without any arguments. To configure the 
uncaught exceptions to be save to a file instead simply choose 'file' as the 
target instead of the console and any other valid handle configurations.

**Note**: Loggerize does not allow the option to continue the program after an uncaught even occurs. 
As a general programming best practice, you should **NEVER** continue running a program if an exception 
is left uncaught.

If you no longer want to log uncaught exceptions, you can easily remove the uncaught Exception 
handle using the module-level `Loggerize.removeExceptionHandle()`.
