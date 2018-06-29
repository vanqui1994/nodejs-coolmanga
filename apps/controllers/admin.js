var express = require("express");
var multer = require('multer');
var config = require('config');
const fs = require('fs');
var mkdirp = require('mkdirp');
var unique = require('array-unique');
var slug = require('slug');


var configModels = require("../models/config");
var categoryModels = require("../models/category");
var authorModels = require("../models/author");
var newsModels = require("../models/news");
var menuModels = require("../models/menu");

var helper = require("../helpers/helper");


var router = express.Router();


router.get("/", function (req, res) {
    var auth = isSignIn(req, res);
    if (auth) {
        res.render("admin/dashboard", {data: {error: true}});
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
            return res.redirect("/admin/category");
        }

        var dataCategory = await categoryModels.getList({categoryID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (dataCategory.length == 0) {
            return res.redirect("/admin/category");
        }

        res.render("admin/category/edit", {data: {dataCategory: dataCategory}, params: params, message: {}});
    }
});

router.post("/category/edit/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;
        var body = req.body;

        if (params.id.length == 0) {
            return res.redirect("/admin/category");
        }

        var dataCategory = await categoryModels.getList({categoryID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (dataCategory.length == 0) {
            return res.redirect("/admin/category");
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
            return res.redirect("/admin/author");
        }

        var dataAuthor = await authorModels.getList({authorID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (dataAuthor.length == 0) {
            return res.redirect("/admin/author");
        }

        res.render("admin/author/edit", {data: {dataAuthor: dataAuthor}, params: params, message: {}});
    }
});

router.post("/author/edit/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;
        var body = req.body;

        if (params.id.length == 0) {
            return res.redirect("/admin/author");
        }

        var dataAuthor = await authorModels.getList({authorID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (dataAuthor.length == 0) {
            return res.redirect("/admin/author");
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


//action news
router.get("/news", async function (req, res) {
    if (isSignIn(req, res)) {
        var paramsQuery = req.query;

        var intLimit = 15;
        var intPage = (typeof paramsQuery.page !== 'undefined') ? parseInt(paramsQuery.page) : 1;

        if (paramsQuery.isFilter) {
            var objCondition = {
                newsTitle: paramsQuery.newsTitle.trim(),
                is_deleted: 0
            };
        } else {
            var objCondition = {
                is_deleted: 0
            };
        }

        var intTotal = await newsModels.getTotal(objCondition).then(function (data) {
            return (data.length != 0) ? data[0].total : 0;
        });

        var paging = helper.paging("admin/news", paramsQuery, intTotal, intPage, intLimit);

        var objNewsList = await newsModels.getListLimit(objCondition, intPage, intLimit).then(function (data) {
            return (data.length != 0) ? data : '';
        });

        res.render("admin/news/index", {data: objNewsList, paging: paging, params: paramsQuery, message: {}});
    }
});

router.get("/news/add", function (req, res) {
    if (isSignIn(req, res)) {
        return res.render("admin/news/add", {data: {}, message: {}});
    }
});

router.post("/news/add", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.body;

        if (params.newsTitle.trim().length == 0) {
            return res.render("admin/news/add", {data: {}, message: {error: "Vui lòng nhập tiêu đề bài viết"}});
        }

        if (params.newsContent.trim().length == 0) {
            return res.render("admin/news/add", {data: {}, message: {error: "Vui lòng nhập chi tiết bài viết"}});
        }

        var newsSlug = slug(params.newsTitle.trim().toLowerCase());
        var timestamp = new Date / 1E3 | 0;

        var objData = {
            news_title: params.newsTitle.trim(),
            news_slug: newsSlug,
            news_content: params.newsContent.trim(),
            is_deleted: 0,
            created_date: timestamp
        };

        newsModels.add(objData).then(function (data) {
            if (data) {
                return res.render("admin/news/add", {data: {}, message: {success: "Thêm bài viết thành công"}});
            } else {
                return res.render("admin/news/add", {data: {}, message: {error: "Không thể thêm bài viết"}});
            }
        }).catch(function (err) {
            return res.render("admin/news/add", {data: {}, message: {error: "Không thể thêm bài viết"}});
        });
    }
});

router.get("/news/edit/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;

        if (params.id.length == 0) {
            return res.redirect("/admin/news");
        }

        var dataNews = await newsModels.getList({newsID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (dataNews.length == 0) {
            return res.redirect("/admin/news");
        }

        res.render("admin/news/edit", {data: {dataNews: dataNews}, params: params, message: {}});
    }
});

router.post("/news/edit/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;
        var body = req.body;

        if (params.id.length == 0) {
            return res.redirect("/admin/news");
        }

        var dataNews = await newsModels.getList({newsID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (dataNews.length == 0) {
            return res.redirect("/admin/news");
        }

        if (body.newsTitle.trim().length == 0) {
            return res.render("admin/news/edit", {data: {dataNews: dataNews}, params: params, message: {error: "Vui lòng nhập tiêu đề"}});
        }

        if (body.newsContent.trim().length == 0) {
            return res.render("admin/news/edit", {data: {dataNews: dataNews}, params: params, message: {error: "Vui lòng nhập chi tiết bài viết"}});
        }

        if (body.newsTitle != dataNews.news_title) {
            var checkNews = await newsModels.getList({news_title: body.newsTitle.trim()}).then(function (data) {
                return (data.length != 0) ? data[0] : '';
            });

            if (checkNews) {
                return res.render("admin/news/edit", {data: {dataNews: dataNews}, params: params, message: {error: "Tiêu đề đã tồn tại"}});
            }
        }
        var newslug = slug(body.newsTitle.trim().toLowerCase());

        var objData = {
            news_title: body.newsTitle.trim(),
            news_slug: newslug,
            news_content: body.newsContent.trim(),
            is_deleted: 0
        };
        newsModels.edit({news_id: params.id}, objData).then(function (data) {
            if (data) {
                return res.render("admin/news/edit", {data: {dataNews: objData}, params: params, message: {success: "Chỉnh sửa bài viết thành công"}});
            } else {
                return res.render("admin/news/edit", {data: {dataNews: dataNews}, params: params, message: {error: "Chỉnh sửa bài viết thất bại"}});
            }
        }).catch(function (err) {
            return res.render("admin/news/edit", {data: {dataNews: dataNews}, params: params, message: {error: "Chỉnh sửa bài viết thất bại"}});
        });
    }
});

router.get("/news/remove/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;
        if (params.id.length == 0) {
            return res.json({success: 0, error: 1, message: 'Id không được bỏ trống'});
        }

        var checkID = await newsModels.getList({newsID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (checkID.length == 0) {
            return res.json({success: 0, error: 1, message: 'Id không tồn tại'});
        }


        newsModels.edit({newsID: params.id}, {is_deleted: 1}).then(function (data) {
            if (data) {
                return res.json({success: 1, error: 0, message: 'Xóa bài viết thành công'});
            } else {
                return res.json({success: 0, error: 1, message: 'Không thể xóa bài viết'});
            }
        }).catch(function (err) {
            return res.json({success: 0, error: 1, message: 'Không thể xóa bài viết'});
        });
    }
});

router.post("/news/remove-all", function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.body;

        var arrID = params.arrId;
        if (arrID.length == 0) {
            return res.json({success: 0, error: 1, message: 'Id không được bỏ trống'});
        }

        newsModels.editMulti({arrID: arrID}, {is_deleted: 1}, 'news_id').then(function (data) {
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
/////////////////////////////////


//action menu
router.get("/menu", async function (req, res) {
    if (isSignIn(req, res)) {
        res.render("admin/menu/index", {data: {}, message: {}});
    }
});

router.post("/menu/get-child", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.body;

        var menuList = await menuModels.getList({}).then(function (data) {
            return (data.length != 0) ? data : {};
        });
        if (params.type == 'add' || params.type == 'edit') {
            var categoryTree = helper.buildMenu(menuList, 0, 0, params);
        } else {
            var categoryTree = helper.categoryTree(menuList, 0, []);

            if (categoryTree.length == 0) {
                categoryTree = helper.categoryTree(menuList, 0, []);
            }
        }

        return res.json(categoryTree);
    }
});

router.get("/menu/add", function (req, res) {
    if (isSignIn(req, res)) {
        res.render("admin/menu/add", {data: {}, message: {}});
    }
});

router.post("/menu/add", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.body;

        if (params.menuName.trim().length == 0) {
            return res.render("admin/menu/add", {data: {}, message: {error: "Vui lòng nhập tên menu"}});
        }

        if (params.parentID == '' || params.parentID == null) {
            return res.render("admin/menu/add", {data: {}, message: {error: "Vui lòng chọn danh mục"}});
        }

        if (params.menuTarget == 'on') {
            var target = 1;
        } else {
            var target = 0;
        }

        var menuSlug = slug(params.menuName.trim().toLowerCase());

        var objData = {
            menu_name: params.menuName.trim(),
            menu_url: menuSlug,
            target: target,
            parent_id: parseInt(params.parentID),
            is_deleted: 0
        };

        var checkMenu = await menuModels.getList({menu_name: params.menuName.trim(), parentID: parseInt(params.parentID), is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });

        if (checkMenu) {
            return res.render("admin/menu/add", {data: {}, message: {error: "Menu đã tồn tại"}});
        }

        menuModels.add(objData).then(function (data) {
            if (data) {
                return res.render("admin/menu/add", {data: {}, message: {success: "Thêm menu thành công"}});
            } else {
                return res.render("admin/menu/add", {data: {}, message: {error: "Không thể thêm menu"}});
            }
        }).catch(function (err) {
            return res.render("admin/menu/add", {data: {}, message: {error: "Không thể thêm menu"}});
        });

    }
});

router.get("/menu/edit/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;

        if (params.id.length == 0) {
            return res.redirect("/admin/menu");
        }

        var dataMenu = await menuModels.getList({menuID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });
        
        if(dataMenu.length == 0){
            return res.redirect("/admin/menu");
        }

        res.render("admin/menu/edit", {data: {dataMenu: dataMenu}, params: params, message: {}});
    }
});

router.post("/menu/edit/:id", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.params;
        var body = req.body;

        if (params.id.length == 0) {
            return res.redirect("/admin/menu");
        }

        var dataMenu = await menuModels.getList({menuID: params.id, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });


        if (dataMenu.length == 0) {
            return res.redirect("/admin/menu");
        }

        if (body.menuName.trim().length == 0) {
            return res.render("admin/menu/edit", {data: {dataMenu: dataMenu}, params: params, message: {error: "Vui lòng nhập tên menu"}});
        }

        if (body.parentID == '' || body.parentID == null) {
            return res.render("admin/menu/edit", {data: {dataMenu: dataMenu}, params: params, message: {error: "Vui lòng chọn danh mục"}});
        }

        if (body.menuTarget == 'on') {
            var target = 1;
        } else {
            var target = 0;
        }

        if (body.menuName.trim() != dataMenu.menu_name) {
            var checkMenu = await menuModels.getList({menu_name: body.menuName.trim(), parentID: parseInt(body.parentID), is_deleted: 0}).then(function (data) {
                return (data.length != 0) ? data[0] : '';
            });

            if (checkMenu) {
                return res.render("admin/menu/edit", {data: {dataMenu: dataMenu}, params: params, message: {error: "Menu đã tồn tại"}});
            }
        }

        var menuSlug = slug(body.menuName.trim().toLowerCase());

        var objData = {
            menu_name: body.menuName.trim(),
            menu_url: menuSlug,
            target: target,
            parent_id: parseInt(body.parentID),
            is_deleted: 0
        };
        menuModels.edit({menuID: params.id}, objData).then(function (data) {
            if (data) {
                return res.render("admin/menu/edit", {data: {dataMenu: objData}, params: params, message: {success: "Chỉnh sửa menu thành công"}});
            } else {
                return res.render("admin/menu/edit", {data: {dataMenu: dataMenu}, params: params, message: {error: "Chỉnh sửa menu thất bại"}});
            }
        }).catch(function (err) {
            return res.render("admin/menu/edit", {data: {dataMenu: dataMenu}, params: params, message: {error: "Chỉnh sửa menu thất bại"}});
        });
    }
});

router.get("/menu/remove", async function (req, res) {
    if (isSignIn(req, res)) {
        var params = req.query;

        var menuID = parseInt(params.menuID);
        if(menuID.length == 0){
            return res.json({success: 0, error: 1, message: 'Id không được bỏ trống'});
        }
        var checkMenu = await menuModels.getList({menuID: menuID, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });
        
        if(checkMenu.length == 0){
            return res.json({success: 0, error: 1, message: 'Id không tồn tại'});
        }
        
        var checkMenuParent = await menuModels.getList({parentID: menuID, is_deleted: 0}).then(function (data) {
            return (data.length != 0) ? data[0] : '';
        });
        
        if(checkMenuParent){
            return res.json({success: 0, error: 1, message: 'Không thể xóa danh mục chính'});
        }
        
        menuModels.edit({menuID: menuID}, {is_deleted: 1}).then(function (data) {
            if (data) {
                return res.json({success: 1, error: 0, message: 'Xóa menu thành công'});
            } else {
                return res.json({success: 0, error: 1, message: 'Không thể xóa menu'});
            }
        }).catch(function (err) {
            return res.json({success: 0, error: 1, message: 'Không thể xóa menu'});
        });
    }
});
///////////////////////////////


//action comic
router.get("/comic", async function(req,res){
    
});

router.get("/comic/add",function(req,res){
    
});

router.post("/comic/add", async function(req,res){
    
});

router.get("/comic/edit/:id", async function(req,res){
    
});

router.post("/comic/edit/:id", async function(req,res){
    
});

router.get("/comic/remove", async function(req,res){
    
});

router.post("/comic/grab",async function(req,res){
    
});

///////////////////////////////

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