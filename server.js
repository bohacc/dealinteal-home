/*global require, module,  __dirname */
/*jslint es5: true, indent: 2, node:true, nomen: true, maxlen: 80, vars: true*/
'use strict';

// Module dependencies.
var express = require('express'),
  fs = require('fs'),
  path = require('path'),
  http = require('http'),
  https = require('https'),
  url = require("url"),
  pem = require('pem'),
  expressValidator = require('express-validator'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  cookieParser = require('cookie-parser'),
//cookieSession = require('cookie-session'),
  session = require('express-session'),
  logger = require('morgan'),
  errorHandler = require('errorhandler'),
  csrf = require('csurf'),
  favicon = require('serve-favicon'),
  serveStatic = require('serve-static'),
// Notia
  socketIO = require('./lib/controllers/socketio'),
  tools = require('./lib/controllers/tools'),
  constants = require('./lib/controllers/constants'),
  conn = require('./lib/controllers/connections'),
  taskRunner = require('./lib/controllers/task_runner'),
  app,
  appSSL,
  server,
  serverSSL,
  io;

app = express();
appSSL = express();

// Express Configuration

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false, uploadDir: './upload'}));
// parse application/json
app.use(bodyParser.json());
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      message: {
        type: constants.MESSAGE_ERROR_MODAL,
        param: formParam,
        msg: msg,
        value: value
      }
    };
  },
  customValidators: {
    isArray: function(value) {
      return Array.isArray(value);
    },
    gte: function(param, num) {
      return param >= num;
    },
    throw: function () {
      return false;
    }
  }
}));
app.use(methodOverride());
app.use(cookieParser(constants.SECRET));
/*app.use(cookieSession({
 keys: ['HashNotia1', 'HashNotia2'],
 secureProxy: true // if you do SSL outside of node
 }));*/
app.use(session({secret: constants.SECRET, key: 'express.sid', saveUninitialized: true, resave: true}));
app.use(function (req, res, next) {
  tools.useXSRF(req, res, next, csrf({cookie: true}));
  //tools.useXSRF(req, res, next, csrf({value: tools.xsrfValue(req)}));
});
app.use(function (req, res, next) {
  tools.useXSRF(req, res, next, function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken()); //, {secure: true}
    next();
  });
});

// error handler
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }
  // handle CSRF token errors here
  res.status(403);
  res.send({message: {type: constants.MESSAGE_ERROR_MODAL, msg: 'Invalid connection token'}});
});

// Authentication
app.use(tools.authRequest);

// Authentication Export / Import
app.use(tools.authExportImport);

// prepare body parameters
app.use(function (req, res, next) {
  tools.setNullForEmpty(req.body);
  next();
});

var env = process.env.NODE_ENV;
app.use(function (req, res, next) {
  conn.setEnv(env);
  next();
});

if ('development' == env) {
  app.use(logger('dev'));
  app.use(serveStatic(path.join(__dirname, '.tmp')));
  app.use(serveStatic(path.join(__dirname, 'app')));
  app.use(errorHandler());
  tools.isDevelopment = true;
} else {
  app.use(favicon(path.join(__dirname, 'dist/favicon.ico')));
  app.use(serveStatic(path.join(__dirname, 'dist')));
}

// Route
require('./lib/routes')(app);

// monitor DB
taskRunner.init();

// Start server
var develop_port = 9000;
var production_port_ssl = 3443;
var release_port_ssl = 3444;
if ('development' == env) {
  server = http.Server(app);
  // Socket.io communication
  io = require('socket.io')(server);
  socketIO.init(io);
  // HTTP
  server.listen(develop_port);
} else if ('release' == env) {
  pem.createCertificate({days: 1, selfSigned: true}, function (err, keys) {
    serverSSL = https.createServer({key: keys.serviceKey, cert: keys.certificate}, app).listen(release_port_ssl);
    // Socket.io communication
    io = require('socket.io')(serverSSL);
    socketIO.init(io);
  });
} else {
  /*var options = {
   key: fs.readFileSync('./ssl/privatekey.pem'),
   cert: fs.readFileSync('./ssl/certificate.pem')
   };*/
  // HTTPS
  pem.createCertificate({days: 1, selfSigned: true}, function (err, keys) {
    serverSSL = https.createServer({key: keys.serviceKey, cert: keys.certificate}, app).listen(production_port_ssl);
    // Socket.io communication
    io = require('socket.io')(serverSSL);
    socketIO.init(io);
  });
  /*server = http.Server(app);
   // Socket.io communication
   io = require('socket.io')(server);
   socketIO.init(io);
   // HTTP
   server.listen(port_ssl);*/
}


