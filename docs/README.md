# Loggerize

*ONE LOGGER TO RULE THEM ALL ...*

## Motivation

The goal of Loggerize is to create a JavaScript logging system simple enough to be 
understood by a user who only started prorgamming yesterday yet comprehensive 
enough satisfy even the most demanding and experienced coder.

## Features

- Log both Application and HTTP/Express Middleware events in one unified interface 
- No third party dependencies to cause untraceable bugs
- Hundreds of unit/integration test for stability
- Extensive documentation with dozens of bespoke exmples
- Simple to memorize configurations defined as plain text strings instead of complicated 
  multilevel class methods
- Easily extends functionally with nothing more than anonymous functions or JavaScript objects
- Advance state aware filters
- Custom log levels and level colors
- Text string and JSON log output formats
- Heirarchial logger names and ancestor traversal

## Installation

`npm i loggerize`

## Testing & Linting

To run unit test and the linter, navigate to the loggerize sub-directory of the 
node_modules directory (`cd /path/to/node_modules/loggerize`) and run the 
command below:

Testing with [mocha](https://mochajs.org): `npm test`

Linting with [eslint](https://eslint.org): `npm run lint`

## Overview


## Table of Contents
- [Loggers](#)
	- [Creating Loggers](#)
	- [Application Logging](#)
	- [HTTP Logging](#)
		- [Split Request/Response Logging](#)
		- [Vanilla HTTP Logging](#)
		- [Express/Connect Middleware Logging](#)
	- [String Interpolation](#)
- [Levels](#)
	- [Level Mappers](#)
	- [Using Logging Levels](#)
	- [User-Defined Logging Levels (Advance)](#)
- [Handles](#)
	- [Creating Handles](#)
	- [Deleting Handles](#)
	- [The Uncaught Exception Handle](#)
- [Targets](#)
	- [Console Target](#)
	- [File Target](#)
		- [File Config Options](#)
	- [Rotating File Target - Interval](#)
		- [Rotating File (Interval) Config Options](#)
	- [Rotating File Target - Size](#)
		- [Rotating File (Size) Config Options](#)
	- [HTTP Target](#)
		- [HTTP Config Options](#)
- [The LogRecord (Advance)](#)
- [Filters](#)
	- [Logger Attached Filters](#)
	- [Handle Attached Filters](#)
	- [User-Defined Filters (Advance)](#)
		- [Using Custom Filters on Logger](#)
		- [Using Custom Filters on Handle](#)
- [Formatters](#)
	- [Predefined Formatters](#)
	- [Creating Formatters](#)
		- [Creating Formatters On-The-Fly](#)
		- [Creating Formatters on the Module](#)
	- [JSON Serialization](#)
	- [Tokens](#)
		- [Token List](#)
		- [User-Defined Tokens](#)
		- [Token Modifiers](#)
	- [Date/Time Directives](#)
	- [Color Specifications](#)
	- [Setting Level Colors](#)
	- [Styling Output](#)
- [Transformers](#)
	- [Transforming Output](#)
	- [Transforming Tokens](#)
	- [User-Defined Transformers (Advance)](#)
		- [Using Custom Transformers on Output](#)
		- [Using Custom Transformers on Tokens](#)
- [Events](#)
	- [Event Notification - Filtered](#)
	- [Event Notification - Logged](#)
	- [Event Notification - Error](#)
	- [Global Listener](#)	

## Versioning

Loggerize uses [SemVer](http://semver.org/) for versioning. For the versions available, 
see the [tags on this repository](https://github.com/ghosthack13/loggerize/tags).

## Licence

This project is dual licensed under the AGPL Licence and Loggerize's EULA. 
See the LICENCE.txt and EULA.txt for more details.



