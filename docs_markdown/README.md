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

`npm -i loggerize`

## Testing

`npm test`

/path/to/bin/mocha

## Table of Contents
- [Loggers](#)
	- [Creating Loggers](#)
	- [Application Logging](#)
	- [HTTP/Middleware Logging](#)
		- [Split Request/Response Logging](#)
	- [String Interpolation](#)
- [Levels](#)
	- [Level Mappers](#)
	- [Using Logging Levels](#)
	- [User-Defined Logging Levels (Advance)](#)
- [Handles](#)
	- [Creating Handles](#)
	- [Deleting Handles](#)
	- [Activation/Deactivation](#)
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
- [Transformers](#)
	- [Predefined Transformers](#)
	- [User-Defined Transformers](#)
- [Formatters](#)
	 [Creating/Deleting Formatters](#)
	- [Predefined Formatters](#)
	- [Tokens](#)
		- [Token List](#)
		- [User-Defined Tokens](#)
		- [Token Modifiers](#)
	- [Date/Time Directives](#)
	- [Color Specifications](#)
	- [Setting Level Colors](#)
	- [Styling Output](#)

## Versioning

Loggerize uses SemVer for versioning.

## Licence

Loggerize is dual licensed using GPL for 




