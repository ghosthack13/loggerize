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

function render(logRecord, handle){
	
	//Only run active handles
	if (!handle.active){
		return;
	}
	
	//Run Level and user attached filters
	if (!this.runFilters(logRecord, handle)){
		//Emit filtered event if logger allows it
		if (handle.emitEvents === true){
			this.emit("filtered", logRecord);
		}
		return;
	}
	
	
	//Format Log Record
	let formatterName = handle["formatter"];
	logRecord = this.format(logRecord, formatterName, handle["levelMapper"]);
	
	if(typeof(handle["target"]) === "function"){
		//Create a deep copy of logRecord or it may be overritten by another logger 
		//before it is written to a target
		handle["target"].call(this, this.cloneRecord(logRecord), handle);
		return;
	}
	
	//Send Log Record to output target
	let targetName = handle["target"];
	if (handle["rotationType"] === "interval"){
		targetName = "rotateFileByInterval";
	}
	else if (handle["rotationType"] === "size"){
		targetName = "rotateFileBySize";
	}
	
	//Create a deep copy of logRecord or it may be overritten by another logger 
	//before it is written to a target
	this.targets[targetName].call(this, this.cloneRecord(logRecord), handle);
}


module.exports = {
	"render": render
};