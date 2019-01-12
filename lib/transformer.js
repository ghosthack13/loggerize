var fs = require('fs');
var path = require('path');

//! Predefined Filters
var predefinedTransformers = [
	"uppercase", "lowercase"
];

//! Load/Run Transformers
function loadTransformers(transformersDir){
	
	let self = this;
	
	transformersDir = transformersDir || __dirname + path.sep + "transformers";
	transformersDir = path.normalize(transformersDir);
	
	let files = fs.readdirSync(transformersDir);
	
	for (let i = 0; i < files.length; ++i){
		let transformerPath = path.normalize(transformersDir + path.sep + files[i]);
		let transformerObj = require(transformerPath);
		if (typeof(transformerObj) == "undefined"){
			continue;
		}
		Object.keys(transformerObj).forEach(function(transformerName){
			if (typeof(transformerObj[transformerName]) != "function"){
				throw Error("Transformer must be of type 'function'");
			}
			self.transformers[transformerName] = transformerObj[transformerName];
		});
	}
	// console.log(self.transformers);
	// console.log("Transformers Loaded!");
}
function runTransformers(logRecord, transformers){
	
	if (typeof(transformers) == "undefined"){
		return false;
	}
	
	if (typeof(transformers) == "function"){
		logRecord["output"] = transformers(logRecord["output"]);
	}
	
	if (typeof(transformers) == "string"){
		transformers = [transformers];
	}
	else if (!Array.isArray(transformers)){
		let err = new Error("transformer must be a function or an array of names of predefined transformers");
		throw err;
	}
	
	for (let i = 0; i < transformers.length; ++i){
		let transformer = transformers[i];
		if (typeof(transformer) == "string"){
			logRecord["output"] = this.transformers[transformer](logRecord["output"]);
		}
		else if (typeof(transformer) == "function"){
			logRecord["output"] = transformer(logRecord["output"]);
		}
	}
	return true;
}

//! Manage Transformers
function addTransformer(name, func){
	
	//Track names of added transformers
	let addedTransformers = [];
	
	//Validate
	if ((typeof(name) != "string" && typeof(name) != "object") 
	|| (typeof(name) == "string" && typeof(func) != "function")
	|| (typeof(name) != "string" && typeof(func) == "function")){
		let err = new Error("Parameters must be of type 'string' and type 'function' or of type 'object'");
		throw err;
	}
	
	//Add one transformer
	if (typeof(name) == "string" && typeof(func) == "function"){
		if (predefinedTransformers.indexOf(name) != -1){
			let err = new Error("'" + name + "' is a predefined transformer and cannot be altered");
			throw err;
		}
		this.transformers[name] = func;
		addedTransformers.push(name);
		return;
	}
	
	//Add one or more transformers
	if (typeof(name) == "object"){
		
		let transformerObj = name;
		
		if (typeof(transformerObj["name"]) != "string"){
			let err = new Error("Transformer object must have name property of type 'string'");
			throw err;
		}
		if (typeof(transformerObj["transformer"]) != "function"){
			let err = new Error("Transformer must be of type 'function'. Received type: '" + typeof(transformerObj["transformer"]) + "'");
			throw err;
		}
		
		//Validate that transformer is not program defined
		if (predefinedTransformers.indexOf(name) != -1){
			let err = new Error("'" + name + "' is a predefined transformer and cannot be altered");
			throw err;
		}
		
		this.transformers[transformerObj["name"]] = transformerObj["transformer"];
		addedTransformers.push(name);
	}
	
	return addedTransformers;
}
function removeTransformer(transformerName){
	
	if(typeof(transformerName) == "string"){
		transformerName = [transformerName];
	}
	
	if(!Array.isArray(transformerName)){
		let error = new TypeError("Invalid transformer name. Expected name to be of type string or array of strings");
		throw error;
	}
	
	for (let i = 0; i < transformerName.length; ++i){
		
		if(typeof(transformerName[i]) != "string"){
			let error = new TypeError("transformer name must be of type 'string'");
			throw error;
		}
		
		//Validate that transformer is not program defined
		if (predefinedTransformers.indexOf(transformerName[i]) != -1){
			let err = new Error("'" + transformerName[i] + "' is a predefined transformer and cannot be altered");
			throw err;
		}
		
		delete this.transformers[transformerName[i]];
	}
	
}


module.exports = {
	"loadTransformers":	loadTransformers,
	"runTransformers":	runTransformers,
	"addTransformer":	addTransformer,
	"removeTransformer": removeTransformer,
};

