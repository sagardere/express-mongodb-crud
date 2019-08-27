var mongoose = require('mongoose');


var user = new mongoose.Schema({
	email:String,
	password: String

},{strict:false});


module.exports = user;