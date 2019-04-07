## FORMATTERS

Formatters dictate how a log output should look when it is written to the desired 
target. A formatter is responsible for converting data from the logRecord to an 
output string which can be interpreted by a human or an external system. This 
output string is saved as a property in the logRecord called 'output'.

### Predefined Formatters

For your convenience Loggerizes ships with several built in formatters. Thses 
formatters cannot be altered or removed.

**default** - A Basic Formatter
```javascript
'%{level} %{message}'
// E.g. "info Log Message Test!"
```

**simple** - A Basic Formatter with timestamp
```javascript
'%{timestamp} %{level} %{message}'
// E.g. "22 Jan 2020 15:11:31 -0600 info Log Message Test!"
```

**exceptFmt** - An Exception Formatter (**N.B.** %\{stack} starts on a new line)
```javascript
'%{timestamp} %{level} (%{errorName}) %{message} %{stack}'
```

**common** - The Standard Apache common log output formatter.
```javascript
'%{remoteIPv4} %{RFC1413identity} %{user} [%{timestamp}] "%{method} %{path} %{protocol}/%{version}" %{statusCode} %{res.contentLength}'
```

**combined** - The Standard Apache combined log output formatter.
```javascript
'%{remoteIPv4} %{RFC1413identity} %{user} [%{timestamp}] "%{method} %{path} %{protocol}/%{version}" %{statusCode} %{res.contentLength} %{referer} %{userAgent}'
```

### Using Formatters

To use a formatter simply specify the formatter's name on a handle's formatter 
field. Each handle can only have **ONE** formatter. The below example uses the 
predefined formatter called 'simple'.

```javascript
// @filename formatter-simple.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: "simple",
	}
});

logger.info("Log Message Test!");	//Output => '22 Jan 2019 16:59:16 -0400 info Log Message Test!'
```

### Creating Formatters

For users who desire more flexibility, Loggerize allows the option to create 
custom formatters with unlimited possibilities from json serialization, 
console colorization, output function transformation and more.

#### Creating Formatters On-The-Fly

Formatters can be created and added on-the-fly by defining the formatter 
directly on the handle. Every formatter configuration requires a name.

```javascript
// @filename formatter-onthefly.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle",
		target: "console",		
		formatter: {
			name: "myFormatter", //formatter name is REQUIRED
			format: "%{level} %{loggerName} %{message}",
		},
	}
});

logger.info("Log Message Test!");	//Output => 'info myLogger Log Message Test!'
```

Formatters can use the `format` field to define how the log output should look 
when written to a target. The above example's format says to output the 
serverity level, logger name and log message with each log output.

#### Creating Formatters on the Module

Formatters can be created using the module-level function `addFormatter` and 
set via the formatter field on any handle. In fact, the 
[on-the-fly](#creating-formatters-on-the-fly) method above is just a wrapper 
for this method for creating formatters.

```javascript
// @filename formatter-addFormatter.js
var Loggerize = require("loggerize");

Loggerize.addFormatter({
	"name": "myFormatter",
	"format": "%{level} (Severity: %{levelNum}) %{message}",
});

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: "myFormatter",
	}
});

logger.info("Log Message Test!");	//Output to file => 'info (Severity: 2) Log Message Test!'
```

### JSON Serialization

Loggerize can JSON serialization log output by setting the json property in 
the formatter's configuration to `true` and declaring an array of tokens to 
serialize in the fields property.

```javascript
// @filename formatter-json.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle", 
		formatter: {
			name: "myFormatter",
			json: true,
			fields: ["level", "message"],
		},
	}
});

logger.info("Log Message Test!");	//Output => '{"level":"info","message":"Log Message Test!"}'
```

### Tokens

Formatters conveniently add commonly used log information to the log output via 
the use of `tokens`. Tokens can be thought of as placeholders that determine 
where a substitution should occur in the `format` property. The above example 
used three tokens: `level`, `levelNum` and `message`. Loggerize utilizes %-style 
mapping keys to indicate that the string should be interpreted as a token to be 
substituted. Hence `%{message}` tells the formatter to substitute `%{message}` 
with the given log message. Tokens can be mixed with normal string text within 
the format property as shown where `(Severity: %{levelNum})` only replaces 
`%{levelNum}` with the severity level of 2 while leaving its preceding text 
unchanged.

#### Token List

Loggerize provides several tokens that can be used within the format property.

The table below shows common tokens used for logging applications. Application 
tokens are also valid in logging HTTP requests/responses.

| Token 	| Description										|
|---------- | ---------------------------------------------- |
| level		| Alphabetical name of the severity level |
| levelNum	| Numeric value of the severity level |
| message	| The logged message |
| timestamp	| A timestamp as defined by [RFC3339](https://www.ietf.org/rfc/rfc3339.txt ) |
| uuid		| A Universally Unique Identifier in [RFC4122](http://www.ietf.org/rfc/rfc4122.txt ) format |
| loggerName | The name of the logger that created the log output |


The table below shows common HTTP/Middleware tokens. HTTP/Middleware tokens are 
only valid for logging HTTP requests/responses.

| Token 	| Example | Description									|
|---------- | ------- |------------------------------------------------ |
| remoteIPv4 | 172.217.0.174| The IPv4 address of the client (also attempts to determine real ip across proxies)|
| method	| 'GET'| The method the client used to request the service			|
| user		| 'Bob'| The username sent when using basic authentication			|
| protocol	| 'http'| The protocol the client used to request the service		|
| version	| '1.1'| The HTTP version of the client							|
| hostname	| 'example.com'| The hostname derived from the 'Host' HTTP header			|
| path		| '/status?format=terse'| The path requested from the domain						|
| url		| 'http://example.com/status?format=terse'| The full url requested									|
| referer	| 'https://nodejs.org/api/http.html'| The referer derived from the 'Referer' HTTP header		|
| referrer	| 'https://nodejs.org/api/http.html'| The referer derived from the 'Referrer' HTTP header		|
| userAgent	| 'Mozilla/5.0 (Windows NT 10.0;)'| The user agent that made the request to the service		|
| statusCode	| 404 | The status code of the response						|
| levelGroup	| 'client error'| The severity group to which the status code belongs	|
| levelGroupNum	| 400 | The severity value that indicates the start of the group to which the status code belongs |
| responseTime	| '231 ms' | The period between when a request is received and a response is sent |
| req.contentLength	| 254 | The size of the content received with the request		|
| res.contentLength	| 4627 |The size of the payload sent with the response		|


#### User-Defined Tokens

In addition to the built in tokens, Loggerize allows for the creation of user 
defined tokens as well. Tokens are added using the module-level function 
`addTokens` which accepts a Javascript object which defines the name of the 
token and the value of the token. Predefined tokens listed above cannot be 
overridden.

```javascript
// @filename formatter-addToken.js
var Loggerize = require("../lib/index.js");
Loggerize.addTokens({
	"label": "TestLabel:"
});

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle", 
		formatter: {
			name: "myFormatter",
			format: "%{label} %{level} %{message}",
		},
	}
});

logger.info("Log Message Test!");	//Output => 'TestLabel: info Log Message Test!'
```

#### Token Modifiers

Token Modifiers change how individual tokens are handled before they are 
substituted into the final log output. All tokens can be modified using the 
`style` option and the `transformer` option. See 
[Styling Output](styling-output) as well as [transformers](#transformers) 
for more details. To set a token modifier simply put the name of the token as a 
property in the formatter definition with modifications defined as a standard 
Javascript Object.

```javascript
var Loggerize = require("../lib/index.js");

Loggerize.addFormatter({
	"name": "myFormatter",
	"message": {"style": "red"},
	"format": "%{timestamp} %{level} %{message}",
});

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"hasHandles": false //set to false to avoid automatically adding the default handle
});

logger.attachHandles({
	name: "myHandle",
	target: "console",
	formatter: "myFormatter",
});

logger.info("Log Message Test!");	//Output => '2019-01-14T01:05:32.074Z info Log Message Test!'
```

The above example causes the log message to be written to the console in a red 
font. Additionally some tokens have unique modifiers. `timestamp` is one such 
example. Using the token modifier `timestamp: {"pattern": "ISO"}` in a 
formatter will cause the the timestamp to output in ISO format. `timestamp` can 
also be modified using fine-grain [Date/Time Directives](#date-time-directives). 
For example, to output only the time portion of the `timestamp`, one can use 
the following pattern directive: `timestamp: {"pattern": "%H:%M:%S"}`.

### Date/Time Directives

The following are directives that can be used to modify the timestamp token. Additionally these directives 
can be used in the `fileNamePattern` of the `rotatingFile` (interval) target.

| Directive	| Meaning												| Example						|
|---------- | -----------------------------------------------------	| ----------------------------- |
| %Y		| Year without century as a zero-padded decimal number	| 00, 01, ..., 99				|
| %y		| Year with century as a decimal number					| 0002, ..., 2014, ..., 9998 	|
| %B		| Month as full name 									| January, February, ..., December |
| %b		| Month as abbreviated name 							| Jan, Feb, ..., Dec			|	
| %m		| Month as a zero-padded decimal number					| 01, 02, ..., 12				|
| %d		| Day of the month as a zero-padded decimal number		| 01, 02, ..., 31				|
| %w		| Weekday as a decimal number, where 0 is Sunday and 6 is Saturday	| 0, 1, ..., 6		|
| %H		| Hour (24-hour clock) as a zero-padded decimal number	| 00, 01, ..., 23				|
| %I		| Hour (12-hour clock) as a zero-padded decimal number	| 01, 02, ..., 12				|
| %M		| Minute as a zero-padded decimal number				| 00, 01, ..., 59				|
| %S		| Second as a zero-padded decimal number				| 00, 01, ..., 59				|
| %A		| Weekday as full name									| Sunday, Monday, ..., Saturday	|
| %a		| Weekday as abbreviated name							| Sun, Mon, ..., Sat			|
| %z		| UTC offset in the form ±HHMM							| +0000, -0400, +1030, -6000	|
| %%		| A literal '%' character								| %								|


### Color Specifications

Loggerize supports basic ANSI terminal stylers which allows the font and the 
background to be modified according to various specifications. Loggerize uses 
[chalk](https://github.com/chalk/chalk) style directives.

Font Styles: 
> `bold, dim, italic, underline, inverse, hidden, strikethrough`

**Note** Font styles are not widely supported in terminals and it is very likely 
that your terminal actually will not support most of the font styles listed above.

Font Colors: 
> `black, red, green, yellow, blue, magenta, cyan, white`

Font Colors (Bright):
> `gray/grey ("brightblack"), redBright, greenBright, yellowBright, blueBright, magentaBright, cyanBright, whiteBright`

Background Colors: 
>`bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite`

Background Colors (Bright): 
>`bgBlackBright, bgRedBright, bgGreenBright, bgYellowBright, bgBlueBright, bgMagentaBright, bgCyanBright, bgWhiteBright`


### Setting Level Colors

When viewing log levels on the console it is advantageous be able to easily 
determine the severity of a log event. Loggerize provides such a facility via 
colorized log levels. To activate log level colors simply call the module-level 
function `colorizeLevels()`. This will assign default colors to each severity 
level. `colorizeLevels()` also accepts user defined color mappings by passing 
a color map as the first parameter.

```javascript
// @filename formatter-colorizelevels.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger",
	handle: {
		name: "myHandle",
		formatter: "simple",
	},
});

var colorMap = {
	"error": 	"redBright", 
	"warn": 	"yellowBright", 
	"info": 	"purpleBright", 
	"verbose": 	"blueBright", 
	"debug": 	"greenBright",
};
Loggerize.colorizeLevels(colorMap);

logger.log("error", "Color Coded Log Message"); //Output => 'info Log Message Test!'
logger.log("warn", 	"Color Coded Log Message");
logger.log("info", 	"Color Coded Log Message");
logger.log("verbose", "Color Coded Log Message");
logger.log("debug", "Color Coded Log Message");
```

The `colorMap` defined above is identical to the default color map used if 
`colorizeLevels()` is called without passing any parameters.

If you decide that you no longer want to use level colors, simply call the 
`decolorizeLevels()` module-level function.

### Styling Output

A font color can be applied to the entire log output by declaring a `style` 
field on the formatter object.

```javascript
// @filename formatter-style-output.js
var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle", 
		formatter: {
			name: "myFormatter",
			style: "bgblue yellowBright underline",
			format: "%{level} %{message}",
		},
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
```

The above will print the log output to the console with a blue background, 
underline and with a yellow font.

If you prefer to style individual tokens, the `style` field is a also valid 
[token modifier](#token-modifiers). For example to underline the severity 
level and set the message in a yellow font with a blue background, modify 
the tokens as follows.

```javascript
// @filename formatter-style-token.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle", 
		formatter: {
			name: "myFormatter",
			level: {
				style: ["underline"],
			},
			message: {
				style: "bgblue yellowbright",
			},
			format: "%{level} %{message}",
		},
	}
});

logger.info("Log Message Test!");	//Output => 'info Log Message Test!'
```




