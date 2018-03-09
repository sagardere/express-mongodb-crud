var mongoose = require('mongoose'),
    _ = require('lodash'),
    user = require('./user'),
    token = require('./token');



var connections = {};

module.exports =  () => {

    var mongoModels = {};

    mongoModels.user =  () => {
        return mongoose.model('user', user);
    };

    mongoModels.token =  () => {
        return mongoose.model('token', token);
    };

  return mongoModels;
};