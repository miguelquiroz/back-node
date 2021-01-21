var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var argv = require('minimist')(process.argv.slice(2));
var swagger = require("swagger-node-express");
var bodyParser = require( 'body-parser' );
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var securityRouter = require("./routes/api/security");
var userConfigurationRouter = require("./routes/api/userconfiguration");
var businessConfigurationRouter = require('./routes/api/businessconfiguration');
var app = express();

//Swagger
var subpath = express();
app.use(bodyParser());
app.use("/v1", subpath);
swagger.setAppHandler(subpath);
swagger.setApiInfo({
  title: "Reservium API",
  description: "API to manage reservium",
  termsOfServiceUrl: "",
  contact: "reservium@gmail.com",
  license: "",
  licenseUrl: ""
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('dist'));
subpath.get('/', function (req, res) {
  res.sendfile(__dirname + '/dist/index.html');
});

swagger.configureSwaggerPaths('', 'api-docs', '');
var domain = 'localhost';
if(argv.domain !== undefined)
    domain = argv.domain;
else
    console.log('No --domain=xxx specified, taking default hostname "localhost".');

// var applicationUrl = 'http://' + domain + ':' + app.get('port');
var applicationUrl = 'http://' + domain;
swagger.configure(applicationUrl, '1.0.0');


//API
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api',apiRouter);
app.use("/api/security",securityRouter);
app.use("/api/userconfiguration",userConfigurationRouter);
app.use("/api/businessconfiguration",businessConfigurationRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
