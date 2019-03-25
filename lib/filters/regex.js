/**//****************************************************************************
*	
*	@author ghosthack13 <13hackghost@gmail.com>
*	@file regex.js
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

"use strict"

module.exports.regex = function (logRecord){
	// let targetStr = (typeof(logRecord["output"]) == "undefined") ? logRecord["message"] : logRecord["output"];
	let targetStr = logRecord["message"];
	if (this.onMatch == "deny"){
		return !this.pattern.test(targetStr);
	}
	return this.pattern.test(targetStr);
};