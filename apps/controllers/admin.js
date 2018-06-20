var express = require("express");
var multer = require('multer');
var config = require('config');
const fs = require('fs');
var mkdirp = require('mkdirp');
var unique = require('array-unique');
var slug = require('slug');


var postModels = require("../models/posts");
var configModels = require("../models/config");
var categoryModels = require("../models/category");
var authorModels = require("../models/author");

var helper = require("../helpers/helper");


var router = express.Router();


router.get("/", function (req, res) {
    var auth = isSignIn(req, res);
    if (auth) {
        var intLimit = 5;
        var intPage = (typeof req.query.page !== 'undefined') ? parseInt(req.query.page) : 1;

        postModels.getTotal({}).then(function (posts) {
            var intTotal = posts[0].total;

            var paging = helper.paging("admin", {}, intTotal, intPage, intLimit);
            postModels.getListLimit({}, intPage, intLimit).then(function (posts) {
                var data = {
                    posts: posts,
                    error: false
                };
                res.render("admin/dashboard", {data: data, helper: helper, paging: paging});
            });
        }).catch(function (error) {
            res.render("admin/dashboard", {data: {error: true}});
        });
    }
});

//action config
router.get("/config", async function (req, res) {
    if (isSignIn(req, res)) {
        var result = await configModels.getList({}).then(function (data) {
            return data[0];
        });
        res.render("admin/config/config", {data: result, message: {}});
    }
});

router.post("/config", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.body;

        var result = await configModels.getList({}).then(function (data) {
            return data[0];
        });


        if (params.email.trim().length == 0) {
            res.render("admin/config/config", {data: result, message: {error: "Vui lòng nhập email"}});
            return;
        }

        if (params.configTitle.trim().length == 0) {
            res.render("admin/config/config", {data: result, message: {error: "Vui lòng nhập tên website"}});
            return;
        }

        if (params.configFooter.trim().length == 0) {
            res.render("admin/config/config", {data: result, message: {error: "Vui lòng nhập thông tin footer"}});
            return;
        }

        if (params.configFanPage.trim().length == 0) {
            res.render("admin/config/config", {data: result, message: {error: "Vui lòng nhập link fanpage"}});
            return;
        }

        if (params.configSummary.trim().length == 0) {
            res.render("admin/config/config", {data: result, message: {error: "Vui lòng nhập mô tả website"}});
            return;
        }

        if (params.logoImage.length == 0) {
            res.render("admin/config/config", {data: result, message: {error: "Vui lòng upload logo website"}});
            return;
        }

        var listImage = [];
        unique(params.logoImage).forEach(function (element) {
            if (element != '') {
                listImage.push({image: element});
            }
        });


        var strParams = {
            config_id: result.config_id
        };

        var objCondition = {
            config_email: params.email.trim(),
            config_title: params.configTitle.trim(),
            config_footer: params.configFooter.trim(),
            config_fanpage: params.configFanPage.trim(),
            config_summary: params.configSummary.trim(),
            config_logo: JSON.stringify(listImage)
        };

        configModels.edit(strParams, objCondition).then(function (resultData) {
            res.render("admin/config/config", {data: objCondition, message: {success: "Cập nhật cài đặt thành công"}});
        }).catch(function (error) {
            res.render("admin/config/config", {data: result, message: {error: "Lỗi! Không thể thay cấu hình. Xin thử lại trong giây lát"}});
        });
    }

});
//end action

//action category
router.get("/category", async function (req, res) {
    if (isSignIn(req, res)) {
        var paramsQuery = req.query;

        if (paramsQuery.isFilter) {
            var objCondition = {
                categoryTitle: paramsQuery.title,
                is_deleted: 0
            };
        } else {
            var objCondition = {
                is_deleted: 0
            };
        }

        var intLimit = 15;
        var intPage = (typeof paramsQuery.page !== 'undefined') ? parseInt(paramsQuery.page) : 1;

        var intTotal = await categoryModels.getTotal(objCondition).then(function (data) {
            return (data.length != 0) ? data[0].total : 0;
        });

        var paging = helper.paging("admin/category", paramsQuery, intTotal, intPage, intLimit);

        var objCategoryList = await categoryModels.getListLimit(objCondition, intPage, intLimit).then(function (data) {
            return (data.length != 0) ? data : '';
        });

        res.render("admin/category/index", {data: objCategoryList, paging: paging, params: paramsQuery, message: {}});
    }
});

router.get("/category/add", function (req, res) {
    if (isSignIn(req, res)) {
        res.render("admin/category/add", {data: {}, message: {}});
    }
});

router.post("/category/add", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.body;

        if (params.categoryTitle.trim().length == 0) {
            return res.render("admin/category/add", {data: {}, message: {error: "Vui lòng nhập tên thể loại"}});
        }

        if (params.siteTitle.trim().length == 0) {
            return res.render("admin/category/add", {data: {}, message: {error: "Vui lòng nhập tiêu đề thể loại"}});
        }

        var checkCategory = await categoryModels.getList({category_title: params.categoryTitle.trim()}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });
        if (checkCategory) {
            return res.render("admin/category/add", {data: {}, message: {error: "Thể loại đã tồn tại"}});
        }

        var slugTitle = slug(params.categoryTitle.trim().toLowerCase());

        var data = {
            category_title: params.categoryTitle.trim(),
            category_slug: slugTitle,
            site_title: params.siteTitle.trim(),
            is_deleted: 0
        };

        categoryModels.add(data).then(function (result) {
            if (result) {
                return res.render("admin/category/add", {data: {}, message: {success: "Thêm tiêu đề thành công"}});
            } else {
                return res.render("admin/category/add", {data: {}, message: {error: "Không thể thêm tiêu đề.Xin thử lại trong giây lát"}});
            }
        }).catch(function (err) {
            return res.render("admin/category/add", {data: {}, message: {error: "Không thể thêm tiêu đề.Xin thử lại trong giây lát"}});
        });
    }
});

router.get("/category/edit/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;

        if (params.id.length == 0) {
            return res.render("admin/category/index", {data: {}, message: {error: "ID không được bỏ trống"}});
        }

        var dataCategory = await categoryModels.getList({categoryID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (dataCategory.length == 0) {
            return res.render("admin/category/index", {data: {}, message: {error: "ID không tồn tại"}});
        }

        res.render("admin/category/edit", {data: {dataCategory: dataCategory}, params: params, message: {}});
    }
});

router.post("/category/edit/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;
        var body = req.body;

        if (params.id.length == 0) {
            return res.render("admin/category/index", {data: {}, params: params, message: {error: "ID không được bỏ trống"}});
        }

        var dataCategory = await categoryModels.getList({categoryID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (dataCategory.length == 0) {
            return res.render("admin/category/index", {data: {}, params: params, message: {error: "ID không tồn tại"}});
        }

        if (body.categoryTitle.trim().length == 0) {
            return res.render("admin/category/edit", {data: {dataCategory: dataCategory}, params: params, message: {error: "Vui lòng nhập tên thể loại"}});
        }

        if (body.siteTitle.trim().length == 0) {
            return res.render("admin/category/edit", {data: {dataCategory: dataCategory}, params: params, message: {error: "Vui lòng nhập tiêu đề thể loại"}});
        }

        if (body.categoryTitle != dataCategory.category_title) {
            var checkCategory = await categoryModels.getList({category_title: body.categoryTitle.trim()}).then(function (data) {
                return (data.length != 0) ? data[0] : '';
            });
            if (checkCategory) {
                return res.render("admin/category/edit", {data: {dataCategory: dataCategory}, params: params, message: {error: "Thể loại đã tồn tại"}});
            }
        }

        var slugTitle = slug(body.categoryTitle.trim().toLowerCase());

        var objData = {
            category_title: body.categoryTitle.trim(),
            category_slug: slugTitle,
            site_title: body.siteTitle.trim(),
            is_deleted: 0
        };
        categoryModels.edit({categoryID: params.id}, objData).then(function (data) {
            if (data) {
                return res.render("admin/category/edit", {data: {dataCategory: objData}, params: params, message: {success: "Chỉnh sửa thể loại thành công"}});
            } else {
                return res.render("admin/category/edit", {data: {dataCategory: dataCategory}, params: params, message: {error: "Chỉnh sửa thể loại thất bại"}});
            }
        }).catch(function (err) {
            return res.render("admin/category/edit", {data: {dataCategory: dataCategory}, params: params, message: {error: "Chỉnh sửa thể loại thất bại"}});
        });
    }
});

router.get("/category/remove/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;
        if (params.id.length == 0) {
            return res.json({success: 0, error: 1, message: 'Id không được bỏ trống'});
        }

        var checkID = await categoryModels.getList({categoryID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (checkID.length == 0) {
            return res.json({success: 0, error: 1, message: 'Id không tồn tại'});
        }


        categoryModels.edit({categoryID: params.id}, {is_deleted: 1}).then(function (data) {
            if (data) {
                return res.json({success: 1, error: 0, message: 'Xóa thể loại thành công'});
            } else {
                return res.json({success: 0, error: 1, message: 'Không thể xóa thể loại'});
            }
        }).catch(function (err) {
            return res.json({success: 0, error: 1, message: 'Không thể xóa thể loại'});
        });
    }

});

router.post("/category/remove-all", function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.body;

        var arrID = params.arrId;
        if (arrID.length == 0) {
            return res.json({success: 0, error: 1, message: 'Id không được bỏ trống'});
        }

        categoryModels.editMulti({arrID: arrID}, {is_deleted: 1}, 'category_id').then(function (data) {
            if (data) {
                return res.json({success: 1, error: 0, message: 'Xóa thể loại thành công'});
            } else {
                return res.json({success: 0, error: 1, message: 'Không thể xóa thể loại'});
            }
        }).catch(function (err) {
            return res.json({success: 0, error: 1, message: 'Không thể xóa thể loại'});
        });
    }
});
//////////////////////////////////


//action author
router.get("/author", async function (req, res) {
    if (isSignIn(req, res)) {
        var paramsQuery = req.query;

        var intLimit = 15;
        var intPage = (typeof paramsQuery.page !== 'undefined') ? parseInt(paramsQuery.page) : 1;

        if (paramsQuery.isFilter) {
            var objCondition = {
                authorName: paramsQuery.authorName.trim(),
                is_deleted: 0
            };
        } else {
            var objCondition = {
                is_deleted: 0
            };
        }

        var intTotal = await authorModels.getTotal(objCondition).then(function (data) {
            return (data.length != 0) ? data[0].total : 0;
        });

        var paging = helper.paging("admin/author", paramsQuery, intTotal, intPage, intLimit);

        var objAuthorList = await authorModels.getListLimit(objCondition, intPage, intLimit).then(function (data) {
            return (data.length != 0) ? data : '';
        });

        res.render("admin/author/index", {data: objAuthorList, paging: paging, params: paramsQuery, message: {}});
    }
});

router.get("/author/add", function (req, res) {
    if (isSignIn(req, res)) {
        res.render("admin/author/add", {data: {}, message: {}});
    }
});

router.post("/author/add", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.body;

        if (params.authorName.trim().length == 0) {
            return res.render("admin/author/add", {data: {}, message: {error: "Vui lòng nhập tên tác giả"}});
        }

        var authorSlug = slug(params.authorName.trim().toLowerCase());

        var checkAuthor = await authorModels.getList({author_name: params.authorName.trim()}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (checkAuthor) {
            return res.render("admin/author/add", {data: {}, message: {error: "Tác giả này đã tồn tại"}});
        }

        var objData = {
            author_name: params.authorName.trim(),
            author_slug: authorSlug,
            is_deleted: 0
        };

        authorModels.add(objData).then(function (result) {
            if (result) {
                return res.render("admin/author/add", {data: {}, message: {success: "Thêm tác giả thành công"}});
            } else {
                return res.render("admin/author/add", {data: {}, message: {error: "Không thể thêm tác giả.Xin thử lại trong giây lát"}});
            }
        }).catch(function (err) {
            return res.render("admin/author/add", {data: {}, message: {error: "Không thể thêm tác giả.Xin thử lại trong giây lát"}});
        });
    }
});

router.get("/author/edit/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;

        if (params.id.length == 0) {
            return res.render("admin/author/index", {data: {}, message: {error: "ID không được bỏ trống"}});
        }

        var dataAuthor = await authorModels.getList({authorID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (dataAuthor.length == 0) {
            return res.render("admin/author/index", {data: {}, message: {error: "ID không tồn tại"}});
        }

        res.render("admin/author/edit", {data: {dataAuthor: dataAuthor}, params: params, message: {}});
    }
});

router.post("/author/edit/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;
        var body = req.body;

        if (params.id.length == 0) {
            return res.render("admin/author/index", {data: {}, params: params, message: {error: "ID không được bỏ trống"}});
        }

        var dataAuthor = await authorModels.getList({authorID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (dataAuthor.length == 0) {
            return res.render("admin/author/index", {data: {}, params: params, message: {error: "ID không tồn tại"}});
        }

        if (body.authorName.trim().length == 0) {
            return res.render("admin/author/edit", {data: {dataAuthor: dataAuthor}, params: params, message: {error: "Vui lòng nhập tên tác giả"}});
        }

        if (body.authorName != dataAuthor.author_name) {
            var checkAuthor = await authorModels.getList({author_name: body.authorName.trim()}).then(function (data) {
                return (data.length != 0) ? data[0] : '';
            });

            if (checkAuthor) {
                return res.render("admin/author/edit", {data: {dataAuthor: dataAuthor}, params: params, message: {error: "Tác giả đã tồn tại"}});
            }
        }
        var authorSlug = slug(body.authorName.trim().toLowerCase());

        var objData = {
            author_name: body.authorName.trim(),
            author_slug: authorSlug,
            is_deleted: 0
        };
        authorModels.edit({authorID: params.id}, objData).then(function (data) {
            if (data) {
                return res.render("admin/author/edit", {data: {dataAuthor: objData}, params: params, message: {success: "Chỉnh sửa tác giả thành công"}});
            } else {
                return res.render("admin/author/edit", {data: {dataAuthor: dataAuthor}, params: params, message: {error: "Chỉnh sửa tác giả thất bại"}});
            }
        }).catch(function (err) {
            return res.render("admin/author/edit", {data: {dataAuthor: dataAuthor}, params: params, message: {error: "Chỉnh sửa tác giả thất bại"}});
        });
    }
});

router.get("/author/remove/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;
        if (params.id.length == 0) {
            return res.json({success: 0, error: 1, message: 'Id không được bỏ trống'});
        }

        var checkID = await authorModels.getList({authorID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (checkID.length == 0) {
            return res.json({success: 0, error: 1, message: 'Id không tồn tại'});
        }


        authorModels.edit({authorID: params.id}, {is_deleted: 1}).then(function (data) {
            if (data) {
                return res.json({success: 1, error: 0, message: 'Xóa tác giả thành công'});
            } else {
                return res.json({success: 0, error: 1, message: 'Không thể xóa tác giả'});
            }
        }).catch(function (err) {
            return res.json({success: 0, error: 1, message: 'Không thể xóa tác giả'});
        });
    }
});

router.post("/author/remove-all", function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.body;

        var arrID = params.arrId;
        if (arrID.length == 0) {
            return res.json({success: 0, error: 1, message: 'Id không được bỏ trống'});
        }

        authorModels.editMulti({arrID: arrID}, {is_deleted: 1}, 'author_id').then(function (data) {
            if (data) {
                return res.json({success: 1, error: 0, message: 'Xóa thể loại thành công'});
            } else {
                return res.json({success: 0, error: 1, message: 'Không thể xóa thể loại'});
            }
        }).catch(function (err) {
            return res.json({success: 0, error: 1, message: 'Không thể xóa thể loại'});
        });
    }
});
//////////////////////////////////

router.get("/403", function (req, res) {
    if (req.session.user) {
        res.render("admin/403", {data: {}});
    } else {
        res.redirect("/");
    }
});


router.get("/signout", function (req, res) {
    req.session.destroy();
    res.redirect("/login");
});

router.post("/upload", multer({dest: 'upload/'}).any(), function (req, res) {
    if (isSignIn(req, res)) {
        var timestamp = new Date / 1E3 | 0;
        var tmpPath = req.files[0].path;

        var newPath = 'upload/' + helper.getTimeStampFolder(timestamp);
        mkdirp(newPath, '0777');

        var targetPath = newPath + "/" + timestamp + "_" + req.files[0].originalname;

        var src = fs.createReadStream(tmpPath);
        var dest = fs.createWriteStream(targetPath);
        src.pipe(dest);
        src.on('end', function () {
            fs.unlinkSync(req.files[0].path);
            res.json([{
                    image: config.bareURL + "/" + targetPath
                }]);
        });
    }
});


function isSignIn(req, res) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        if (req.session.user.user_role != 2) {
            res.redirect("/admin/403");
        } else {
            return true;
        }
    }
}




module.exports = router;