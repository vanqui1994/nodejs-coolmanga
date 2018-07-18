var q = require("q");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var db = require("../common/database");
var conn = db.getConnection();

//khai báo keyCached cho từng model;
var keyCached = "tmpComic:";

function add(params) {
    if (params) {
        var defer = q.defer();
        var query = conn.query('INSERT INTO comic SET ?', params, function (error, results) {
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

function getTotal(params) {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var sql = 'SELECT count(*) as total FROM comic WHERE 1=1 ' + strWhere + ' ORDER BY comic_id DESC';
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



function getList(params) {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var sql = 'SELECT * FROM comic WHERE 1=1 ' + strWhere + ' ORDER BY comic_id DESC';
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

function getListLimit(params, intPage = 1, intLimit = 30, strOrder = 'comic_id DESC') {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var offset = intLimit * (intPage - 1);

        var sql = 'SELECT * FROM comic WHERE 1=1 ' + strWhere;
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

function buildWhere(params) {
    var strWhere = '';
    if (params.comic_id) {
        strWhere += "AND comic_id = " + conn.escape(params.comic_id);
    }

    if (params.comic_title) {
        strWhere += "AND comic_title = " + conn.escape(params.comic_title);
    }

    return strWhere;
}


module.exports = {
    add: add,
    getList: getList,
    getTotal: getTotal,
    getListLimit: getListLimit
};