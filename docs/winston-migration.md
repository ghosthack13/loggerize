## Table of Contents

- [Foreword](#foreword)
- [Logging](#logging)
- [Logging Levels](#logging-levels)
- [Formats](#formats)
- [Transports](#transports)
- [Exceptions](#exceptions)
- [Default Logger](#)

## Foreword

Persons wishing to upgrade to Loggerize can be assured that they will have most 
(if not all) of the features they have grown accustomed to in other other logging 
libraries. This tutorial will give an overview of how to access the features 
in Loggerize as you would have used in winston. The biggest difference is that 
in loggerize everything must have a name defined.

This document has an easy to follow outline. The winston examples are presented 
first, then the equivalent loggerize code is presented with an optional 
compare/contrast section. You can then check the 
[loggerize wiki](https://github.com/ghosthack13/loggerize/wiki) at any time 
for more information on the additional features loggerize makes available.

### Quick Start

Just like in winston, loggerize allows you to follow along with source code 
examples that can be found in the `/path/to/loggerize/examples/*.js` directory. 

### Usage

## Logging

Just like winston, loggerize supports the severity ordering specified by 
[RFC5424](https://tools.ietf.org/html/rfc5424) where severity levels are 
numerically ascending from most important to least important.

### Logging Levels

Just like winston, loggerize supports both syslog and npm logging levels. 
Additionally loggerize also supports python and HTTP logging levels.

Python Logging Levels

| LEVEL NAME| debug	| info	| warning	| error		| critical	|
| --------- | -----	|------ |----------	| --------- | --------- |
| SEVERITY	| 10	| 20	| 30		| 40		| 50		|


HTTP Logging Levels

| LEVEL NAME| informational	| success	| redirection	| client error	| server error	|
| --------- | -------------	| --------- | -------------	| ------------- | ------------- |
| SEVERITY	| 100			| 200		| 300			| 400			| 500			|

If you do not explicitly define the levels that loggerize should use, the npm 
levels above will be used.

### Using Logging Levels

Loggerize and winston use logging levels in the same way.

```javascript
//
// Any logger instance
//
logger.log('silly', "127.0.0.1 - there's no place like home");
logger.log('debug', "127.0.0.1 - there's no place like home");
logger.log('verbose', "127.0.0.1 - there's no place like home");
logger.log('info', "127.0.0.1 - there's no place like home");
logger.log('warn', "127.0.0.1 - there's no place like home");
logger.log('error', "127.0.0.1 - there's no place like home");
logger.info("127.0.0.1 - there's no place like home");
logger.warn("127.0.0.1 - there's no place like home");
logger.error("127.0.0.1 - there's no place like home");

//
// Default logger
//
loggerize.log('info', "127.0.0.1 - there's no place like home");
loggerize.info("127.0.0.1 - there's no place like home");
```

### Using Custom Logging Levels (with colorization)

To define your own custom levels in winston you could use:

```
const myCustomLevels = {
  levels: {
    foo: 0,
    bar: 1,
    baz: 2,
    foobar: 3
  },
  colors: {
    foo: 'blue',
    bar: 'green',
    baz: 'yellow',
    foobar: 'red'
  }
};

const customLevelLogger = winston.createLogger({ 
  levels: myCustomLevels.levels 
});

customLevelLogger.foobar('some foobar level-ed message');
```

Corollary, to achieve the same result in loggerize is as follows:

```javascript
// @filenmae levels-createlevelmap.js
var Loggerize = require("../lib/index.js");

let levelMap = {
	foo: 0,
    bar: 1,
    baz: 2,
    foobar: 3
};

let colorMap: {
	foo: 'blue',
	bar: 'green',
	baz: 'yellow',
	foobar: 'red'
};

Loggerize.createLevelMap("myCustomLevels", levelMap);
Loggerize.colorizeLevels("myCustomLevels", colorMap);
Loggerize.setLevelMapper("myCustomLevels");

let logger = Loggerize.createLogger({
	"name": "myLogger",
	"levelMapper": "myCustomLevels",
	"handle": { "name": "myHandle" },
});

logger.foobar("some foobar level-ed message"); //Outputs => 'foobar some foobar level-ed message'
```

For a more detailed explanation on using custom levels in loggerize see, 
[User-Defined Levels](levels.md#user-defined-levels).

### Colorizing Standard logging levels

To colorize standard levels in winston use: 
```javascript
winston.format.combine(
  winston.format.colorize(),
  winston.format.json()
);
```

To colorize standard levels in loggerize use:
```javascript
loggerize.colorizeLevels()
```

### Creating your own logger

Both loggerize and winston support creating loggers and attaching multiple 
transports (known as targets in loggerize). The below examples show how to 
achieve the exact same result of creating a logger that outputs to both the 
console and a file.

In winston, loggers can be created as follows:

```javascript
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

In loggerize, loggers can be created as follows:

```javascript
var logger = loggerize.createLogger({
	name: "myLogger", //all loggers must have a name
	handle: [
		{name: "myConsoleHandle", target: "console"},
		{name: "myFileHandle", path: "combined.log"}
	]
});
```

For a more detailed explanation on creating loggers in loggerize see, 
[Creating Loggers](loggers.md#creating-loggers).

### Creating Child Loggers

The concept of child loggers in winston is different from that of loggerize and 
the logging libraries that inspired it such as the python logging library and 
log4j. loggerize views child loggers as any logger that has a name delimited by 
a period and traverses upwards from the current logger all the way up to the 
root logger.

### The `log()` Command

To actually log output, both loggerize and winston implement a `log()` function.
Additionally, both support the convenience methods that map to the levels 
defined on the logger.

The log() api and convenience methods in both loggerize and winston are called 
the same way, that is by calling the severity level as a function and passing 
the message as its parameter. See the example below:

```
logger.log({
  level: 'info',
  message: 'Hello distributed log files!'
});

logger.info('Hello again distributed logs');
```

For a more detailed explanation on creating loggerize logs see, 
[Application Logging](loggers.md#application-logging).

### String Interpolation

Unlike winston, Loggerize does not need to explicitly enable string interpolation 
nor does it append empty brackets at the end of the interpolated string.

String interpolation in winston:

```javascript
const { createLogger, format, transports } = require('winston');
const logger = createLogger({
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports: [new transports.Console()]
});

// info: test message my string {}
logger.log('info', 'test message %s', 'my string');

// info: test message 123 {}
logger.log('info', 'test message %d', 123);

// info: test message first second {number: 123}
logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });
```

String interpolation in Loggerize:

```javascript
var loggerize = require("loggerize");

var logger = loggerize.createLogger("myLogger");

// info test message my string
logger.log('info', 'test message %s', 'my string');

// info test message 123
logger.log('info', 'test message %d', 123);

// info test message first second {number: 123}
logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });
```

### Filtering info Objects

winston's info Object is analogous to Loggerize's logRecord. 

To filter an info Object in winston is as follows:

```javascript
const { createLogger, format, transports } = require('winston');

// Ignore log messages if they have { private: true }
const ignorePrivate = format((info, opts) => {
  if (info.private) { return false; }
  return info;
});

const logger = createLogger({
  format: format.combine(
    ignorePrivate(),
    format.json()
  ),
  transports: [new transports.Console()]
});

// Outputs: {"level":"error","message":"Public error to share"}
logger.log({
  level: 'error',
  message: 'Public error to share'
});

// Messages with { private: true } will not be written when logged.
logger.log({
  private: true,
  level: 'error',
  message: 'This is super secret - hide it.'
});
```

To filter a logRecord, you can use Loggerize's built in regex filter.

```javascript
var loggerize = require("loggerize");
let logger = Loggerize.createLogger("myLogger");
logger.attachFilter("regex", {
	"pattern": /^This is super secret - hide it$/i, "onMatch": "deny"
});

// Outputs: 'error Public error to share'
logger.log('error', 'Public error to share');

// No output. Log will not be written
logger.log('error', 'This is super secret - hide it.');
```

For a more detailed explanation on loggerize filtering see, 
[Filtering](filters.md#filters).

## Formats

Both loggerize and winston allow you to format log output. Loggerize however, 
does not use any external dependencies to help format log data. All loggerize 
features are built from the ground up as part of the core library to maximize 
speed and efficiency.

To format log output in winston, can be done as follows:

```javascript
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    label({ label: 'right meow!' }),
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console()]
});
```

To achieve the same format of log output as above, use loggerize as follows:

```javascript
var loggerize = require("loggerize");
loggerize.addTokens({"label": "right meow!"});

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle",
		target: "console",
		formatter: {
			name: "myFormatter",
			format: "%{timestamp} [%{label}] %{level} %{message}",
		},
	}
});
```

Loggerize does not need additional classes or methods to create and combine formats. 
Simply place the token/placeholder in the format field and loggerize does the rest.

### Creating custom formats

When formatting in winston you must directly interface with prototypal objects 
and manual define a transform method etc. Conversely thanks to loggerize's 
string based configurations you can achieve the same result without directly 
interfacing any class instances.

To create a custom format in winston entails the following:

```javascript
const { format } = require('winston');

const volume = format((info, opts) => {
  if (opts.yell) {
    info.message = info.message.toUpperCase();
  } else if (opts.whisper) {
    info.message = info.message.toLowerCase();
  }

  return info;
});

// `volume` is now a function that returns instances of the format.
const scream = volume({ yell: true });
console.dir(scream.transform({
  level: 'info',
  message: `sorry for making you YELL in your head!`
}, scream.options));
// {
//   level: 'info'
//   message: 'SORRY FOR MAKING YOU YELL IN YOUR HEAD!'
// }

// `volume` can be used multiple times to create different formats.
const whisper = volume({ whisper: true });
console.dir(whisper.transform({
  level: 'info',
  message: `WHY ARE THEY MAKING US YELL SO MUCH!`
}, whisper.options));
// {
//   level: 'info'
//   message: 'why are they making us yell so much!'
// }
```

To create the same format in loggerize is as follows:

```
// @filename transformer-output.js
var Loggerize = require("../../lib/index.js");

let scream = Loggerize.createLogger({
	"name": "myLogger1", 
	"handle": {
			name: "myHandle1",
			formatter: {
				"name": "screamFormatter",
				"transformer": "uppercase", //Call the uppercase transformer
			}
		},
});

let whisper = Loggerize.createLogger({
	"name": "myLogger2", 
	"handle": {
			name: "myHandle2",
			formatter: {
				"name": "whisperFormatter",
				"transformer": "lowercase", //Call the lowercase transformer
			}
		},
});

//Output => 'INFO SORRY FOR MAKING YOU YELL IN YOUR HEAD!'
scream.info("sorry for making you YELL in your head!");

//Output => 'info why are they making us yell so much!'
whisper.info("WHY ARE THEY MAKING US YELL SO MUCH!");	
```

## Transports (known as Targets in loggerize)

What winston calls transports are analogous to what loggerize calls targets. 
Both loggerize and winston take advantage of Node's built-in networking and 
file I/O to write log output of various destinations such as files, console, 
network locations and more.

### Adding and Removing Transports

Loggerize manages targets via its handle configuration with each handle allowed  
only one target. Hence to add or remove transports in winston in analogous to 
attaching and dettaching handles in loggerize.

Adding and removing transports in winston:

```
const files = new winston.transports.File({ filename: 'combined.log' });
const console = new winston.transports.Console();

logger
  .clear()          // Remove all transports
  .add(console)     // Add console transport
  .add(files)       // Add file transport
  .remove(console); // Remove console transport
```

Adding and removing handles in loggerize:

```
logger.attachHandles([
	{name: "myConsoleHandle"}, 
	{name: "myFileHandle", path: "combined.log"}
]);
logger.detachHandles(["myConsoleHandle", "myFileHandle"]});
```

For a more detailed explanation on removing loggerize handles 
(which removes loggerize targets) see, [Handles](handles.md#handles).

### Multiple Transports of the Same Type

To create multiple transports of the same type in winston is as follows:

```javascript
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'combined.log',
      level: 'info'
    }),
    new winston.transports.File({
      filename: 'errors.log',
      level: 'error'
    })
  ]
});
```

In loggerize to have multiple targets of the same type is done is as follows:

```javascript
var logger = loggerize.createLogger({
	name: "myLogger",
	handle: [
		{name: myFileHandle1, level: "info", path: "combined.log"},
		{name: myFileHandle2, level: "error", path: "errors.log"}
	]
});
```

The above example will log all events with a severity level of info and higher 
in the file called combined.log, and log all events with a severity level of error 
and higher in the file called errors.log.

In winston if you later want to remove one of these transports you can do so by 
using the transport itself. e.g.:

```javascript
const combinedLogs = logger.transports.find(transport => {
  return transport.filename === 'combined.log'
});

logger.remove(combinedLogs);
```

If you want to remove one of these target from the logger, this can be easily 
achieved thanks to loggerized named objects. You can simply use the 
detachHandles method as follows:

```javascript
logger.detachHandles("myFileHandle1");
```

## Adding Custom Transports

In winston to add custom transports you are required to accept any options you 
need, implement a log() method, and consume it with winston.

```javascript
const Transport = require('winston-transport');
const util = require('util');

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class YourCustomTransport extends Transport {
  constructor(opts) {
    super(opts);
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail, 
    //   logentries, etc.).
    //
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Perform the writing to the remote service
    callback();
  }
};
```

To achieve the same effect in loggerize is even simpler. There is no need to 
extend other classes, or implement any mandatory functions, or call any 
callbacks. Formatted log messages are stored in the 'output' field of the 
logRecord. Send the contents of logRecord["output"] to any destination such 
as console, databases, etc.

```javascript
var loggerize = require("loggerize");
loggerize.addTarget("yourCustomTarget", function(logRecord, handleOpts){
	process.stdout.write(logRecord["output"]);
	handleOpts["emitter"].emit("logged", logRecord);
})
```

The above example creates a custom target that writes the formatted log data 
to the standard output and emits a 'logged' event.

For a more detailed explanation on creating custom target in loggerize see, 
[User-Defined Targets](target.md#user-defined-targets).

## Exceptions

### Handling Uncaught Exceptions

With winston you can handle uncaught exceptions produced by your process.

```
const { createLogger, transports } = require('winston');

// Enable exception handling when you create your logger.
const logger = createLogger({
  transports: [
    new transports.File({ filename: 'combined.log' }) 
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'exceptions.log' })
  ]
});
```

Loggerize also fully supports handling/logging uncaught exceptions. Since an 
uncaught exception is a global event, loggerize handles it at the module-level 
and thus you do not need to create a logger onto which to attach the exception 
handle. Thus in loggerize the same effect can be achieved as follows:

```javascript
var Loggerize = require("loggerize");

Loggerize.addExceptionHandle({
	name: "_exception", 
	path: 'exceptions.log'
});
```

**N.B.**

Loggerize does not allow you to continue after the `uncaughtException` event 
occurs. This may change in the future but as of now, there has not been a 
viable argument presented that can justify allowing a program to continue 
in an unknown and unstable state.

(Do however, feel free to present your argument on why this should be a feature)

##Further Reading

### Using the Default Logger

Like winston loggerize allows you to access the default logger through the 
loggerize module. Any method that you could call on an instance of a logger is 
available on the default logger:

```javascript
const loggerize = require('loggerize');

loggerize.log('info', 'Hello distributed log files!');
loggerize.info('Hello again distributed logs');
```

Loggerize default logger has a severity level of debug and sends data to the 
console target.

### Awaiting Log to be Written

Just like winston loggerize allows you to wait for logs to be written before 
exiting. Similarly, it will emit the 'finish' event when all logs have been 
flushed and all streams have been closed.

To await logs in winston is as follows:

```javascript
const transport = new winston.transports.Console();
const logger = winston.createLogger({
  transports: [transport]
});

logger.on('finish', function (info) {
  // All `info` log messages has now been logged
});

logger.info('CHILL WINSTON!', { seriously: true });
logger.end();
```

Loggerize's implementation is slightly different. In loggerize to close off 
all streams you have to call the module-level function `shutdown` and use the 
module-level listener to process the 'finish' event.

Hence to await logs in loggerize is as follows:

```javascript
const loggerize = require('loggerize');

loggerize.on("finish", function(){
	// All log messages has now been logged
});

var logger = loggerize.createLogger("myLogger");
loggerize.info('CHILL LOGGERIZE!', { seriously: true });
loggerize.shutdown();
```



