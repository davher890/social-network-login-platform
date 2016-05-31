var express = require('express');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var request = require('request');
var myAccessToken, myRefreshToken;
var Facebook = require('facebook-node-sdk')

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new FacebookStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/login/facebook/return'
    },
    function(accessToken, refreshToken, profile, cb) {
        // In this example, the user's Facebook profile is supplied as the user
        // record.  In a production-quality application, the Facebook profile should
        // be associated with a user record in the application's database, which
        // allows for account linking and authentication with other identity
        // providers.
        myAccessToken = accessToken;
        myRefreshToken = refreshToken;
        // console.log('pppp', myAccessToken);
        // console.log('mmmm', myRefreshToken);
        return cb(null, profile);
    }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({
    extended: true
}));
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
    function(req, res) {
        res.render('home', {
            user: req.user
        });
    });

app.get('/login',
    function(req, res) {
        res.render('login');
    }
);

app.get('/login/facebook',
    passport.authenticate('facebook'));

app.get('/login/facebook/return',
    passport.authenticate('facebook', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        res.redirect('/');
    }
);

app.get('/profile',
    //require('connect-ensure-login').ensureLoggedIn(),
    function(req, res) {
        // res.render('profile', {
        //     user: req.user
        // });
        var token = 'EAACEdEose0cBAPTZCzvB3pdHnxFFTiDigyD3ZBUfoQmFKK9GkvGUhq4NjZC6Kz0IWZBw6a71qBePz0FC3piHqRLZC9JZB2AHXdtoEy3C2oCDxhlDB7UBZBjgtVvR9nnZBCfUofnYe7Ipe9XiZA2aJpDnmMKZCDcXK93txH8pz3wRfQMgZDZD';
        request({
            method: 'GET',
            url: 'https://graph.facebook.com/v2.6/me/feed?access_token=' + myAccessToken,
        }, function(error, response, body) {
            if (error) {
                console.log('Error', error);
            } else {
                console.log('Body', body);
            }
        });
        // var facebook = new Facebook({
        //     appID: process.env.CLIENT_ID,
        //     secret: process.env.CLIENT_SECRET
        // }).setAccessToken(myAccessToken);
        //
        // facebook.api('/me/feed', function(err, data) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log(data);
        //     }
        // });
        res.render('profile', {
            user: req.user
        });
    }
);


app.listen(3000);
