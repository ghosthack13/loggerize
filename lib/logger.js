/**//****************************************************************************
*	
*	@author ghosthack13 <13hackghost@gmail.com>
*	
*	This file is part of LoggerizeJS (also simply known as Loggerize).
*	
*	Loggerize is free software: you can redistribute it and/or modify
*	it under the terms of the GNU Affero General Public License as published by
*	the Free Software Foundation, either version 3 of the License, or
*	(at your option) any later version.
*	
*	Loggerize is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU Affero General Public License for more details.
*	
*	You should have received a copy of the GNU Affero General Public License
*	along with Loggerize.  If not, see <https://www.gnu.org/licenses/>.
*
********************************************************************************/

"use strict";

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Logger(){
	
	//Level Defaults
	this.levelMapper = "npm";
	this.level = "debug";
	this.loadLevels();
	
	//Load Filters
	this.filters = {};
	this.loadFilters();
	
	//Load Targets
	this.targets = {};
	this.loadTargets();
	
	//Load Transformers
	this.transformers = {};
	this.loadTransformers();
	
	//Store custom tokens
	this.customTokens = {};
	
	//Keep track of loggers
	this.loggers = {};
	
	//Set Formatters
	this.formatters = {};
	this.loadFormatters();
	
	//Set Handles
	this.handles = {};
	this.loadHandles();
	
	//Track if all resources have been deallocated
	this.isFinished = false;
	
	//Handle Uncaught Exceptions
	this.handleUncaughtExceptions = false; //Do not handle uncaught exceptions unless specifically told
	
}

//Import functions and add them to Logger
Object.assign(Logger.prototype, require("./logrecord.js"));
Object.assign(Logger.prototype, require("./render.js"));
Object.assign(Logger.prototype, require("./levels.js"));
Object.assign(Logger.prototype, require("./options.js"));
Object.assign(Logger.prototype, require("./handle.js"));
Object.assign(Logger.prototype, require("./filter.js"));
Object.assign(Logger.prototype, require("./formatter.js"));
Object.assign(Logger.prototype, require("./transformer.js"));
Object.assign(Logger.prototype, require("./targets.js"));

//Extend events into Logger
util.inherits(Logger, EventEmitter);



module.exports = new Logger();