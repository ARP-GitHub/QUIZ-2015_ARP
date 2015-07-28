var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// El módulo express-partials importa una factoría que debe invocarse con () para generar el MW a instalar
app.use(partials());
// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
// eliminamos parámetro configuración incluido por defecto con express.generator
// Así el MW bodyparser.unlencoded() analiza correctamente los nombres de los parámetros del formulario (_form.ejs) del objeto quiz y genera el objeto req.body.quiz
app.use(bodyParser.urlencoded()); 
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error',
		   {
            	     message: err.message,
            	     error: err,
	    	     errors: []
        	   }
	);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', 
	       {
        	 message: err.message,
       		 error: {},
		 errors: []
    	       }
    );
});


module.exports = app;
