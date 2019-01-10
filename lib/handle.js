//Manage handlers

var EventEmitter = require('events').EventEmitter;

var predefinedLoggers = ["root", "anonymous"];
var predefinedHandles = ["default", "anonymous", "__exception__"];

function addHandle(handle, parentName){
	
	if (!Array.isArray(handle)){
		handle = [handle];
	}
	
	let addedHandles = [];
	for (let i = 0; i < handle.length; ++i){
		
		//Anonymous handle can only be added by the program
		if (handle[i]["name"] == "anonymous"){
			let error = new Error("The handle named 'anonymous' is reserved for undefined handles");
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
			for (loggerName in this.loggers){
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
		for (handleName in this.handles){
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
		for (handleName in this.handles){
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
	
	//Detach from each logger
	for (let i = 0; i < this.loggers.length; ++i){
		let logger = this.loggers[i];
		for (let j = 0; j < logger.handles.length; ++j){
			if (predefinedHandles.indexOf(logger.handles[i]) == -1){
				logger.detachHandles(logger.handles[i]);
				// console.log("Detaching", logger.handles[i]);
			}
		}
	}
	
	//Iterate handles one by one to remove
	this.shutdown(); //cleans up streams
	for (handle in this.handles){
		if (predefinedHandles.indexOf(handle) == -1){
			// console.log("Deleting Handle: ", handle);
			delete this.handles[handle];
		}
	}
	
}

function shutdown(){
	
	for (let i = 0; i < this.handles.length; ++i){
		if (this.handles[i]["target"] == "file" || this.handles[i]["target"] == "rotatingFile"){
			this.handles[i]["stream"].end();
		}
	}
	
}

module.exports = {
	"addHandle": 	addHandle,
	"removeHandle": removeHandle,
	"renameHandle": renameHandle,
	"activate":		activate,
	"deactivate":	deactivate,
	"clearHandles":	clearHandles,
	"shutdown":		shutdown,
};