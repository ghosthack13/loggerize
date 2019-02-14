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

var fs = require('fs');
var path = require('path');


//Load Targets
function loadTargets(targetsDir){
	
	let self = this;
	
	targetsDir = targetsDir || __dirname + path.sep + "targets";
	targetsDir = path.normalize(targetsDir);
	
	let files = fs.readdirSync(targetsDir);
	for (let i = 0; i < files.length; ++i){
		let targetPath = path.normalize(targetsDir + path.sep + files[i]);
		let targetObj = require(targetPath);
		if (typeof(targetObj) == "undefined"){
			continue;
		}
		Object.keys(targetObj).forEach(function(targetName){
			if (typeof(targetObj[targetName]) != "function"){
				throw Error("Target must be of type 'function'");
			}
			self.targets[targetName] = targetObj[targetName];
		});
	}
	
	this.predefinedTargets = Object.keys(this.targets).sort();
	// console.log(self.targets);
	// console.log("Targets Loaded!");
}

//Manage Targets
function getTarget(handleName){
	
	//Check if designated handle is valid
	if (typeof(handleName) == "undefined"){
		if (Object.keys(this.handles).length == 1){
			return this.handles["default"].target;
		}
		else if(this.handles.hasOwnProperty("_anonymous") && this.handles["_anonymous"].active){
			return this.handles["_anonymous"].target;
		}
	}
	
	//Validate handler was defined
	if (typeof(handleName) != "string" || !this.handles.hasOwnProperty(handleName)){
		throw new Error("Invalid Handle");
	}
	
	return this.handles[handleName].target;
}
function setTarget(target, handleName){
	this.setHandleOpts({"target": target}, handleName);
}

function addTarget(name, func){
	
	//Track names of added targets
	let addedTargets = [];
	
	//Validate
	if ((typeof(name) != "string" && typeof(name) != "object") 
	|| (typeof(name) == "string" && typeof(func) != "function")
	|| (typeof(name) != "string" && typeof(func) == "function")){
		let err = new TypeError("Parameters must be of type 'string' and type 'function' or of type 'object'");
		throw err;
	}
	
	//Add one target
	if (typeof(name) == "string" && typeof(func) == "function"){
		if (this.predefinedTargets.indexOf(name) != -1){
			let err = new Error("'" + name + "' is a predefined target and cannot be altered");
			throw err;
		}
		this.targets[name] = func;
		addedTargets.push(name);
		return;
	}
	
	//Add one or more targets
	if (typeof(name) == "object"){
		
		let targetObj = name;
		
		if (typeof(targetObj["name"]) != "string"){
			let err = new TypeError("Target object must have name property of type 'string'");
			throw err;
		}
		if (typeof(targetObj["target"]) != "function"){
			let err = new TypeError("Target must be of type 'function'. Received type: '" + typeof(targetObj["target"]) + "'");
			throw err;
		}
		
		//Validate that target is not program defined
		if (this.predefinedTargets.indexOf(name) != -1){
			let err = new Error("'" + name + "' is a predefined target and cannot be altered");
			throw err;
		}
		
		this.targets[targetObj["name"]] = targetObj["target"];
		addedTargets.push(name);
	}
	
	return addedTargets;
}
function removeTarget(targetName){
	
	if(typeof(targetName) == "string"){
		targetName = [targetName];
	}
	
	if(!Array.isArray(targetName)){
		let error = new TypeError("Invalid target name. Expected name to be of type string or array of strings");
		throw error;
	}
	
	for (let i = 0; i < targetName.length; ++i){
		
		if(typeof(targetName[i]) != "string"){
			let error = new TypeError("target name must be of type 'string'");
			throw error;
		}
		
		//Validate that target is not program defined
		if (this.predefinedTargets.indexOf(targetName[i]) != -1){
			let err = new Error("'" + targetName[i] + "' is a predefined target and cannot be altered");
			throw err;
		}
		
		delete this.targets[targetName[i]];
	}
	
}


module.exports = {
	"loadTargets": 	loadTargets,
	"getTarget": 	getTarget,
	"setTarget": 	setTarget,
	"addTarget": 	addTarget,
	"removeTarget": removeTarget,
};