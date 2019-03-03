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

var EventEmitter = require('events').EventEmitter;

function loadHandles(){
	
	//Set Handles
	this.handles = Object.create(Object.prototype, {
		"default": 		{ value: {}, writable: false, enumerable: true, configurable: false },
		"defaultHTTP": 	{ value: {}, writable: false, enumerable: true, configurable: false },
		"_anonymous": 	{ value: {}, writable: true, enumerable: true, configurable: false },
	});
	
	Object.defineProperties(this.handles["default"], {
		'active': 	{enumerable: true, writable: true, configurable: false, value: true},
		'levelMapper': {enumerable: true, writable: false, configurable: false, value: "npm"},
		'level': 	{enumerable: true, writable: false, configurable: false, value: "debug"},
		'target': 	{enumerable: true, writable: false, configurable: false, value: "console"},
		'formatter': {enumerable: true, writable: false, configurable: false, value: "default"},
		'emitEvents': {enumerable: true, writable: true, configurable: false, value: true},
		'_emitter': {enumerable: true, writable: false, configurable: false, value: new EventEmitter()}
	});
	Object.defineProperties(this.handles["defaultHTTP"], {
		'active': 	{enumerable: true, writable: true, configurable: false, value: true},
		'levelMapper': {enumerable: true, writable: false, configurable: false, value: "http"},
		'level': 	{enumerable: true, writable: false, configurable: false, value: "information"},
		'target': 	{enumerable: true, writable: false, configurable: false, value: "console"},
		'formatter': {enumerable: true, writable: false, configurable: false, value: "common"},
		'emitEvents': {enumerable: true, writable: true, configurable: false, value: true},
		'_emitter': {enumerable: true, writable: false, configurable: false, value: new EventEmitter()}
	});
	Object.defineProperties(this.handles["_anonymous"], {
		'active': 	{enumerable: true, writable: true, configurable: false, value: true},
		'levelMapper': {enumerable: true, writable: false, configurable: false, value: "npm"},
		'level': 	{enumerable: true, writable: false, configurable: false, value: "debug"},
		'target': 	{enumerable: true, writable: false, configurable: false, value: "console"},
		'formatter': {enumerable: true, writable: false, configurable: false, value: "default"},
		'emitEvents': {enumerable: true, writable: true, configurable: false, value: true},
		'_emitter': {enumerable: true, writable: false, configurable: false, value: new EventEmitter()}
	});
	
	
	//Bubble events up to central control
	let self = this;
	for (let handleName in this.handles){
		
		this.handles[handleName]["_emitter"].on("logged", function(logRecord){
			self.emit("logged", logRecord);
		});
		
		this.handles[handleName]["_emitter"].on('error', function(err, logRecord){
			self.emit("error", err, logRecord);
		});
		
		if (this.handles[handleName]["target"] == "file" || this.handles[handleName]["target"] == "rotatingFile"){
			this.handles[handleName]["_emitter"].on('drain', function(err, logRecord){
				self.emit("drain", logRecord);
			});
			this.handles[handleName]["_emitter"].on('finish', function(err, logRecord){
				self.emit("finish", logRecord);
			});
			this.handles[handleName]["_emitter"].on('close', function(err, logRecord){
				self.emit("close", logRecord);
			});
		}
		
	}
	
	this.predefinedHandles = Object.keys(this.handles).sort();
}


function addExceptionHandle(handle, parentName){
	
	if (typeof(handle) == "undefined"){
		handle = {};
	}
	else if (typeof(handle) != "object" || Array.isArray(handle)){
		let err = TypeError("exception handle must be a non-array of type 'object'");
		throw err;
	}
	
	handle["name"] = "_exception";
	handle["emitEvents"] = true;
	if (!handle.hasOwnProperty("formatter")){
		handle["formatter"] = "exceptFmt";
	}
	
	Object.defineProperty(handle, "_emitter", {
		value: new EventEmitter(),	
		writable: true, 
		enumerable: false, 
		configurable: false
	});
	
	this.addHandle(handle, parentName);
	this.handleUncaughtExceptions = true;
	
	let self = this;
	process.on('uncaughtException', function(err){
		if (self.handleUncaughtExceptions){
			let logRecord = self.makeRecord(["_exception"], self.handles["_exception"]["levelMapper"], err);
			self.render(logRecord, self.handles["_exception"]);
			self.handles["_exception"]["_emitter"].on("logged", function(logRecord){ //eslint-disable-line no-unused-vars
				process.exit(1);
			});
		}
		else{
			throw err;
		}
	});
}

function removeExceptionHandle(){
	this.removeHandle("_exception");
	this.handleUncaughtExceptions = false;
}


function addHandle(handle, parentName){
	
	if (!Array.isArray(handle)){
		handle = [handle];
	}
	
	let addedHandles = [];
	for (let i = 0; i < handle.length; ++i){
		
		//Anonymous handle can only be added by the program
		if (handle[i]["name"] == "_anonymous"){
			let error = new Error("The handle named '_anonymous' is reserved for undefined handles");
			throw error;
		}
		
		//Inherit properties from another handle
		if (typeof(parentName) != "undefined"){
			
			if (typeof(parentName) != "string"){
				let error = new TypeError("Parent Handle must be of type 'string'");
				throw error;
			}
			
			if (this.handles.hasOwnProperty(parentName)){
				for (var handleProperty in this.handles[parentName]){
					if (handle[i].hasOwnProperty(handleProperty)){
						continue; //Skip values where child handle is more recent
					}
					handle[i][handleProperty] = this.handles[parentName][handleProperty];
				}
			}
			else{
				let error = new Error("'" + parentName + "' is not a valid handle");
				throw error;
			}
		}
		
		//Validate options and set defaults
		if(this.validateHandleOpts(handle[i])){
			
			//Add filters
			if (handle[i].hasOwnProperty("filter")){
				this.affixFilters(handle[i]);
			}
			
			//Add Emitter
			if (handle[i]["emitEvents"] == true){
				
				Object.defineProperty(handle[i], "_emitter", {
					value: new EventEmitter(),	
					writable: true, 
					enumerable: false, 
					configurable: false
				});
				
				//Bubble events up to central control
				let self = this;
				handle[i]["_emitter"].on("logged", function(logRecord){
					self.emit("logged", logRecord);
				});
				handle[i]["_emitter"].on('error', function(err, logRecord){
					self.emit("error", err, logRecord);
				});
				
				//Bubble file handle events
				if (handle[i]["target"] == "file" || handle[i]["target"] == "rotatingFile"){
					handle[i]["_emitter"].on('drain', function(err, logRecord){
						self.emit("drain", logRecord);
					});
					handle[i]["_emitter"].on('close', function(){
						self.emit("close");
					});
					handle[i]["_emitter"].on('finish', function(){
						self.emit("finish");
					});
				}
			}
			
			//Set defaults on new handle
			this.setHandleDefaults(handle[i]);
			
			//Save handle to handles list
			this.handles[handle[i]["name"]] = handle[i];
			addedHandles.push(handle[i]["name"]);
			
			//Cleanup
			delete handle[i]["name"];			
			// this.handles["default"].active = false;
		}
	}
	
	return addedHandles;
}

function removeHandle(handleNames){
	
	if (typeof(handleNames) == "undefined"){
		return true;
	}
	
	if (typeof(handleNames) == "string"){
		handleNames = [handleNames];
	}
	
	if (!Array.isArray(handleNames)){
		let err = new TypeError("handles to remove must be of type string or array of strings");
		throw err;
	}
	
	for(let i = 0; i < handleNames.length; ++i){
		if (this.handles.hasOwnProperty(handleNames[i])){
			//Remove from handles store
			delete this.handles[handleNames[i]];
			
			//Detach from each logger
			for (let loggerName in this.loggers){
				if (this.loggers[loggerName].handles.indexOf(handleNames[i]) != -1){
					this.loggers[loggerName].detachHandles(handleNames[i]);
					if (this.loggers[loggerName].handles.length == 0){
						this.loggers[loggerName].hasHandles = false;
					}
				}
			}
		}
	}
}

function renameHandle(oldName, newName){
	
	if(typeof(oldName) != "string" || typeof(newName) != "string"){
		let error = new Error("Both names must be of type 'string'");
		throw error;
	}
	
	if (!this.handles.hasOwnProperty(oldName)){
		let error = new Error("'" + oldName + " does not match any existing handles");
		throw error;
	}
	
	if (oldName == "default"){
		let error = new Error("Cannot rename the 'default' handle");
		throw error;
	}
	
	if (oldName !== newName){
		Object.defineProperty(this.handles, newName, Object.getOwnPropertyDescriptor(this.handles, oldName));
		delete this.handles[oldName];
	}
	
	//Rename handle in each logger
	for (let i = 0; i < this.loggers.length; ++i){
		if (this.loggers[i].handles.indexOf(oldName) != -1){
			this.loggers[i].detachHandles(oldName);
			this.loggers[i].attachHandles(newName);
		}
	}
	
}


function activate(handleNames){
	
	if (typeof(handleNames) == "undefined"){
		for (let handleName in this.handles){
			this.handles[handleName].active = true;
		}
	}
	else if (Array.isArray(handleNames)){
		for(let i = 0; i < handleNames.length; ++i){
			if (this.handles.hasOwnProperty(handleNames[i])){
				this.handles[handleNames[i]].active = true;
			}
		}
	}
	else if (typeof(handleNames) == "string" && this.handles.hasOwnProperty(handleNames)){
		this.handles[handleNames].active = true;
	}
}

function deactivate(handleNames){
	
	if (typeof(handleNames) == "undefined"){
		for (let handleName in this.handles){
			this.handles[handleName].active = false;
		}
	}
	else if (Array.isArray(handleNames)){
		for(let i = 0; i < handleNames.length; ++i){
			if (this.handles.hasOwnProperty(handleNames[i])){
				this.handles[handleNames[i]].active = false;
			}
		}
	}
	else if (typeof(handleNames) == "string" && this.handles.hasOwnProperty(handleNames)){
		this.handles[handleNames].active = false;
	}
}

function clearHandles(){
	
	//Remove each handle from master logger
	for (let key in this.handles){
		if (this.handles.hasOwnProperty(key) && this.predefinedHandles.indexOf(key) == -1){
			delete this.handles[key];
		}
	}
	
	//Detach from each logger
	for (let loggerName in this.loggers){
		let logger = this.loggers[loggerName];
		for (let j = 0; j < logger.handles.length; ++j){
			if (this.predefinedHandles.indexOf(logger.handles[j]) == -1){
				logger.detachHandles(logger.handles[j]);
				// console.log("Detaching", logger.handles[j]);
			}
		}
	}
}

function shutdown(){
	
	let self = this;
	let openedStreams = 0; //track number of streams found to need closing
	
	let handlesNames = Object.keys(this.handles);
	for (let i = 0; i < handlesNames.length; ++i){
		let handleName = handlesNames[i];
		
		//! Files will have a stream that need closing
		if (this.handles[handleName].hasOwnProperty("stream")){
			++openedStreams; //increment opened streams as we find more
			this.handles[handleName]["stream"].on("finish", function(){
				--openedStreams; //decrement opened streams as they are closed
				if (i == handlesNames.length - 1 && openedStreams == 0){
					self.emit("finish");
					return;
				}
			});
			this.handles[handleName]["stream"].end();
		}
	}
	
	//Emit finish event even if no streams were closed
	if (openedStreams == 0){
		self.emit("finish");
	}
}


module.exports = {
	
	"loadHandles": loadHandles,
	
	"addExceptionHandle": addExceptionHandle,
	"removeExceptionHandle": removeExceptionHandle,
	
	"addHandle": 	addHandle,
	"removeHandle": removeHandle,
	"renameHandle": renameHandle,
	"activate":		activate,
	"deactivate":	deactivate,
	"clearHandles":	clearHandles,
	"shutdown":		shutdown,
};