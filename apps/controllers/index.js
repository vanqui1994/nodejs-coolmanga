var express = require("express");
var md5 = require("md5");
var redis = require('redis');
var client = redis.createClient();
var config = require("config");

var userModels = require("../models/user");

var helper = require("../helpers/helper");

var router = express.Router();


router.use("/admin", require(__dirname + "/admin"));
router.use("/blog", require(__dirname + "/blog"));



router.get("/", function (req, res) {
    res.render("index");
});


router.get("/trang-ca-nhan.html", function (req, res) {
    if (req.session.user) {
        var dataUser = userModels.getList({user_id: req.session.user.user_id, is_deleted: 0});
        dataUser.then(function (data) {
            if (data.length === 0) {
                req.session.destroy();
                res.redirect("/");
            }
            var userData = data[0];
            res.render("index/user/manager-user", {userData, helper: helper});
        }).catch(function (error) {
            req.session.destroy();
            res.redirect("/");
        });
    } else {
        res.redirect("/");
    }
});

router.get("/doi-mat-khau.html", function (req, res) {
    if (req.session.user) {
        var dataUser = userModels.getList({user_id: req.session.user.user_id, is_deleted: 0});
        dataUser.then(function (data) {
            if (data.length === 0) {
                req.session.destroy();
                res.redirect("/");
            }
            var userData = data[0];
            res.render("index/user/change-password", {userData, helper: helper, data: {}});
        }).catch(function (error) {
            req.session.destroy();
            res.redirect("/");
        });
    } else {
        res.redirect("/");
    }
});

router.post("/doi-mat-khau.html", function (req, res) {
    var params = req.body;

    if (params.password.trim().length == 0) {
        res.render("index/user/change-password", {data: {error: "Vui lòng nhập mật khẩu"}});
        return;
    }

    if (params.newPassword.trim().length === 0) {
        return res.render("index/user/change-password", {data: {error: "Vui lòng nhập mật khẩu mới"}});
    }

    if (params.reNewPassword.trim().length === 0) {
        return res.render("index/user/change-password", {data: {error: "Vui lòng nhập lại mật khẩu mới"}});
    }

    if (params.newPassword.trim() != params.reNewPassword.trim()) {
        return res.render("index/user/change-password", {data: {error: "Hai mật khẩu mới khác nhau. Kiểm tra lại"}});
    }

    if (params.password.trim() == params.newPassword.trim()) {
        return res.render("index/user/change-password", {data: {error: "Mật khẩu mới không được giống mật khẩu cũ"}});
    }

    var password = helper.hashPassword(params.newPassword);

    var strParams = {
        user_id: req.session.user.user_id
    };

    var condition = {
        password: password
    };

    var result = userModels.edit(strParams, condition);
    result.then(function (resultData) {
        req.session.destroy();
        res.render("index/user/change-password", {data: {success: "Thay đổi mật khẩu thành công.Xin vui lòng đăng nhập lại!"}});
    }).catch(function (error) {
        res.render("index/user/change-password", {data: {error: "Lỗi! Không thể thay đổi mật khẩu. Xin thử lại trong giây lát"}});
    });
});


router.get("/quen-mat-khau.html", function (req, res) {
    res.render("lost-password", {data: {error: false}});
});

router.get("/khoi-phuc-mat-khau.html", function (req, res) {
    var key = req.query.key;
    if (key == null) {
        return res.redirect("/");
    }
    client.get(key, function (err, value) {
        if (value == null) {
            res.setHeader("Content-Type", "text/html");
            return res.render("recovery-password", {data: {error: "Liên kết đã hết hạn"}});
        } else {
            return res.render("recovery-password", {data: {value: value, key: key}});
        }
    });
});

router.post("/khoi-phuc-mat-khau.html", function (req, res) {
    var params = req.body;
    var key = req.query.key;
    
    if (params.email) {
        if (params.password.trim().length == 0) {
            res.render("recovery-password", {data: {error: "Vui lòng nhập mật khẩu mới"}});
            return;
        }

        if (params.rePassword.trim().length === 0) {
            return res.render("recovery-password", {data: {error: "Vui lòng nhập lại mật khẩu mới"}});
        }

        if (params.password.trim() != params.rePassword.trim()) {
            return res.render("recovery-password", {data: {error: "Hai mật khẩu không giống nhau"}});
        }

        var password = helper.hashPassword(params.password);

        var strParams = {
            email: params.email
        };

        var condition = {
            password: password
        };

        var result = userModels.edit(strParams, condition);
        result.then(function (resultData) {
            req.session.destroy();
            client.del(key);
        }).catch(function (error) {
            return res.render("recovery-password", {data: {error: "Lỗi! Không thể thay đổi mật khẩu. Xin thử lại trong giây lát"}});
        });
        return res.render("recovery-password", {data: {success: "Bạn đã thay đổi mật khẩu thành công. Xin vui lòng đăng nhập trước khi sử dụng các dịch vụ của chúng tôi."}});
    }
    return res.render("recovery-password", {data: {error: "Liên kết đã hết hạn"}});
});

router.post("/quen-mat-khau.html", function (req, res) {
    var params = req.body;

    if (params.email.trim().length == 0) {
        res.render("lost-password", {data: {error: "Vui lòng nhập email"}});
        return;
    }

    var checkUser = userModels.getList({email: params.email.trim(), is_deleted: 0});
    if (checkUser) {
        checkUser.then(function (data) {
            if (data.length === 0) {
                return res.render("lost-password", {data: {error: "Email không tồn tại trong hệ thống"}});
            }
            var userData = data[0];
            var key = md5(userData.email + config.secretKey);
            client.set(key, userData.email, 'EX', 3600);

            var replacements = {
                fullname: userData.fullname,
                link: config.bareURL + "/khoi-phuc-mat-khau.html?key=" + key
            };
            var pathTemplate = './public/email/lost-password.html';

            helper.sendMail(userData.email, "Yêu cầu khôi phục mật khẩu", replacements, pathTemplate);
            res.render("lost-password", {data: {success: "Yêu cầu khôi phục mật khẩu thành công!"}});
            return;
        }).catch(function (error) {
            return res.render("lost-password", {data: {error: "Lỗi! Không thể khôi phục mật khẩu. Xin thử lại trong giây lát"}});
        });
    }


});


router.get("/login", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("signin", {data: {}});
    }
});

router.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/");
});

router.post("/login", function (req, res) {
    var params = req.body;

    if (params.email.trim().length == 0) {
        res.render("signin", {data: {error: "Vui lòng nhập email"}});
        return;
    }

    if (params.password.trim().length == 0) {
        res.render("signin", {data: {error: "Vui lòng nhập mật khẩu"}});
        return;
    }

    var arrCondition = {
        email: params.email
    };

    var data = userModels.getList(arrCondition);
    if (data) {
        data.then(function (users) {
            if (users.length === 0) {
                res.render("signin", {data: {error: "Email không tồn tại trong hệ thống"}});
                return;
            } else {
                var userData = users[0];

                var checkPass = helper.comparePassword(params.password, userData.password);
                if (checkPass) {
                    req.session.user = userData;
                    res.redirect("/");
                } else {
                    res.render("signin", {data: {error: "Mật khẩu không chính xác"}});
                    return;
                }
            }
        });
    } else {
        res.render("signin", {data: {error: "Lỗi! Không thể login"}});

    }

});

router.get("/register", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("register", {data: {}});
    }
});

router.post("/register", function (req, res) {
    var params = req.body;

    if (params.fullname.trim().length === 0) {
        return res.render("register", {data: {error: "Vui lòng nhập họ tên"}});
    }

    if (params.birthday.trim().length === 0) {
        return res.render("register", {data: {error: "Vui lòng nhập ngày sinh"}});
    }

    if (params.email.trim().length === 0) {
        return res.render("register", {data: {error: "Vui lòng nhập email"}});
    }

    var checkUser = userModels.getList({email: params.email.trim(), is_deleted: 0});
    if (checkUser) {
        checkUser.then(function (data) {
            if (data.length !== 0) {
                return res.render("register", {data: {error: "Email đã tồn tại trong hệ thống"}});
            }
        });
    }


    if (params.password.trim().length === 0) {
        return res.render("register", {data: {error: "Vui lòng nhập mật khẩu"}});
    }

    if (params.rePassword.trim().length === 0) {
        return res.render("register", {data: {error: "Vui lòng nhập mật khẩu lại"}});
    }

    if (params.password.trim() != params.rePassword.trim()) {
        return res.render("register", {data: {error: "Hai mật khẩu khác nhau. Kiểm tra lại"}});
    }

    var password = helper.hashPassword(params.password);
    var timestamp = new Date / 1E3 | 0;
    var birthday = new Date(params.birthday) / 1E3 | 0;


    user = {
        email: params.email,
        password: password,
        fullname: params.fullname,
        gender: params.gender,
        birthday: birthday,
        is_deleted: 0,
        created_date: timestamp
    };

    var result = userModels.addUser(user);
    result.then(function (data) {
        var replacements = {
            fullname: user.fullname,
            email: user.email
        };
        var pathTemplate = './public/email/signup.html';

        helper.sendMail(user.email, "Đăng ký thành viên thành công", replacements, pathTemplate);
        req.session.user = user;
        res.redirect("/");
    }).catch(function (error) {
        return res.render("signup", {data: {error: "Lỗi! Không thể đăng ký thành viên. Xin thử lại trong giây lát"}});
    });

});

router.get("/check-email", function (req, res) {
    var email = req.query.email;

    if (email.trim().length === 0) {
        return res.json({success: false, message: "Email không được rỗng"});
    }

    var dataUser = userModels.getList({email: email, is_deleted: 0});
    dataUser.then(function (data) {
        if (data.length === 0) {
            return res.json({success: true, message: "Bạn có thể sử dụng email này"});
        } else {
            return res.json({success: false, message: "Email đã tồn tại trong hệ thống"});
        }
    }).catch(function (error) {
        return res.json({success: false, message: "Có lỗi xảy ra"});
    });
});


router.get('/check-pass', function (req, res) {
    if (req.session.user) {
        var password = req.query.password;

        var checkPass = helper.comparePassword(password, req.session.user.password);
        if (checkPass) {
            return res.json({success: true, message: "Mật khẩu chính xác"});
        } else {
            return res.json({success: false, message: "Mật khẩu cũ không đúng"});
        }
    } else {
        res.redirect("/");
    }
});

router.get("/chat", function (req, res) {
    res.render("chat");
});

module.exports = router;