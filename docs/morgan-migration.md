## Table of Contents

- [Foreword](loggers.md#loggers)
	
	

## Foreword

Persons wishing to upgrade to Loggerize can be assured that they will have most 
(if not all) of the features they have grown accustomed to in other other logging 
libraries. This tutorial will give a quick overview of how to access the features 
in Loggerize as you would have used in winston.

## API

Loggerize can use a morgan like api via its `mw()` function.

```
var loggerize = require("loggerize");
loggerize.mw();
```

### Predefined HTTP Logging Formats

Just as morgan supports two of the most popular web loggin formats, so does 
loggerize.

#### combined

Standard Apache combined log output.

This format is styled in morgan as follows:
`:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"`

This format is styled in loggerize as follows:
`%{remoteIPv4} - %{user} [%{timestamp}] "%{method} %{path} %{protocol}/%{version}" %{statusCode} %{res.contentLength} %{referer} %{userAgent}`


#### common

Standard Apache common log output.

This format is styled in morgan as follows:
`:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]`

This format is styled in loggerize as follows:
`%{remoteIPv4} %{RFC1413identity} %{user} [%{timestamp}] "%{method} %{path} %{protocol}/%{version}" %{statusCode} %{res.contentLength}`


### Tokens

#### Creating new tokens

To define a token in morgan, you must invoke morgan.token() with the name and 
a callback function. This callback function is expected to return a string value.
The new token in the below example will be availble as ":type".

```
morgan.token('type', function (req, res) { 
	return req.headers['content-type'] 
})
```

To create a custom token in loggerize is as follows

```javascript
Loggerize.addTokens({
	"type": "TestLabel:"
});
```

Loggerize also offers all the same token values as morgan albeit with a different 
name for some of them. The table below shows the morgan tokens and its loggerize 
equivalent.

| morgan token 	| loggerize token 	|
| ------------- | ----------------- |
| :date 		| timestamp 		|
| :http-version | %{version} 		|
| :method 		| %{method} 		|
| :referrer 	| %{referrer} 		|
| :remote-addr 	| %{remoteIPv4} 	|
| :remote-user 	| %{user} 			|
| :response-time | %{responseTime} 	|
| :status 		| %{statusCode} 	|
| :url 			| %{url} 			|
| :user-agent 	| %{userAgent} 		|


## Examples

### express/connect

In morgan, to creap an app that will log all request in the Apache common format 
to STDOUT is: 

```javascript
var express = require('express')
var morgan = require('morgan')

var app = express()
app.use(morgan('combined'))

app.get('/', function (req, res) {
  res.send('hello, world!')
})
```


Similarly, to do the same thing in loggerize you will use:

```javascript
var loggerize = require("loggerize")

var app = express();
app.use(loggerize.mw());

app.get('/', function (req, res) {
  res.send('hello, world!')
})
```


### vanilla http server

In morgan, to creap an app that will log all request in the Apache common format 
to STDOUT is: 

```javascript
var finalhandler = require('finalhandler')
var http = require('http')
var morgan = require('morgan')

// create "middleware"
var logger = morgan('common')

http.createServer(function (req, res) {
  var done = finalhandler(req, res)
  logger(req, res, function (err) {
    if (err) return done(err)

    // respond to request
    res.setHeader('content-type', 'text/plain')
    res.end('hello, world!')
  })
})
```

Similarly, to do the same thing in loggerize you will use:

```javascript
var http = require('http');
var loggerize = require('../../lib/index.js');

var server = http.createServer(function (req, res){	
	// Request/Response logger
	loggerize.requestListener(req, res);
	
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(3000);

// Console will print the message
console.log("Server listening on port " + PORT + "!");
```

## Write logs to a file

### Single file

Morgan: Simple app that will log all requests in the Apache common format to 
the file access.log.

```javascript
var express = require('express')
var fs = require('fs')
var morgan = require('morgan')
var path = require('path')

var app = express()

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

// setup the logger
app.use(morgan('common', { stream: accessLogStream }))

app.get('/', function (req, res) {
  res.send('hello, world!')
})
```

Morgan: Simple app that will log all requests in the Apache common format to 
the file 'access.log'. No external libraries needed.

```javascript
var express = require('express')
var app = express();

var loggerize = require("loggerize");

// setup the logger
app.use(loggerize.mw({
	name":"myHTTPLogger",
	handle: {name: "myHTTPHandle", path: "common".log}
}));

app.get('/', function (req, res) {
	res.send('hello, world!')
})
```

### log file rotation

morgan: Simple app that will log all requests in the Apache combined format to 
one log file per day in the log/ directory using the rotating-file-stream module.

```javascript
var express = require('express')
var morgan = require('morgan')
var path = require('path')
var rfs = require('rotating-file-stream')

var app = express()

// create a rotating write stream
var accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

app.get('/', function (req, res) {
  res.send('hello, world!')
})
```

Likewise to achieve the same effect in loggerize is as follows.

```javascript
var express = require('express')
var app = express();

var loggerize = require("loggerize");

// setup the logger
app.use(loggerize.mw({
	name: "myLogger",
	handle: {name: "myHandle", interval: 'day'}
}));

app.get('/', function (req, res) {
	res.send('hello, world!')
})
```

## split / dual logging

Loggerize supports split/dual logging just like morgan.


morgan: Sample app that will log all requests to a file using Apache format, 
but error responses are logged to the console:

```javascript
var express = require('express')
var fs = require('fs')
var morgan = require('morgan')
var path = require('path')

var app = express()

// log only 4xx and 5xx responses to console
app.use(morgan('dev', {
  skip: function (req, res) { return res.statusCode < 400 }
}))

// log all requests to access.log
app.use(morgan('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))

app.get('/', function (req, res) {
  res.send('hello, world!')
})
```

The same effect can be achieved in loggerize by returning true on the logRecords 
that you want returned. In this case only return true when status code >= 400.

```javascript
var express = require('express');
var app = express();

var loggerize = require("loggerize");

// setup the logger
app.use(loggerize.mw({
	name: "myLogger",
	handle: [{
			name: "myHandle1", 
			filter: function(logRecord){
				return logRecord[statusCode] >= 400
			}
		},
		{name: "myHandle2", path: "access.log"}
	]
}));

app.get('/', function (req, res) {
	res.send('hello, world!')
})
```

## adding id to request

morgan - Sample app that will add an ID to all requests and displays it using 
the :id token.

```javascript
var express = require('express')
var morgan = require('morgan')
var uuid = require('node-uuid')

morgan.token('id', function getId (req) {
  return req.id
})

var app = express()

app.use(assignId)
app.use(morgan(':id :method :url :response-time'))

app.get('/', function (req, res) {
  res.send('hello, world!')
})

function assignId (req, res, next) {
  req.id = uuid.v4()
  next()
}
```

This same effect can be achieved in loggerize using:

```javascript
var express = require('express');
var app = express();

var loggerize = require("loggerize");

// setup the logger
app.use(loggerize.mw({
	name: "myLogger",
	handle: {
		name: "myHandle",
		formatter: {
			name: "myFormatter",
			format: "%{uuid} %{method} %{url} %{responseTime}"
		}
	}
}));

app.get('/', function (req, res) {
	res.send('hello, world!')
})
```


## use custom token formats





















