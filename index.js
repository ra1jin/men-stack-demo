var appRoot = require('app-root-path');
var dotenv = require('dotenv').config();
var mongoose = require('mongoose');
var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var config = require(appRoot + '/config');
var routes = require(appRoot + '/routes');

const MongoStore = require('connect-mongo')(session);

// -----------------------------------------------------------------------------------------------------
function init() {
  var db = mongooseSetup();
  var app = expressSetup();

  app.use(routes);

  if (config.get('https')) {
    const key = fs.readFileSync(appRoot + '/authority/privkey.pem', 'utf8');
    const cert = fs.readFileSync(appRoot + '/authority/cert.pem', 'utf8');
    const ca = fs.readFileSync(appRoot + '/authority/chain.pem', 'utf8');
    const httpsServer = https.createServer({ key: key, cert: cert, ca: ca }, app);
    httpsServer.listen(443, () => console.log('HTTPS Server running on port 443'));
  }

  const httpServer = http.createServer(app);
  httpServer.listen(80, () => console.log('HTTP Server running on port 80'));
}

function mongooseSetup() {
  var mongoUri = 'mongodb://' + config.get('db').host + '/' + config.get('db').name;
  mongoose.set('debug', config.get('db').debug);
  mongoose.set('useCreateIndex', true);
  mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database: ${mongoUri}`);
  });

  return mongoose.connect(mongoUri, { useUnifiedTopology: true, useNewUrlParser: true });
}

function expressSetup() {
  var app = express();
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'vash');

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public'), { dotfiles: 'allow' }));
  app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false
    },
    store: new MongoStore({
      url: 'mongodb://' + config.get('db').host + '/' + config.get('db').name,
      ttl: 14 * 24 * 60 * 60 // = 14 days. Default
    })
  }));

  return app;
}

init();
