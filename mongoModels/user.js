var mongoose = require('mongoose');


var user = new mongoose.Schema({
	name:String,
	email:String,
	address:String,
	city:String,
	country:String,
	zip_code:Number,
	phone:Number,
	password: String,
	token:String

},{strict:false});


module.exports = user;