## Table of Contents

- [Foreword](loggers.md#loggers)
	
	

## Foreword

Persons wishing to upgrade to Loggerize can be assured that they will have most 
(if not all) of the features they have grown accustomed to in other other logging 
libraries. This tutorial will give an overview of how to access the features 
in Loggerize as you would have used in winston.

This document has an easy to follow outline. The winston examples are presented 
first then the equivalent loggerize code is present which may be 
compared/contrasted. 

### Quick Start

Just like in winston loggerize allows you to follow along using examples in the 
`/path/to/loggerize/examples/*.js`.

### Usage

### Logging

Just like winston, loggerize supports the severity ordering specified by 
[RFC5424](https://tools.ietf.org/html/rfc5424). This is in addition to 

### Creating your own logger

Both loggerize and winston support creating loggers and attaching multiple 
transports (known as targets in loggerize). The below examples show how to 
achieve the exact same result of creating a logger that outputs to both the 
console and a file.

In winston, a logger can be created as follows:

```javascript
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

In loggerize, the same logger can be created as follows:

```javascript
var logger = loggerize.createLogger({
	name: "myLogger", //all loggers must have a name
	handle: [
		{name: "myConsoleHandle"}, //console target is used by default
		{name: "myFileHandle", path: "combined.log"} //path automatically sets file target
	]
});
```

#### Running logs

To actually log output both loggerize and winston support the log method.
Additionally, both support the convenience methods that map to the levels 
defined on the logger.

The log function and convenience methods in both loggerize and winston are 
exactly the same. See the example below. It works the same in both libraries.

```
logger.log({
  level: 'info',
  message: 'Hello distributed log files!'
});

logger.info('Hello again distributed logs');
```

#### Adding and Removing Transports

What winston calls transports, Loggerize calls targets. Loggerize manages 
targets in something called a handle and each handle can only have one target.
Hence to add or remove transports in winston in analogous to attaching and 
dettaching handles in loggerize.

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
logger.attachHandles([{name: "myConsoleHandle"}, {name: "myFileHandle", path: "combined.log"}]);
logger.detachHandles(["myConsoleHandle", "myFileHandle"]});
```

#### String Interpolation

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

// info: test message my string
logger.log('info', 'test message %s', 'my string');

// info: test message 123
logger.log('info', 'test message %d', 123);

// info: test message first second {number: 123}
logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });
```

#### Filtering info Objects

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
logger.log('error', 'Public error to share');
logger.log('error', 'This is super secret - hide it.');
```

### Formats

Loggerize does not use any external dependencies to help format log data. All 
loggerize features are built from the ground up as part of the core library to 
maximize speed and efficiency.

To create a high performant, bespoke format for your logs is as simple as:

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

Conversely in winston

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

#### Creating custom formats

To create a custom format in winston would entail the following

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
				"format": "%{level} %{message}",
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
				"format": "%{level} %{message}",
			}
		},
});

//Output => 'SORRY FOR MAKING YOU YELL IN YOUR HEAD!'
scream.info("sorry for making you YELL in your head!");

//Output => 'why are they making us yell so much!'
whisper.info("WHY ARE THEY MAKING US YELL SO MUCH!");	
```

### Logging Levels

Both Loggerize and winston support logging levels in the severity order as defined 
by [RFC5424](https://tools.ietf.org/html/rfc5424)

This gives us support for levels such as syslog and npm as seen below.

Level Mapper (npm)

| LEVEL NAME| error	| warn	| info	| verbose	| debug	| silly |
| --------- | -----	|------ |------	| --------- | ----- | ----- |
| SEVERITY	| 0		| 1		| 2		| 3			| 4		| 5		|


Level Mapper (syslog)

| LEVEL NAME| emerg	| alert	| crit	| error	| warning	| notice| info	| debug |
| --------- | -----	|------ |------	| ----- | --------- | ----- | ----- | ----- |
| SEVERITY	| 0		| 1		| 2		| 3		| 4			| 5		| 6		| 7		|

If you do not explicitly define the levels that loggerize should use, the npm 
levels above will be used.

### Using Logging Levels

Loggerize and winston use logging levels in the same way

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

### Using Custom Logging Levels

To define your own custom levels in winston you would use 

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

//level config object
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

logger.log("foobar", "some foobar level-ed message"); //Outputs => 'foobar some foobar level-ed message'
```


Colorizing Standard logging levels

To colorize standard levels in winston add 
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



## Transports (known as Targets in loggerize)

Both loggerize and winston take advantage of Node's built-in networking and 
file I/O to write log output of various destinations such as files, console, 
network locations and more.

## Multiple transports of the same type

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

In loggerize to have multiple targets in the same logger is done is as follows:

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
and higher in the file called errors.log


In winston if you later want to remove one of these transports you can do so by 
using the transport itself. e.g.:

```javascript
const combinedLogs = logger.transports.find(transport => {
  return transport.filename === 'combined.log'
});

logger.remove(combinedLogs);
```

If you want to remove one of these target from the logger, this can be easily 
achieved thanks to loggerized named objects. You can thus use the 
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
callbacks. The formatted log message is stored in the 'output' field of the 
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

## Exceptions

### Handling Uncaught Exceptions with winston

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
exception is a global event loggerize handles it at the module level and thus 
you do not need to create a logger onto which to attach the exception handle. 
Thus in loggerize the same effect can be achieved as follows:

```javascript
var Loggerize = require("loggerize");

Loggerize.addExceptionHandle({
	name: "_exception", 
	path: 'exceptions.log'
});
```

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









