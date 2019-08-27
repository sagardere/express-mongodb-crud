var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

//connect to MongoDB
mongoose.connect('mongodb://localhost/CRUD_APP');
var db = mongoose.connection;

//handle mongodb error
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {

  console.log("Connected to DataBase...");
});

//reqire routes folder
var index = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
  name: 'session',
  keys: ['abc', 'xyz']
}))

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

module.exports = app;