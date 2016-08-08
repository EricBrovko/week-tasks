//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var express = require('express');
var passport = require("passport"); 
var connectEnsureLogin = require('connect-ensure-login');

require('./lib/auth.js');
var processCode = require("./lib/processCode");
var getResults = require("./lib/getResults");

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(user, cb) {
    cb(null, user);
});

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();
var server = http.createServer(app);

app.locals.moment = require('moment');

app.use(require('cookie-parser')()); //middlware
app.use(require('body-parser').urlencoded({ extended: true }));

app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.set('view engine', 'jade');
app.set('views', path.resolve(__dirname, '../client/views'));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(path.resolve(__dirname, '../client')));

app.get('/', connectEnsureLogin.ensureLoggedIn(), function(req,res) {
  res.render('index');
});

app.post('/', connectEnsureLogin.ensureLoggedIn(), processCode);

app.get('/login', function(req,res) {
  if (req.user) {
    res.redirect('/');
  }
  else {
    res.render('login');
  }
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.get('/results', connectEnsureLogin.ensureLoggedIn(), getResults);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

