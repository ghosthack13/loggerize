var path = require('path');
var fs = require('fs');

function getCallerInfo(stackDepth, includeStackInfo){
	
	//The caller is 2 stack frames downward or get a user specified stack frame
	stackDepth = stackDepth || 2;
	includeStackInfo = includeStackInfo || true;
	
	//Get line with called information
	let stackLevels = new Error().stack.split("\n");
	let caller = stackLevels[stackDepth + 1]; //Add 1 to skip line with Error Name
	
	//Split string into array of path, line, offset info
	let pathStart =  caller.indexOf("(");
	let pathLineOffset = caller.substring(pathStart + 1, caller.length - 1).split(":");
	let pathSep = (pathLineOffset[0].lastIndexOf("/") == -1) ? "\\" : "/";
	let lastPathSeparator = pathLineOffset[0].lastIndexOf(pathSep);
	
	//Create Caller object
	let callerInfo = {
		"directory": pathLineOffset[0].substring(0, lastPathSeparator) + pathSep,
		"file": pathLineOffset[0].substring(lastPathSeparator + 1),
		"path": pathLineOffset[0],
		"line": pathLineOffset[1],
		"lineOffset": pathLineOffset[2],
		"function": caller.substring(caller.indexOf("at ") + 3, pathStart - 1)
	};
	
	//Only include stack info if necessary
	if (includeStackInfo){
		callerInfo["stack"] = stackLevels.slice(stackDepth + 1).map(function(line){ return line.trim(); })//.join("\n")
	}
	
	return callerInfo;
}

function getStackInfo(){
	
	//The caller is 2 stack frames downward or get a user specified stack frame
	// stackDepth = stackDepth || 2;
	
	let stackInfo = [];
	let stackLevels = new Error().stack.split("\n");
	
	for (let i = 1; i < stackLevels.length; ++i){
		
		//Get stack frame
		let stackFrame = stackLevels[i];
		
		//Split string into array of path, line, offset info
		let pathStart =  stackFrame.indexOf("(");
		let pathLineOffset = stackFrame.substring(pathStart + 1, stackFrame.length - 1).split(":");
		let pathSep = (pathLineOffset[0].lastIndexOf("/") == -1) ? "\\" : "/";
		let lastPathSeparator = pathLineOffset[0].lastIndexOf(pathSep);
		
		//Create stackFrame object
		stackInfo.push({
			"directory": pathLineOffset[0].substring(0, lastPathSeparator) + pathSep,
			"file": pathLineOffset[0].substring(lastPathSeparator + 1),
			"path": pathLineOffset[0],
			"line": pathLineOffset[1],
			"lineOffset": pathLineOffset[2],
			"function": stackFrame.substring(stackFrame.indexOf("at ") + 3, pathStart - 1)
		});
	}
	
	return stackInfo;
}

function mkDirByPathSync(targetPath){
	
	//Handle Relative Paths
	if (targetPath.charAt(0) != path.sep){
		targetPath = process.cwd() + path.sep + targetPath;
	}
	
	//Always normalize paths for cross platform compatability
	targetPath = path.normalize(targetPath);
	
	let start = 0;
	let end = targetPath.indexOf(path.sep, start + 1);
	let deepest = targetPath.lastIndexOf(path.sep);
	while(start < deepest){
		
		let ancestorPath = targetPath.substr(0, end + 1);
		start = end + 1;
		end = targetPath.indexOf(path.sep, start);
		
		try{
			stats = fs.statSync(ancestorPath);
			// console.log("Valid Dir: " + ancestorPath);
		}
		catch(err){
			console.log("Creating Directory: " + ancestorPath);
			fs.mkdirSync(ancestorPath);
		}
	}
	
	return targetPath;
}

function removeSync(targetPath, recursive){
	
	recursive = recursive || false;
	targetPath = path.normalize(targetPath);
	
	let stats = fs.statSync(targetPath);
	if (stats.isDirectory()){
		let files = fs.readdirSync(targetPath);
		for (let i = 0; i < files.length; ++i){
			let fullFilePath = path.join(targetPath, files[i]);
			// console.log("Removing File: " + fullFilePath);
			fs.unlinkSync(fullFilePath);
		}
		// console.log("Removing Directory: " + targetPath);
		fs.rmdirSync(targetPath);
	}
}

// let targetPath = "/home/daniel/playground/javascript/logger/scrap";
// targetPath = "/home/daniel/playground/javascript/logger/scrap/dsfs/asda/gr";
// targetPath = "/home/daniel/playground/javascript/logger/scrap/dsfs/asda/gr/";
// targetPath = "../logs/";
// targetPath = "./logs";
// targetPath = "./logs/";
// targetPath = "/logs/";
// targetPath = "/logs";
// targetPath = "./logs/sdsd/asdas";
// console.log("Creating From Path: " + targetPath + "\n");
// mkDirByPathSync(targetPath);

// let stackInfo = getStackInfo();
// let internalCallers = ["getStackInfo"];
// for(let i = 0; i < stackInfo.length; ++i){
	// if (internalCallers.indexOf(stackInfo[i]["function"]) == -1){
		// let file = stackInfo[i]["file"].split(".")[0];
		// console.log(file);
		// break;
	// }
// }

module.exports = {
	"removeSync": removeSync,
	"getStackInfo": getStackInfo,
	"getCallerInfo": getCallerInfo,
	"mkDirByPathSync": mkDirByPathSync,
}




