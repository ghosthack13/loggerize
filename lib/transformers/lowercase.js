/**
*
* @filename lowercase.js
*
*
*
*
**************************************************/

module.exports.lowercase = function (input){
	if (typeof(input) != "string"){
		let err = TypeError("Transformer expected type 'string'. Received type '" + typeof(input) + "'");
		throw err;
	}
	return input.toLowerCase();
};