var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var db = require('./connection/connect');
var fileupload = require('express-fileupload');
var session = require('express-session')

var UserRouter = require('./routes/user');
var HirerRouter = require('./routes/hiree');
var AdminRouter = require('./routes/admin');
var WorkerRouter = require('./routes/workers');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layouts/',partialsDir:__dirname+'/views/partials/'}))
app.use(session({secret:"key",cookie:{maxAge:60000}}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload())

app.use('/', UserRouter);
app.use('/admin', AdminRouter);

app.use('/Hiree', HirerRouter);
app.use('/worker', WorkerRouter);

db.Database_connection().then((data)=>
{
  console.log(data);
}).catch((err)=>
{
  console.log(err);
})

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
