var q = require("q");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var db = require("../common/database");
var conn = db.getConnection();

//khai báo keyCached cho từng model;
var keyCached = "tmpAuthor:";

function add(params) {
    if (params) {
        var defer = q.defer();
        var query = conn.query('INSERT INTO author SET ?', params, function (error, results) {
            if (error) {
                defer.reject(error);
            } else {
                defer.resolve(results.insertId);
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
        var sql = "UPDATE author SET " + strParams + " WHERE 1=1 " + strWhere;

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
            sql += "UPDATE author SET " + strParams + " WHERE " + updatedBy + " = " + parseInt(val) + "; ";
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
        var sql = 'SELECT * FROM author WHERE 1=1 ' + strWhere + ' ORDER BY author_id DESC';

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


function getListLimit(params, intPage = 1, intLimit = 30, strOrder = 'author_id DESC') {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var offset = intLimit * (intPage - 1);

        var sql = 'SELECT * FROM author WHERE 1=1 ' + strWhere;
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
        var sql = 'SELECT count(*) as total FROM author WHERE 1=1 ' + strWhere + ' ORDER BY author_id DESC';
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
    if (params.authorID) {
        strWhere += " AND author_id = " + conn.escape(params.authorID);
    }

    if (params.authorName) {
        strWhere += " AND author_name like '%" + params.authorName + "%'";
    }

    if (params.author_name) {
        strWhere += " AND author_name  = " + conn.escape(params.author_name);
    }

    if (params.is_deleted != null) {
        strWhere += " AND is_deleted = " + conn.escape(params.is_deleted);
    }

    if (params.arrAuthor) {
        strWhere += " AND (0=1 OR ";
        params.arrAuthor.forEach(function (val) {
            strWhere += " author_name = "+ conn.escape(val) + " OR ";
        });
        strWhere += " 0=1)";
    }


    return strWhere;
}


function buildParams(params) {
    var strParams = '';
    if (params.is_deleted != null) {
        strParams += " is_deleted = " + conn.escape(params.is_deleted) + ",";
    }

    if (params.author_name) {
        strParams += " author_name = " + conn.escape(params.author_name) + ",";
    }

    if (params.author_slug) {
        strParams += " author_slug = " + conn.escape(params.author_slug) + ",";
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