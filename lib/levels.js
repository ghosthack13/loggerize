"use strict";

var styler = require('./styler.js');

var DEFAULT_LEVEL_COLORS = {
	"npm": {
		"error": 	{"font": {"color": "red", 	 "modifiers": ["bold"]}},
		"warn": 	{"font": {"color": "yellow", "modifiers": ["bold"]}},
		"info": 	{"font": {"color": "purple", "modifiers": ["bold"]}},
		"verbose": 	{"font": {"color": "blue", 	 "modifiers": ["bold"]}},
		"debug": 	{"font": {"color": "green",  "modifiers": ["bold"]}},
		"silly": 	{"font": {"color": "green",  "modifiers": ["bold"]}},
	},
	"http": {
		"information": 	{"font": {"color": "green",  "modifiers": ["bold"]}},
		"success": 		{"font": {"color": "blue", 	 "modifiers": ["bold"]}},
		"redirection": 	{"font": {"color": "purple", "modifiers": ["bold"]}},
		"clientError": 	{"font": {"color": "yellow", "modifiers": ["bold"]}},
		"serverError": 	{"font": {"color": "red", 	 "modifiers": ["bold"]}},
	},
	"syslog": {
		"emerg": 	{"font": {"color": "red", 	 "modifiers": ["bold"]}},
		"alert": 	{"font": {"color": "yellow", "modifiers": ["bold"]}},
		"crit": 	{"font": {"color": "purple", "modifiers": ["bold"]}},
		"err": 		{"font": {"color": "blue", "modifiers": ["bold"]}},
		"warning": 	{"font": {"color": "green", 	 "modifiers": ["bold"]}},
		"notice": 	{"font": {"color": "cyan",  "modifiers": ["bold"]}},
		"info": 	{"font": {"color": "white",  "modifiers": ["bold"]}},
		"debug": 	{"font": {"color": "black",  "modifiers": ["bold"]}},
	},
	"python": {
		"critical": {"font": {"color": "red", 	 "modifiers": ["bold"]}},
		"error": 	{"font": {"color": "yellow", "modifiers": ["bold"]}},
		"warning": 	{"font": {"color": "purple", "modifiers": ["bold"]}},
		"info": 	{"font": {"color": "blue", 	 "modifiers": ["bold"]}},
		"debug": 	{"font": {"color": "green",  "modifiers": ["bold"]}},
	},
	"defcon": {
		"defcon1": 	{"font": {"color": "red", 	 "modifiers": ["bold"]}},
		"defcon2": 	{"font": {"color": "yellow", "modifiers": ["bold"]}},
		"defcon3": 	{"font": {"color": "purple", "modifiers": ["bold"]}},
		"defcon4": 	{"font": {"color": "blue", 	 "modifiers": ["bold"]}},
		"defcon5": 	{"font": {"color": "green",  "modifiers": ["bold"]}},
	},
};

function loadLevels(){
	
	this.levelMappings = {
		"npm": {
			"error": 	0,
			"warn": 	1,
			"info": 	2,
			"verbose":	3,
			"debug": 	4,
			"silly": 	5
		},
		"http": {
			"information": 100,
			"success": 200,
			"redirection": 300,
			"clientError": 400,
			"serverError": 500
		},
		"syslog": {
			"emerg":	0,
			"alert":	1,
			"crit": 	2,
			"err":		3,
			"warning":	4,
			"notice":	5,
			"info":		6,
			"debug":	7
		},
		"python": {
			"critical":	50,
			"error": 	40,
			"warning":	30,
			"info":		20,
			"debug":	10,
			// "notset":	0
		},
		"defcon": {
			"defcon1":	1,
			"defcon2": 	2,
			"defcon3":	3,
			"defcon4":	4,
			"defcon5":	5,
		},
		"apocalypse": {
			"MadMax": 0,	// Max Max world comes true
			"zombie": 1,	// Zombie Apocalypse
			"robot": 2,		// Robot Apocalypse
			"alien": 3,		// Alien Apocalypse
			"goblin": 4,	// Goblin Apocalypse
		},
	};
	
	this.reverseMappings = {
		"npm": {
			0: "error",
			1: "warn",
			2: "info",
			3: "verbose",
			4: "debug",
			5: "silly"
		},
		"http": {
			100: "information",
			200: "success",
			300: "redirection",
			400: "clientError",
			500: "serverError"
		},
		"syslog": {
			0: "emerg",
			1: "alert",
			2: "crit",
			3: "err",
			4: "warning",
			5: "notice",
			6: "info",
			7: "debug"
		},
		"python": {
			50: "critical",
			40: "error",
			30: "warning",
			20: "info",
			10: "debug",
			// 0: "notset"
		},
		"defcon": {
			1: "defcon1",
			2: "defcon2",
			3: "defcon3",
			4: "defcon4",
			5: "defcon5",
		},
		"apocalypse": {
			0: "MadMax",
			1: "zombie",
			2: "robot",
			3: "alien",
			4: "goblin",
		},
	};
	
	Object.defineProperty(this.levelMappings["npm"], "_orderOfSeverity", {
		value: -1, 
		writable: false,
		enumerable: false, 
		configurable:false
	});
	Object.defineProperty(this.levelMappings["http"], "_orderOfSeverity", {
		value: 1, 
		writable: false,
		enumerable: false, 
		configurable:false
	});
	Object.defineProperty(this.levelMappings["syslog"], "_orderOfSeverity", {
		value: -1, 
		writable: false,
		enumerable: false, 
		configurable:false
	});
	Object.defineProperty(this.levelMappings["python"], "_orderOfSeverity", {
		value: 1, 
		writable: false,
		enumerable: false, 
		configurable:false
	});
	Object.defineProperty(this.levelMappings["defcon"], "_orderOfSeverity", {
		value: -1, 
		writable: false,
		enumerable: false, 
		configurable:false
	});
	Object.defineProperty(this.levelMappings["apocalypse"], "_orderOfSeverity", {
		value: -1, 
		writable: false,
		enumerable: false, 
		configurable:false
	});
	
}
function createLevelMap(mapper, levelsObj, orderOfSeverity){
	
	//Validate level name
	if (typeof(mapper) != "string"){
		let err = new TypeError("The 1st paramater, mapper, must be of type string'");
		throw err;
	}
	
	if (this.levelMappings.hasOwnProperty(mapper)){
		let err = new Error("A levelMapper called '" + mapper + "' already exists. Select another name.");
		throw err;
	}
	
	//Validate levels object
	if (typeof(levelsObj) != "object" || Array.isArray(levelsObj)){
		throw new TypeError("Expected 2nd parameter to be of 'object' type in form: '{ <mapper> : <levelNumber> }'");
	}
	
	if (Object.keys(levelsObj).length == 0){
		let err = new Error("At least one log/severity level must be defined");
		throw err;
	}
	
	//Validate each level
	this.reverseMappings[mapper] = {};
	for (let level in levelsObj){
		if (isNaN(parseFloat(levelsObj[level]))){
			throw new Error("Level value must be of type number");
		}
		this.reverseMappings[mapper][levelsObj[level]] = level; 
	}
	
	//Set Severity
	let order = -1;
	if (orderOfSeverity == "asc" || orderOfSeverity == "ascending"){
		order = 1;
	}
	else if (orderOfSeverity == "desc" || orderOfSeverity == "descending"){
		order = -1;
	}
	
	Object.defineProperty(levelsObj, "_orderOfSeverity", {
		value: order, 
		writable: false,
		enumerable: false, 
		configurable:false
	});
	
	//Assign levels to global
	this.levelMappings[mapper] = levelsObj;
}

function getLevel(){
	return this.level;
}
function setLevel(level){
	if (typeof(level) == "number"){
		level = this.getLevelName(level);
		if (typeof(level) == "undefined"){
			let error = new Error("Log Level '" + level + "' could not be mapped to any known log level");
			throw error;
		}
	}
	else if (!this.levelMappings[this.levelMapper].hasOwnProperty(level)){
		let err = new Error("'" + level + "' is an invalid level in the '" + this.levelMapper + "' level mapping");
		throw err;
	}
	this.level = level;
}
function setLevelMapper(mapper){
	
	//Validate
	if (typeof(mapper) != "string"){
		let err = new TypeError("The 1st paramater (the mapper) must be of type string'");
		throw err;
	}
	
	if (!this.levelMappings.hasOwnProperty(mapper)){
		let err = new TypeError("'" + mapper + "' is not a valid level mapper. Use the `createLevelMap` method to create it.");
		throw err;
	}
	
	this.levelMapper = mapper;
	
}

function getLevelName(val, mapper){
	
	mapper = mapper || this.levelMapper;
	
	//Validate Mapper
	if (!this.reverseMappings.hasOwnProperty(mapper)){
		let err = new ReferenceError("'" + mapper + "' is not a valid mapper");
		throw err;
	}
	
	if (mapper == "http"){
		val = Math.floor(val / 100) * 100;
	}
	return this.reverseMappings[mapper][val];
}
function getMinMaxSeverity(mapper){
	
	if (!this.levelMappings.hasOwnProperty(mapper)){
		let err = new Error("'" + mapper + "' is not a defined mapping");
		throw err;
	}
	
	mapper = mapper || this.levelMapper;
	let levelMap = this.levelMappings[mapper];
	
	let min, max;
	if (levelMap["_orderOfSeverity"] == -1){
		max = Number.POSITIVE_INFINITY;
		min = Number.NEGATIVE_INFINITY;
		for (let level in levelMap){
			min = (levelMap[level] > min) ? levelMap[level] : min;
			max = (levelMap[level] < max) ? levelMap[level] : max;
		}
	}
	else{
		min = Number.POSITIVE_INFINITY;
		max = Number.NEGATIVE_INFINITY;
		for (let level in levelMap){
			min = (levelMap[level] < min) ? levelMap[level] : min;
			max = (levelMap[level] > max) ? levelMap[level] : max;
		}
	}
	
	return [min, max];
}

function colorizeLevels(colorMap, levelMapper){
	
	this.formatters["_levelStyle"] = {};
	
	if (typeof(colorMap) == "undefined"){
		this.formatters["_levelStyle"] = DEFAULT_LEVEL_COLORS;
		return;
	}
	
	if (typeof(colorMap) != "object" || Array.isArray(colorMap)){
		let error = new TypeError("Expected colorMap of type 'object'");
		throw error;
	}
	
	levelMapper = levelMapper || this.levelMapper;
	if (!this.levelMappings.hasOwnProperty(levelMapper)){
		let error = new ReferenceError("'" + levelMapper + "' is not a valid level mapper");
		throw error;
	}
	
	if (typeof(colorMap) == "object" && !Array.isArray(colorMap)){
		this.formatters["_levelStyle"][levelMapper] = {};
		for (let levelName in colorMap){
			this.formatters["_levelStyle"][levelMapper][levelName] = styler.parseStyle(colorMap[levelName]);
		}
	}
	
}
function decolorizeLevels(levelMapper){
	
	if (typeof(levelMapper) == "undefined"){
		delete this.formatters["_levelStyle"];
		return;
	}
	
	this.formatters["_levelStyle"][levelMapper] = {};
}


module.exports = {
	
	"loadLevels": loadLevels,
	"createLevelMap": createLevelMap,
	"setLevelMapper": setLevelMapper,
	"getMinMaxSeverity": getMinMaxSeverity,
	"getLevelName": 	getLevelName,
	"getLevel":			getLevel,
	"setLevel":			setLevel,
	"colorizeLevels": 	colorizeLevels,
	"decolorizeLevels":	decolorizeLevels
};