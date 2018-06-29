var express = require("express");
var config = require("config");
var bodyParser = require("body-parser");
var session = require("express-session");
var socketio = require('socket.io');
var redis = require('redis');
var configModels = require("./apps/models/config");
var client = redis.createClient();
var passport = require('passport');

client.on('connect', function () {});

var app = express();
var controllers = require(__dirname + "/apps/controllers");
//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

//cau hinh session
app.set('trust proxy', 1); // trust first proxy
app.use(session({
    secret: config.get("secretKey"),
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

//login Facebook
app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

app.get('/auth/facebook/callback', passport.authenticate('facebook'), function (req, res) {
    if (req.query.code && req.session.passport) {
        req.session.user = req.session.passport.user;
        res.redirect("/dashboard");
    } else {
        res.redirect("/");
    }
});

//login Google
app.get('/auth/google',passport.authenticate('google', {scope: ['profile', 'email']}));

app.get('/auth/google/callback', passport.authenticate('google'), function (req, res) {
    if (req.query.code && req.session.passport) {
        req.session.user = req.session.passport.user;
        res.redirect("/dashboard");
    } else {
        res.redirect("/");
    }
});


app.use(async function (req, res, next) {
    var result = await configModels.getList({}).then(function (data) {
        return data[0];
    });

    var logo = JSON.parse(result.config_logo);

    res.locals.user = (req.session.user) ? req.session.user : '';
    res.locals.info = {
        bareUrl: 'http://dev.nodejs.com',
        title: result.config_title,
        logo: logo[0].image,
        email: result.config_email,
        footer: result.config_footer,
        fanpage: result.config_fanpage,
        summary: result.config_summary
    };

    res.locals.stuff = {
        query: req.query,
        url: req.originalUrl
    };

    next();
});

//cau hinh views
app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");

//cau hinh static folder
app.use("/static", express.static(__dirname + "/public"));
app.use("/upload", express.static(__dirname + "/upload"));
app.use(controllers);



var host = config.get("server.host");
var port = config.get("server.port");

var server = app.listen(port, host);

var io = socketio(server);

var socketcontrol = require(__dirname + '/apps/common/socketcontrol')(io);

app.use(function (req, res) {
    res.render('404');
});