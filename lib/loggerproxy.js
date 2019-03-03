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

var subject = require('./logger.js'); //Singleton Logger Instance

//Proxy Logger Class
function LoggerProxy(name){
	
	this.name = name;
	
	this.propogate = true;
	this.isMuted = false;
	
	this.handles = [];
	this.hasHandles = false;
	
	this.filters = [];
	Object.defineProperty(this, "_filters", {
		value: [],
		writable: true, 
		enumerable: false, 
		configurable: false, 
	});
}


/**
*	Set the level mapper of the logger
*	@param {string} levelMapper - name of the level mapper you wish to set
*	@throws {Error} - levelMapper must be a predefined or user-defined
*/
LoggerProxy.prototype.setLevelMapper = function(levelMapper){
	
	if (typeof(levelMapper) != "string"){
		let err = new TypeError("The 1st paramater (the mapper) must be of type string'");
		throw err;
	}
	
	if (!subject.levelMappings.hasOwnProperty(levelMapper)){
		let err = new Error("'" + levelMapper + "' is not a valid level mapper. Use the `createLevelMap` method to create it.");
		throw err;
	}
	
	if (levelMapper != this.levelMapper){
		this.handles = []; //detach all handles as they will be out of sync with new levelMapper
		delete this.level; //reset level as it will be out of sync with new levelMapper
	}
	
	this.levelMapper = levelMapper;
	
};

/**
*	Set the level of the logger
*	@param {(string|number)} levelName - name or numeric value of the severity level you wish to set
*	@throws {Error} throws if level is not compatible with the logger's levelMapper
*/
LoggerProxy.prototype.setLevel = function(levelName){
	
	//Ensure level is defined
	if (typeof(this.levelMapper) == "undefined"){
		let error = new Error("Logger must set a 'levelMapper' before it can set its own 'level'");
		throw error;
	}
	if (typeof(levelName) == "number"){
		levelName = subject.getLevelName(levelName);
		if (typeof(levelName) == "undefined"){
			let error = new Error("Log Level '" + levelName + "' could not be mapped to any known log level");
			throw error;
		}
	}
	else if (!subject.levelMappings[this.levelMapper].hasOwnProperty(levelName)){
		let error = new Error("'" + levelName + "' is not a valid log level under the '" + this.levelMapper + "' levelMapper");
		throw error;
	}
	
	//Ensure correct level is maintained within filter objects
	if (this.filters.length != 0){
		for (let i = 0; i < this._filters.length; ++i){
			if(this._filters[i].hasOwnProperty("level")){
				this._filters[i].level = levelName;
			}
		}
	}
	
	this.level = levelName;
};

/**
*	Get the name of the current severity level of the logger
*	@returns {string} level
*/
LoggerProxy.prototype.getLevel = function(){
	return this.level;
};

/**
*	Get the name of the severity level of the 1st logger that produces output
*	@returns {string} level
*/
LoggerProxy.prototype.getEffectiveLevel = function(){
	
	let tree = this.name.split(".");
	for (let i = tree.length; i > 0; --i){
		let ancestor = tree.slice(0, i).join(".");
		if(subject.loggers.hasOwnProperty(ancestor) && typeof(subject.loggers[ancestor].level) != "undefined"){
			return subject.loggers[ancestor].level;
		}
	}
	
	//Return root level if all other levels were undefined
	return subject.loggers["root"].level;
};

/**
*	Attach list of handles to logger
*	@param {(string[]|object[])} handleNames - names of already defined handles or the configuration of handles to create and attach on the fly
*/
LoggerProxy.prototype.attachHandles = function(handleNames){
	
	if (Array.isArray(handleNames) && handleNames.length == 0){
		return;
	}
	
	//Create new handle then get the names to attach to current logger
	if (typeof(handleNames) == "object"){
		if (!Array.isArray(handleNames) || (Array.isArray(handleNames) && typeof(handleNames[0]) != "string")){
			handleNames = subject.addHandle.apply(subject, arguments);
		}
	}
	
	if(typeof(handleNames) != "string" && !Array.isArray(handleNames)){
		let error = new Error("The handle named '" + handleNames + "' is not defined");
		throw error;
	}
	
	// Append handle to logger's handle list if passed a string
	if (typeof(handleNames) == "string"){
		handleNames = [handleNames];
	}
	
	//Ensure all handles are defined and level mappers are the same
	handleNames.forEach(function(handleName){
		
		if (!subject.handles.hasOwnProperty(handleName)){
			let error = new Error("The handle named '" + handleName + "' is not defined");
			throw error;
		}
		
		if (subject.handles[handleName]["levelMapper"] != subject.handles[handleNames[0]]["levelMapper"]){
			let error = new Error("All attached handles must have the same levelMapper");
			throw error;
		}
	});
	
	//Let logger adopt the levelMapper of the handle(s) if it does not have one defined
	if (typeof(this.levelMapper) == "undefined"){
		this.levelMapper = subject.handles[handleNames[0]]["levelMapper"];
	}
	
	//Check that this logger's levelMapper matches those in the handles
	if (this.levelMapper != subject.handles[handleNames[0]]["levelMapper"]){
		let err = new Error("handle's levelMapper (" + subject.handles[handleNames[0]]["levelMapper"] + ") must match Logger's levelMapper (" + this.levelMapper + ")");
		throw err;
	}
	
	//Iterate handle names and add them to logger's handles list
	for (let i = 0; i < handleNames.length; ++i){
		
		//Skip handle if already exists
		if (this.handles.indexOf(handleNames[i]) != -1){
			continue;
		}
		this.handles.push(handleNames[i]);
	}
	
	if (this.handles.length != 0){
		this.hasHandles = true;
	}
	
};

/**
*	Detaches list of specified handles
*	@param {string[]} handleNames - names of handles to detach from logger
*	@throws {Error} - throws if handleNames is not a string or array of strings
*/
LoggerProxy.prototype.detachHandles = function(handleNames){
	
	if(typeof(handleNames) != "string" && !Array.isArray(handleNames)){
		let error = new Error("detachHandles expected type 'string' or array of strings");
		throw error;
	}
	
	// Append handle to logger's handle list if passed a string
	if (typeof(handleNames) == "string"){
		handleNames = [handleNames];
	}
	
	for (let i = 0; i < handleNames.length; ++i){
		let removalIndex = this.handles.indexOf(handleNames[i]);
		if (removalIndex != -1){
			this.handles.splice(removalIndex, 1);
		}
	}
	
	if (this.handles.length == 0){
		this.hasHandles = false;
	}
};

/**
*	Attach a defined filter to the logger
*	@param {string} filterName - name of an already defined filter
*	@param {string} [opts] - options to apply onto filter
*/
LoggerProxy.prototype.attachFilter = function(filterName, opts){
	
	if (typeof(filterName) != "string"){
		let error = new Error("FilterName must be of type 'string'");
		throw error;
	}
	if (!subject.filters.hasOwnProperty(filterName)){
		let error = new Error(filterName + " is not defined");
		throw error;
	}
	
	if (typeof(opts) == "undefined"){
		opts = {};
	}
	opts["filterName"] = filterName;
	
	this.filters.push(filterName);
	this._filters.push(subject.LogFilterFactory(subject.filters[filterName], opts, this));
};

/**
*	Attach a defined filter to the logger
*	@param {string[]} filterNames - names of filters to detach from logger
*	@throws {Error} - throws if filterNames is not a string or array of strings
*/
LoggerProxy.prototype.detachFilter = function(filterNames){
	
	if (typeof(filterNames) == "string"){
		filterNames = [filterNames];
	}
	else if (!Array.isArray(filterNames)){
		let error = new Error("detachFilter expected type 'string' or array of strings");
		throw error;
	}
	
	for(let i = 0; i < filterNames.length; ++i){
		
		let removalIndex = this.filters.indexOf(filterNames[i]);
		if (removalIndex != -1){
			this.filters.splice(removalIndex, 1);
		}
		
		//Remove from both visibile and hidden filter fields
		removalIndex = this._filters.indexOf(filterNames[i]);
		if (removalIndex != -1){
			this._filters.splice(removalIndex, 1);
		}
	}
	
};

/**
*	Prohibit current logger from producing output
*/
LoggerProxy.prototype.mute = function(){
	this.isMuted = true;
};

/**
*	Allow current logger to producing output
*/
LoggerProxy.prototype.unmute = function(){
	this.isMuted = false;
};

/**
*	Returns a middleware function from an HTTP Logger
*	@throws {Error} - logger must be an HTTP logger to use this method
*/
LoggerProxy.prototype.getMiddleware = function(){
	if (typeof(this.httpListener) != "function"){
		let err = new Error("Logger is not an HTTP logger, use `createHTTPLogger()` to create one");
		throw err;
	}
	return this.httpListener;
};

/**
*	Listen to events affecting this logger
*	@param {string} eventName - the name of the event that is being listened
*	@param {logEventCallback} callback - the name of the event that is being listened
*/
LoggerProxy.prototype.on = function(eventName, listener){
	let self = this;
	subject.on(eventName, function(logRecord){
		if (self.emitEvents === true){
			if (logRecord instanceof Error){
				let err = arguments[0];
				logRecord = arguments[1];
				if (self.name == logRecord["loggerName"]){
					listener(err, logRecord);
				}
				return;
			}
			listener(logRecord);
		}
	});
};
/**
*	@callback logEventCallback
*	@param {...object} logRecord - the logRecord or an error and logRecord
*/

/**
*	Send log output to targets of attached handles
*	@param {(string|number)} level - name or numeric value of the severity level you wish to set
*	@param {string} message - message describing event that necessitated log entry
*/
LoggerProxy.prototype.log = function(){
	
	//Check if resources are available
	if(subject.isFinished == true){
		let err = new Error(
			"The 'close()' method was called and all resources were "
			+ "deallocated. Therefore, NO more logs can be written!"
		);
		throw err;
	}
	
	//If silent don't bother going through logging chain
	if(this.isMuted){
		return;
	}
	
	var logRecord;
	if (typeof(arguments[0]) == "object" && !Array.isArray(arguments[0]) && arguments[0]["_isHTTPRecord"]){
		logRecord = arguments[0];
	}
	else{
		let args = [this.handles, this.levelMapper].concat(Array.prototype.slice.call(arguments));
		logRecord = subject.makeRecord.apply(subject, args);
	}
	
	//Create ancestor tree and Iterate up the log ancestors
	let tree = this.name.split(".");
	for (let i = tree.length; i >= 0; --i){
		
		//The ancestor is the logger at the current hierarchy level
		let ancestorName = (i == 0) ? "root" : tree.slice(0, i).join(".");
		let ancestor = subject.loggers[ancestorName];
		if (typeof(ancestor) == "undefined"){
			continue;
		}
		
		//Set name of the current logger that is rendering the record
		logRecord["loggerName"] = ancestorName;
		
		//Run Level and user attached filters
		if (!subject.runFilters(logRecord, subject.loggers[ancestorName])){
			//Emit filtered event if logger allows it
			if (this.emitEvents === true){
				subject.emit("filtered", logRecord);
			}
			
			//End logging if logger does not propogate to continue to next ancestor otherwise
			if(!subject.loggers[ancestorName].propogate){
				break;
			}
			continue;
		}
		
		//Log for each handle in logger at current hierarchial level
		subject.loggers[ancestorName].handles.forEach(function(handleName){
			subject.render(logRecord, subject.handles[handleName]);
		});
		
		//Halt logging at current hierarchial level if logger does not propogate 
		if(!subject.loggers[ancestorName].propogate){
			break;
		}
		
	}
	
};

//Create convenience methods from level mappings
for (let levelMapper in subject.levelMappings){
	let levelMap = subject.levelMappings[levelMapper];
	for (let level in levelMap){
		/*eslint-disable-next-line no-unused-vars */
		LoggerProxy.prototype[level] = function(message){
			this.log.apply(this, [level].concat(Array.prototype.slice.call(arguments)));
		};
	}
}


//Export Module
module.exports = LoggerProxy;

