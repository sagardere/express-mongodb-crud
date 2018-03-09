var mongoose = require('mongoose');


var token = new mongoose.Schema({
	token:String,
	userId:String,

},{strict:false});


module.exports = token;