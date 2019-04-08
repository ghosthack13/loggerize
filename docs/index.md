# Loggerize

*ONE LOGGER TO RULE THEM ALL ...*

## Table of Contents
- [Motivation](#motivation)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Testing & Linting](#testing-linting)
- [Versioning](#versioning)
- [Contributing](#contributing)
- [Authors](#authors)
- [Donations](#donations)
- [Licence](#licence)
- [Loggers](loggers.md#loggers)
	- [Creating Loggers](loggers.md#creating-loggers)
	- [Application Logging](loggers.md#application-logging)
	- [HTTP Logging](loggers.md#http-logging)
		- [Split Request/Response Logging](loggers.md#split-requestresponse-logging)
		- [Vanilla HTTP Logging](loggers.md#vanilla-http-logging)
		- [Express/Connect Middleware Logging](loggers.md#expressconnect-middleware-logging)
	- [String Interpolation](loggers.md#string-interpolation)
- [Levels](levels.md#levels)
	- [Level Mappers (Intermediate)](levels.md#level-mappers-intermediate)
	- [Using Logging Levels](levels.md#using-logging-levels)
	- [User-Defined Logging Levels (Advance)](levels.md#user-defined-logging-levels-advance)
- [Handles](handles.md#handles)
	- [Creating Handles](handles.md#creating-handles)
	- [Deleting Handles](handles.md#deleting-handles)
	- [The Uncaught Exception Handle](handles.md#the-uncaught-exception-handle)
- [Targets](targets.md#targets)
	- [Console Target](targets.md#console-target)
	- [File Target](targets.md#file-target)
		- [File Target Configurations](targets.md#file-target-configurations)
	- [Rotating File Target](targets.md#rotating-file-target)
		- [Rotating File (Interval) Configurations](targets.md#rotating-file-interval-configurations)
		- [Rotating File (Size) Configurations](targets.md#rotating-file-size-configurations)
	- [HTTP Target](targets.md#http-target)
		- [HTTP Configurations](targets.md#http-configurations)
- [The LogRecord (Advance)](logrecord.md#the-logrecord-advance)
- [Filters](filters.md#filters)
	- [Logger Attached Filters](filters.md#logger-attached-filters)
	- [Handle Attached Filters](filters.md#handle-attached-filters)
	- [User-Defined Filters (Advance)](filters.md#user-defined-filters-advance)
		- [Using Custom Filters on Logger](filters.md#using-custom-filters-on-logger)
		- [Using Custom Filters on Handle](filters.md#using-custom-filters-on-handle)
- [Formatters](formatters.md#formatters)
	- [Predefined Formatters](formatters.md#predefined-formatters)
	- [Creating Formatters](formatters.md#creating-formatters)
		- [Creating Formatters On-The-Fly](formatters.md#creating-formatters-on-the-fly)
		- [Creating Formatters on the Module](formatters.md#creating-formatters-on-the-module)
	- [JSON Serialization](formatters.md#json-serialization)
	- [Tokens](formatters.md#tokens)
		- [Token List](formatters.md#token-list)
		- [User-Defined Tokens](formatters.md#user-defined-tokens)
		- [Token Modifiers](formatters.md#token-modifiers)
	- [Date/Time Directives](formatters.md#datetime-directives)
	- [Color Specifications](formatters.md#color-specifications)
	- [Setting Level Colors](formatters.md#setting-level-colors)
	- [Styling Output](formatters.md#styling-output)
- [Transformers](transformers.md#transformers)
	- [Transforming Output](transformers.md#transforming-output)
	- [Transforming Tokens](transformers.md#transforming-tokens)
	- [User-Defined Transformers (Advance)](transformers.md#user-defined-transformers-advance)
		- [Using Custom Transformers on Output](transformers.md#using-custom-transformers-on-output)
		- [Using Custom Transformers on Tokens](transformers.md#using-custom-transformers-on-tokens)
- [Events](events.md#events)
	- [Event Notification - Filtered](events.md#event-notification---filtered)
	- [Event Notification - Logged](events.md#event-notification---logged)
	- [Event Notification - Error](events.md#event-notification---error)
	- [Global Listener](events.md#global-listener)
- [Shutdown](shutdown.md#shutdown)

## Motivation

The aim of Loggerize (also known as LoggerizeJS) was to create a universal 
JavaScript Logging Library simple enough for users who only began programming 
yesterday, yet comprehensive enough to satisfy even the most demanding and 
experienced coders.

## Features

- Log both Application and HTTP/[Express](https://www.npmjs.com/package/express) Middleware events in one unified interface 
- No third party dependencies to cause untraceable bugs
- Hundreds of unit/integration test for stability
- Extensive documentation with dozens of bespoke exmples
- Simple to memorize configurations defined as plain text strings instead of 
  complicated multilevel class methods
- Easily extends functionally with nothing more than anonymous functions or 
  JavaScript objects
- Advance state aware filters
- Custom log levels and level colors
- Text string and JSON log output formats
- Heirarchial logger names and ancestor traversal

## Installation

`npm i loggerize`

## Quick Start

For those not interesting in reading the documentation/tutorials, see below for 
the simplest way to immediately get up and running with the most basic logger.

```javascript
var Loggerize = require("loggerize");

//Create Basic Logger
let logger = Loggerize.createLogger("myLogger");

// Outputs => 'debug Successfully Logged'
logger.debug("Successfully Logged");
```

Likewise, see below for how to quickly start logging 
[Connect](https://www.npmjs.com/package/connect)/[Express](https://www.npmjs.com/package/express) 
Middleware. Log message will output according to the Apache [common](https://httpd.apache.org/docs/1.3/logs.html#common) 
log format.

```javascript
var app = require('express')();
var loggerize = require("loggerize");

// Call middleware logger directly from the library
app.use(loggerize.mw());

app.get('/', function(req, res){
	res.send('Hello World!')
});

//Start listening on port 3000
app.listen(3000, function(){
	console.log("App listening on port 3000!")
});
```

## Testing & Linting

To run the unit tester and the linter, navigate to the loggerize sub-directory of the 
node_modules directory (`cd /path/to/node_modules/loggerize`) and run the 
commands below:

Testing with [mocha](https://mochajs.org): `npm test`

Linting with [eslint](https://eslint.org): `npm run lint`

## Versioning

Loggerize uses [SemVer](http://semver.org/) for versioning. For the versions 
available, 
see the [tags on this repository](https://github.com/ghosthack13/loggerize/tags ).

## Issues

Please report all issues and bugs to https://github.com/ghosthack13/loggerize/issues

## Contributing

As of now the best way to contribute is by donating (see below). Donations do 
not need to be financial. It can be donating server space to test different 
operating systems, a subscription to loggly to create new log destinations or 
even a logo design if you are competent in photo editing.

Loggerize will start allowing pull request when the design specification for 
version 1 is finalized, as there are still internal speed optimizations to 
implement and I will not want anyone to take their time only to have their code 
refactored or removed later.

## Authors

Loggerize was created and maintained by [ghosthack13](https://github.com/ghosthack13/).

## Donations

If you belive Loggerize has helped you as a developer and/or your organization 
and would like to see continued upgrades and more features added, please consider 
making a kind donation via our [Patreon]().

## Licence

This project is dual licensed under the GNU [AGPLv3](LICENCE.md) and the Loggerize 
[EULA](EULA.md).




