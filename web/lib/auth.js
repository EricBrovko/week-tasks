var passport = require("passport"); 
var Strategy = require('passport-local').Strategy;


passport.use(new Strategy(
  function(username, password, done) {
     var login = username == 'admin' && password == 'admin';
     return done(null, login);
  }
));