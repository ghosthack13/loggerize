# Loggerize

*ONE LOGGER TO RULE THEM ALL ...*

## Motivation

The aim of Loggerize was to create a universal JavaScript Logging Library simple 
enough for users who only began programming yesterday, yet comprehensive enough 
to satisfy even the most demanding and experienced coders.

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

## Documentation

Full tutorials can be found on the 
[Loggerize WIKI](https://github.com/ghosthack13/loggerize/wiki) coupled with 
comprehensive documentation in the repository's 
[docs](https://github.com/ghosthack13/loggerize/tree/master/docs) directory.

## Installation

`npm i loggerize`

## Quick Start

For those not interesting in reading the documentation/tutorials, see below for 
the simplest way to immediately get up and running.

```javascript
var Loggerize = require("../../lib/index.js");

//Create Logger
let logger = Loggerize.createLogger("myLogger");

// Outputs => debug Successfully Logged
logger.debug("Successfully Logged");
```

Likewise, see below for how to quickly start logging 
[Connect](https://www.npmjs.com/package/connect)/[Express](https://www.npmjs.com/package/express) 
Middleware.

```javascript
var app = require('express')();
var loggerize = require("../../lib/index.js");

//Create HTTP Logger
var httpLogger = loggerize.createHTTPLogger("myHTTPLogger");

// Extract get middleware to use in express
app.use(httpLogger.getMiddleware());

app.get('/', (req, res) => res.send('Hello World!'))

//Start listening on port 3000
app.listen(3000, () => console.log("App listening on port 3000!"))
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




