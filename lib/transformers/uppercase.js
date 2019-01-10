/**
*
* @filename uppercase.js
*
*
*
*
**************************************************/

module.exports.uppercase = function (input){
	if (typeof(input) != "string"){
		let err = TypeError("Transformer expected type 'string'. Received type '" + typeof(input) + "'");
		throw err;
	}
	return input.toUpperCase();
}