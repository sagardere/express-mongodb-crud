//Require all modules
var mongoose = require('mongoose'),
  _ = require('lodash'),
  user = require('./user');

var connections = {};

module.exports = () => {

  var mongoModels = {};

  mongoModels.user = () => {
    return mongoose.model('user', user);
  };

  return mongoModels;
};