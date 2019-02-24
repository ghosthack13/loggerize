## Preface

Persons wishing to upgrade to Loggerize can be assured that they will have most 
(if not all) of the features they have grown accustomed to in other other logging 
libraries. This tutorial will give a quick overview of how to access the features 
in Loggerize as you would have used in winston.

## Table of Contents


### Quick Start

Just like in winston loggerize allows you to follow along using examples in the 
`/path/to/loggerize/examples/*.js`.

### Usage

### Logging

Just like winston, loggerize supports the severity ordering specified by 
[RFC5424](https://tools.ietf.org/html/rfc5424). This is in addition to 

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


#### String Interpolation

Unlike winston, Loggerize does not need to explicitly enable string interpolation 
and it does append empty brackets at the end of the interpolated string.

String interpolation in Loggerize

```javascript
var loggerize = require("loggerize");

// info: test message my string
logger.log('info', 'test message %s', 'my string');

// info: test message 123
logger.log('info', 'test message %d', 123);

// info: test message first second {number: 123}
logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });
```

String interpolation in winston
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

#### Filtering info Objects

winston's info Object is analogous to Loggerize's logRecord.

To filter a logRecord with a particular message, you can use Loggerize's 
regex filter.

```javascript
var loggerize = require("loggerize");
let logger = Loggerize.createLogger("myLogger");
logger.attachFilter("regex", {
	"pattern": /^This is super secret - hide it$/i, "onMatch": "deny"
});
logger.log('error', 'Public error to share');
logger.log('error', 'This is super secret - hide it.');
```

The equivalent in winston would be

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

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: {
			"name": "myFormatter",
			"transformer": "uppercase", //Call the uppercase transformer
			"format": "%{level} %{message}",
		}
	},
});

logger.info("Log Message Test!");	//Output => 'INFO LOG MESSAGE TEST!'
```













