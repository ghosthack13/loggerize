var mysql      = require('mysql');
var Loggerize = require("../../lib/index.js");

//Create custom target
var myTarget = function(logRecord, handleOpts){
	
	//Make timestamp's ISO Date MySQL compatible by removing the trailing 'Z'
	logRecord["timestamp"] = logRecord["DateObj"].toISOString().replace("Z", "");
	
	//Remove fields from logRecord that do not correspond to a table header
	delete logRecord["DateObj"];
	delete logRecord["output"];
	
	//Create connection object
	var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'nodeuser',
		password : '',
		database : 'test',
	});

	//Initiate connection
	connection.connect();
	
	//Create Query with placeholder
	var sql = "INSERT INTO `test`.`logs` SET ?";
	
	//Execute Query
	connection.query(sql, logRecord, function(err, result){
		
		//Add result to 'result' field of logRecord to be emitted
		logRecord["result"] = result;
		
		if (err){
			throw err;
			handleOpts["_emitter"].emit("error", err, logRecord);
		}else{
			handleOpts["_emitter"].emit("logged", logRecord);
		}
	});
	
	//Close Connection
	connection.end();
};


let logger = Loggerize.createLogger({
	name: "myLogger",
	emitEvents: true,
	handle: {
		"name": "myHandle",
		"target": myTarget,
		"emitEvents": true
	}
});

logger.on("logged", function(logRecord){
	console.log("logRecord", logRecord);
});

logger.on("error", function(err, logRecord){
	console.log("Error: ", err.message);
});

logger.info("Log Message Test!");

