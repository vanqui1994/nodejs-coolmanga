var q = require("q");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var db = require("../common/database");
var conn = db.getConnection();

//khai báo keyCached cho từng model;
var keyCached = "tmpNews:";

function add(params) {
    if (params) {
        var defer = q.defer();
        var query = conn.query('INSERT INTO news SET ?', params, function (error, results) {
            if (error) {
                defer.reject(error);
            } else {
                defer.resolve(results);
            }
        });
        myCache.flushAll();
        return defer.promise;
    }
    return false;
}

function edit(params, arrCondition) {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var strParams = buildParams(arrCondition);
        var sql = "UPDATE news SET " + strParams + " WHERE 1=1 " + strWhere;

        conn.query(sql, function (error, results) {
            if (error) {
                defer.reject(error);
            } else {
                defer.resolve(results.affectedRows);
            }
        });
        myCache.flushAll();
        return defer.promise;
    }
    return false;
}

function editMulti(params, arrCondition, updatedBy) {
    if (params && updatedBy) {
        var defer = q.defer();
        var strParams = buildParams(arrCondition);

        var sql = '';
        params.arrID.forEach(function (val) {
            sql += "UPDATE news SET " + strParams + " WHERE " + updatedBy + " = " + parseInt(val) + "; ";
        });

        sql = sql.replace(/(^; )|(; $)/g, "");
        conn.query(sql, function (error, results) {
            if (error) {
                defer.reject(error);
            } else {
                var resultData = (results[0]) ? results[0] : results;
                defer.resolve(resultData.affectedRows);
            }
        });
        myCache.flushAll();
        return defer.promise;
    }
    return false;
}



function getList(params) {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var sql = 'SELECT * FROM news WHERE 1=1 ' + strWhere + ' ORDER BY news_id DESC';

        var key = keyCached + sql;
        var result = '';
        myCache.get(key, function (err, value) {
            if (value == undefined) {
                conn.query(sql, function (error, results) {
                    if (error) {
                        defer.reject(error);
                    } else {
                        defer.resolve(results);
                    }
                });
                result = defer.promise;
                myCache.set(key, result, 60 * 60 * 24 * 7);
            } else {
                result = value;
            }
        });
        return result;
    }
    return false;
}


function getListLimit(params, intPage = 1, intLimit = 30, strOrder = 'news_id DESC') {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var offset = intLimit * (intPage - 1);

        var sql = 'SELECT * FROM news WHERE 1=1 ' + strWhere;
        //tách ra để sau này có join 
        sql += ' ORDER BY ' + strOrder;
        sql += ' LIMIT ' + intLimit + ' OFFSET ' + offset;
        var key = keyCached + sql;
        var result = '';

        myCache.get(key, function (err, value) {
            if (value == undefined) {
                conn.query(sql, function (error, results) {
                    if (error) {
                        defer.reject(error);
                    } else {
                        defer.resolve(results);
                    }
                });
                result = defer.promise;
                myCache.set(key, result, 60 * 60 * 24 * 7);
            } else {
                result = value;
            }
        });
        return result;
    }
    return false;
}

function getTotal(params) {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var sql = 'SELECT count(*) as total FROM news WHERE 1=1 ' + strWhere + ' ORDER BY news_id DESC';
        var key = keyCached + sql;
        var result = '';
        myCache.get(key, function (err, value) {
            if (value == undefined) {
                conn.query(sql, function (error, results) {
                    if (error) {
                        defer.reject(error);
                    } else {
                        defer.resolve(results);
                    }
                });
                result = defer.promise;
                myCache.set(key, result, 60 * 60 * 24 * 7);
            } else {
                result = value;
            }
        });
        return result;
    }
    return false;
}

function buildWhere(params) {
    var strWhere = '';
    if (params.newsID) {
        strWhere += " AND news_id = " + conn.escape(params.newsID);
    }

    if (params.newsTitle) {
        strWhere += " AND news_title like '%" + params.newsTitle + "%'";
    }

    if (params.news_title) {
        strWhere += " AND news_title  = " + conn.escape(params.news_title);
    }

    if (params.is_deleted != null) {
        strWhere += " AND is_deleted = " + conn.escape(params.is_deleted);
    }



    return strWhere;
}


function buildParams(params) {
    var strParams = '';
    if (params.is_deleted != null) {
        strParams += " is_deleted = " + conn.escape(params.is_deleted) + ",";
    }

    if (params.news_title) {
        strParams += " news_title = " + conn.escape(params.news_title) + ",";
    }

    if (params.news_slug) {
        strParams += " news_slug = " + conn.escape(params.news_slug) + ",";
    }
    
    if (params.news_content) {
        strParams += " news_content = " + conn.escape(params.news_content) + ",";
    }


    strParams = strParams.replace(/(^,)|(,$)/g, "");

    return strParams;
}


module.exports = {
    add: add,
    edit: edit,
    editMulti: editMulti,
    getList: getList,
    getListLimit: getListLimit,
    getTotal: getTotal
};