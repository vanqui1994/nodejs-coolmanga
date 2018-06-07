var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var configAuth = require('./auth');

var userModel = require('../apps/models/user');



module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (id, done) {
        userModel.getList({user_id: id}, function (err, user) {
            done(err, user[0]);
        });
    });

    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ['id', 'displayName', 'email']
    },
            function (token, refreshToken, profile, done) {
                process.nextTick(async function () {
                    var result = await userModel.getList({email: profile.emails[0].value}).then(function (data) {
                        return (data.length !== 0) ? data[0] : '';
                    });
                    if (result) {
                        return done(null, result);
                    } else {
                        var timestamp = new Date / 1E3 | 0;
                        userData = {
                            email: profile.emails[0].value,
                            fullname: profile.displayName,
                            is_deleted: 0,
                            created_date: timestamp
                        };
                        var result = userModel.addUser(userData);
                        result.then(function (data) {
                            return done(null, userData);
                        });
                    }

                });
            }
    ));


    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL
    },
            function (accessToken, refreshToken, profile, done) {
                userModel.getList({email: profile.emails[0].value}).then(function (data) {
                    if (data.length !== 0) {
                        return done(null, data[0]);
                    } else {
                        var timestamp = new Date / 1E3 | 0;
                        userData = {
                            email: profile.emails[0].value,
                            fullname: profile.displayName,
                            is_deleted: 0,
                            created_date: timestamp
                        };
                        var result = userModel.addUser(userData);
                        result.then(function (data) {
                            return done(null, userData);
                        });
                    }
                });

            }
    ));
};
