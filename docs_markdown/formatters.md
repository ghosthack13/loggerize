## FORMATTERS

Formatters stipulate how a log output should look when it is written to the desired targets. 
A formatter is responsible for converting a logRecord to an output string which can be interpreted 
by a human or an external system.

### Creating/Deleting Formatters

User defined formatters are created using the module-level function `addFormatter` and its use is 
managed by a handle, that determines which formatter will be applied to a given target. A handle 
can only have one formatter defined at a time.

```javascript
var Loggerize = require("../lib/index.js");
Loggerize.addFormatter({
	"name": "myFormatter",
	"format": "%{level} (Severity: %{levelNum}) %{message}",
});
let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"hasHandles": false //set to false to avoid automatically adding the default handle
});

logger.attachHandles({
	name: "myHandle",
	target: "console",
	formatter: "myFormatter", // Apply the formatter named "myFormatter" to the designated target
});
logger.info("Log Message Test!");	//Output => 'info (Severity: 2) Log Message Test!'
```

The formatter above uses the `format` field to define how the log output should look 
when written to a target. The above example writes `info (Severity: 2) Log Message Test!` to the 
console target.

Alternatively, the above code can be condensed by defining the formatter directly on the handle to 
produce the same result. All examples henceforth will utilize this condensed form to add formatters.

```javascript
var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger({
	name: "myLogger", 
	handle: {
		name: "myHandle",
		target: "console",		
		formatter: {
			name: "myFormatter",
			format: "%{level} (Severity: %{levelNum}) %{message}",
		},
	}
});

logger.info("Log Message Test!");	//Output => 'info (Severity: 2) Log Message Test!'
```

If a formatter is no longer needed the formatter can be removed by calling the module-level function 
`removeFormatter()`. `removeFormatter()` accepts either a string or an array of strings as its only parameter.
For example `removeFormatter("myFormatter")` will remove the 
formatter name "myFormatter" defined above.

### Predefined Formatters

For your convenience Loggerizes ships with several built in formatters.



### Tokens

Formatters conveniently add commonly used log information to the log output via the use of `tokens`. 
Tokens can be thought of as placeholders that determine where a substitution should occur in the `format` 
property. The above example used three tokens: `level`, `levelNum` and `message`. Loggerize utilizes 
%-style mapping keys to indicate that the string should be interpreted as a token to be substituted. Hence 
`%{message}` tells the formatter to substitute `%{message}` with the given log message. Tokens can be mixed with 
normal string text within the format property as shown where `(Severity: %{levelNum})` only replaces `%{levelNum}` 
with the severity level of 2 while leaving its preceding text unchanged.

#### Token List

Loggerize provides several tokens that can be used within the format property. Predefined tokens cannot be overridden.

See table below for common application tokens. Application tokens are also valid in logging HTTP requests/responses.

| Token 	| Description										|
|---------- | ---------------------------------------------- |
| level		| Alphabetical name of the severity level |
| levelNum	| Numeric value of the severity level |
| message	| The logged message |
| timestamp	| The date/time point the log was created as returned from Date().toLocaleString()  |
| uuid		| A Universally Unique Identifier in [RFC4122](http://www.ietf.org/rfc/rfc4122.txt) format |
| loggerName | The name of the logger that created the log output |


See table below for common HTTP/Middleware tokens. HTTP/Middleware tokens are only valid for logging
HTTP requests/responses.

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
| req.contentLength	| 254 | The size of the payload sent with the request		|
| res.contentLength	| 4627 |The size of the payload sent with the response		|


#### Custom Tokens

In addition to the built in tokens, Loggerize allows for the creation of user defined tokens as well.
Tokens are added using the module-level function `addTokens` which accepts a Javascript object which 
defines the name of the token and the value of the token.

```javascript
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

Token Modifiers change how individual tokens are handled before they are substituted 
into the final log output. All tokens can be modified using the `style` option and the 
`transformer`. See Colors & Style as well as transformers for more details. To set a token 
modifier simply put the name of the token as a property in the formatter definition with modifications 
defined as a standard Javascript Object

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

The above example causes the log message to be written to the console in a red font.
Additionally some tokens have unique modifiers. `timestamp` is one such example.
Using the token modifier `timestamp: {"pattern": "ISO"}` in a formatter will cause the 
the timestamp to output in ISO format. `timestamp` can also be modified using fine-grain 
pattern directives. For example, to output only the time in the `timestamp`, one can use the following pattern 
directive: `timestamp: {"pattern": "%H:%M:%S"}`.

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

Loggerize supports basic ANSI terminal stylers which allows the font and the background to be modified 
according to various specifications. Loggerize uses [chalk](https://github.com/chalk/chalk) style directives.

Font styles: 
> `bold, dim, italic, underline, inverse, hidden, strikethrough`

Font Colors: 
> `black, red, green, yellow, blue, magenta, cyan, white`

Font Colors (Bright):
> `gray/grey ("brightblack"), redBright, greenBright, yellowBright, blueBright, magentaBright, cyanBright, whiteBright`

Background colors: 
>`bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite`

Background colors (Bright): 
>`bgBlackBright, bgRedBright, bgGreenBright, bgYellowBright, bgBlueBright, bgMagentaBright, bgCyanBright, bgWhiteBright`


### Level Colors

When viewing log levels on the console it advantageous be able to easily determine the severity of a log event.
Loggerize provides such a facility via colorized log levels. To activate log level colors simply call the module-level 
function `colorizeLevels()`. This will assign default colors to each severity level.
`colorizeLevels()` also accepts user defined color mappings by passing a color map as the first parameter.

```javascript
var Loggerize = require("../lib/index.js");

let logger = Loggerize.createLogger({name: "myLogger"});

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

The `colorMap` defined above is identical to the default color map used if `colorizeLevels()` is called 
without passing any parameters.

If you decide that you no longer want to use level colors, simply call the `decolorizeLevels()` module-level 
function.


### Styling Output

A font color can be applied to the entire log output by declaring a `style` field on the formatter object.
```javascript
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

If you prefer to style individual tokens, the `style` field is a also valid [token modifier](#token-modifiers).
For example to colorize only the message portion of the log output in a red font, add `message: {style: "red"}` in 
the formatter object.





