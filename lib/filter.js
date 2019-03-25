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

//Predefined Filters
var predefinedFilters = [
	"level", "dynamicLevel", "burst", "regexFilter"
];

//Filter Factory
function LogFilter(opts, context){
	
	//Add opts to 'this' scope
	if (typeof(opts) == "object" && !Array.isArray(opts)){
		for (let key in opts){
			if (opts.hasOwnProperty(key)){
				this[key] = opts[key];
			}
		}
	}
	
	if (typeof(context) == "object"){
		// if (context.hasOwnProperty("name")){
		// this["scopeName"] = context["name"];
		// }
		if (context.hasOwnProperty("level")){
			this.level = context["level"];
		}
		if (context.hasOwnProperty("target")){
			this.target = context["target"];
		}
	}
	
	// console.log(this);
	
}
function LogFilterFactory(func, opts, context){
	
	LogFilter.prototype.filter = func;
	return new LogFilter(opts, context);
}

//Load/Run Filters
function loadFilters(filtersDir){
	
	let self = this;
	
	filtersDir = filtersDir || __dirname + path.sep + "filters";
	filtersDir = path.normalize(filtersDir);
	
	let files = fs.readdirSync(filtersDir);
	
	for (let i = 0; i < files.length; ++i){
		let filterPath = path.normalize(filtersDir + path.sep + files[i]);
		let filterObj = require(filterPath);
		if (typeof(filterObj) == "undefined"){
			continue;
		}
		Object.keys(filterObj).forEach(function(filterName){
			if (typeof(filterObj[filterName]) != "function"){
				throw Error("Filter must be of type 'function'");
			}
			self.filters[filterName] = filterObj[filterName];
		});
	}
	// console.log(self.filters);
	// console.log("Filters Loaded!");
}
function runFilters(logRecord, context){
	
	//Run HTTP Logger Request/Response Filters
	if (logRecord["_isHTTPRecord"]){
		//Do not filter HTTP request since the severity cannot be determined
		if (!logRecord.hasOwnProperty("levelNum") && context.logOnRequest == true){
			return true;
		}
		
		//
		if ((context.logOnResponse == false && typeof(logRecord["statusCode"]) == "number")
		|| (context.logOnRequest == false && typeof(logRecord["statusCode"]) != "number")){
			return false;
		}
	}
	
	//Run Level Filters
	let levelMap = this.levelMappings[context.levelMapper];
	if ((levelMap["_orderOfSeverity"] == -1 && logRecord["levelNum"] > levelMap[context.level])
	||  (levelMap["_orderOfSeverity"] == 1 && logRecord["levelNum"] < levelMap[context.level])){
		return false;
	}
	
	//Run user attached filteres
	if (context.hasOwnProperty("_filters")){
		for (let i = 0; i < context._filters.length; ++i){
			if(!context._filters[i].filter(logRecord)){
				return false;
			}
		}
	}
	
	return true;
}

//Manage Filters
function validateFilter(context){
	
	if (typeof(context["filter"]) == "function"){
		return true;
	}
	else if (typeof(context["filter"]) == "object" && !Array.isArray(context["filter"])){
		let filterNames = Object.keys(context["filter"]);
		for (let i = 0; i < filterNames.length; ++i){
			if (!this.filters.hasOwnProperty(filterNames[i])){
				let err = new Error("Filter '" + filterNames[i] + "' is not defined");
				throw err;
			}
		}
		return true;
	}
	
	//Throw error if all validation checks fail
	let err = new Error("Expected filter of type 'function' or filter options of type 'object'");
	throw err;
}
function affixFilters(context){
	
	if (!context.hasOwnProperty("filter")){
		return;
	}
	
	//Create/Set filter options
	if (typeof(context) == "object" && this.validateFilter(context)){
		
		//Store filter instances in hidden array field
		Object.defineProperty(context, "_filters", {
			writable: true,
			enumerable: false,
			configurable: false,
			value: []
		});
		
		let filterOpts = null;
		if (typeof(context["filter"]) == "function"){
			context["_filters"].push(LogFilterFactory(context["filter"], filterOpts, context));
			return;
		}
		
		if (typeof(context["filter"]) == "object" && !Array.isArray(context["filter"])){
			for (let filterName in context["filter"]){
				filterOpts = context["filter"][filterName];
				filterOpts["filterName"] = filterName;
				context["_filters"].push(LogFilterFactory(this.filters[filterName], filterOpts, context));
			}
		}
	}
}

function addFilter(name, func){
	
	//Track names of added filters
	let addedFilters = [];
	
	//Validate
	if ((typeof(name) != "string" && typeof(name) != "object") 
	|| (typeof(name) == "string" && typeof(func) != "function")
	|| (typeof(name) != "string" && typeof(func) == "function")){
		let err = new Error("Parameters must be of type 'string' and type 'function' or of type 'object'");
		throw err;
	}
	
	//Add one filter
	if (typeof(name) == "string" && typeof(func) == "function"){
		if (predefinedFilters.indexOf(name) != -1){
			let err = new Error("'" + name + "' is a predefined filter and cannot be altered");
			throw err;
		}
		this.filters[name] = func;
		addedFilters.push(name);
		return;
	}
	
	//Add one or more filters
	if (typeof(name) == "object"){
		
		let filterObj = name;
		
		if (typeof(filterObj["name"]) != "string"){
			let err = new Error("Filter object must have name property of type 'string'");
			throw err;
		}
		if (typeof(filterObj["filter"]) != "function"){
			let err = new Error("Filter must be of type 'function'. Received type: '" + typeof(filterObj["filter"]) + "'");
			throw err;
		}
		
		//Validate that filter is not program defined
		if (predefinedFilters.indexOf(name) != -1){
			let err = new Error("'" + name + "' is a predefined filter and cannot be altered");
			throw err;
		}
		this.filters[filterObj["name"]] = filterObj["filter"];
		addedFilters.push(name);
	}
	
	return addedFilters;
}
function removeFilter(filterName){
	
	if(typeof(filterName) == "string"){
		filterName = [filterName];
	}
	
	if(!Array.isArray(filterName)){
		let error = new TypeError("Invalid filter name. Expected name to be of type string or array of strings");
		throw error;
	}
	
	for (let i = 0; i < filterName.length; ++i){
		
		if(typeof(filterName[i]) != "string"){
			let error = new TypeError("filter name must be of type 'string'");
			throw error;
		}
		
		//Validate that filter is not program defined
		if (predefinedFilters.indexOf(filterName[i]) != -1){
			let err = new Error("'" + filterName[i] + "' is a predefined filter and cannot be altered");
			throw err;
		}
		
		delete this.filters[filterName[i]];
	}
	
}


/*/Deprecated
function depreacted_setFilter(name, opts, context){
	
	if (this.filters.hasOwnProperty(name)){
		
		switch(name){
			"burst": context["_filters"].push(LogFilterFactory(burstFilter, opts, context)); break;
			"regex": context["_filters"].push(LogFilterFactory(regexFilter, opts, context)); break;
			"level": context["_filters"].push(LogFilterFactory(levelFilter, opts, context)); break;
			"dynamicLevel": context["_filters"].push(LogFilterFactory(dynamicLevelFilter, opts, context)); break;
		}
	}
	else{
		let err = new Error("Filter '" + name + "' is not defined");
		throw err;
	}
}
function depreacted_runFilters(logRecord, filterNames){
	
	if (typeof(filterNames) == "undefined"){
		return true;
	}
	
	if (typeof(filterNames) == "function"){
		return filterNames(logRecord);
	}
	
	if (typeof(filterNames) == "string"){
		filterNames = [filterNames];
	}
	
	if (!Array.isArray(filterNames)){
		let error = new TypeError("Invalid filter names. Expected names to be of type string or array of strings or function");
		throw error;
	}
	
	
	//Iterate designated filterNames
	for (let i = 0, passed = true; i < filterNames.length; ++i){
		passed = this.filters[filterNames[i]].filter(logRecord);
		if(!passed){
			return false;
		}
	}
	
	return true;
}
/**/

module.exports = {
	
	"LogFilter": LogFilter,
	"validateFilter": validateFilter,
	
	"LogFilterFactory": LogFilterFactory,
	"addFilter":	addFilter,
	"removeFilter":	removeFilter,
	"runFilters":	runFilters,
	"loadFilters": loadFilters,
	"affixFilters" : affixFilters,
};






