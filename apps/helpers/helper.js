var bcrypt = require("bcrypt");
var buildUrl = require('build-url');
var config = require("config");
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var handlebars = require('handlebars');
var fs = require('fs');

function hashPassword(password) {
    var saltRounds = config.get("salt");

    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(password, salt);
    return hash;
}


function comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

function getTimeStamp(timeStamp, isTime) {
    var date = new Date(timeStamp * 1000);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    if (isTime) {
        var formattedTime = day + "/" + month + "/" + year + " " + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    } else {
        var formattedTime = day + "/" + month + "/" + year;
    }

    return formattedTime;
}

function getTimeStampFolder(timeStamp) {
    var date = new Date(timeStamp * 1000);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var formattedTime = year + "/" + month + "/" + day;

    return formattedTime;
}

function sendMail(email, title, replacements, pathTemplate) {
    var readHTMLFile = function (path, callback) {
        fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
            if (err) {
                throw err;
                callback(err);
            } else {
                callback(null, html);
            }
        });
    };


    var smtpTransport = nodemailer.createTransport("smtps://" + config.get("mail.email") + ":" + encodeURIComponent(config.get("mail.password")) + "@smtp.gmail.com:465");

    readHTMLFile(pathTemplate, function (err, html) {
        var template = handlebars.compile(html);

        var htmlToSend = template(replacements);
        var mailOptions = {
            from: "CoolManga <" + config.get("mail.email") + ">",
            to: email,
            subject: title,
            html: htmlToSend
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                callback(error);
            }
        });
    });
}

function paging(path, objParams = {}, intTotal = 0, intCurrentPage = 1, intLimit = 30) {
    intTotal > 0 && intLimit > 0 ? intTotalPage = Math.ceil(intTotal / intLimit) : intTotalPage = 0;

    if ((intTotalPage < intCurrentPage || intTotalPage <= 1)) {
        return '';
    }

    var result = '<ul class="pagination">';
    if (intCurrentPage == 1) {
        var intPage = 1;
        var intLimitPage = 10;
    } else {
        var intPage = (intCurrentPage > 5) ? (intCurrentPage == intTotalPage && intTotalPage > 10) ? intCurrentPage - 10 : intCurrentPage - 5 : 1;
        var intLimitPage = (intTotalPage < 11) ? intTotalPage : intCurrentPage + 5;

        var queryParams = Object.assign(objParams, {page: 1});

        var urlBack = buildUrl('', {
            path: path,
            queryParams: queryParams
        });
        result += '<li ><a href="' + urlBack + '"><i class="fa fa-angle-double-left"></i></a></li>';
        var queryParams = Object.assign(objParams, {page: parseInt(intCurrentPage - 1)});
        var urlBackDouble = buildUrl('', {
            path: path,
            queryParams: queryParams
        });
        result += '<li ><a href="' + urlBackDouble + '"><i class="fa fa-angle-double-left"></i><i class="fa fa-angle-double-left"></i></a></li>';
    }
    for (intPage; intPage <= intTotalPage && intPage <= intLimitPage; intPage++) {
        if (intPage == intCurrentPage) {
            result += '<li class="active"><a style="cursor:pointer;">' + intPage + '</a></li>';
        } else {
            var queryParams = Object.assign(objParams, {page: parseInt(intPage)});
            var url = buildUrl('', {
                path: path,
                queryParams: queryParams
            });
            result += '<li><a href="' + url + '">' + intPage + '</a></li>';
        }
    }
    if (intCurrentPage == intTotalPage) {
        result += '';
    } else {
        var queryParams = Object.assign(objParams, {page: parseInt(intCurrentPage + 1)});
        var urlNext = buildUrl('', {
            path: path,
            queryParams: queryParams
        });
        result += '<li><a href="' + urlNext + '"><i class="fa fa-angle-double-right"></i></a></li>';
        var queryParams = Object.assign(objParams, {page: parseInt(intTotalPage)});
        var urlNextDouble = buildUrl('', {
            path: path,
            queryParams: queryParams
        });
        result += '<li><a href="' + urlNextDouble + '"><i class="fa fa-angle-double-right"></i><i class="fa fa-angle-double-right"></i></a></li>';
    }
    result += '</ul>';
    return result;

}



module.exports = {
    hashPassword: hashPassword,
    comparePassword: comparePassword,
    getTimeStamp: getTimeStamp,
    sendMail: sendMail,
    paging: paging,
    getTimeStampFolder:getTimeStampFolder
};