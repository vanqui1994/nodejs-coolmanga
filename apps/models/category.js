var q = require("q");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var db = require("../common/database");
var conn = db.getConnection();

//khai báo keyCached cho từng model;
var keyCached = "tmpCategory:";

function add(params) {
    if (params) {
        var defer = q.defer();
        var query = conn.query('INSERT INTO category SET ?', params, function (error, results) {
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
        var sql = "UPDATE category SET " + strParams + " WHERE 1=1 " + strWhere;

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
            sql += "UPDATE category SET " + strParams + " WHERE " + updatedBy + " = " + parseInt(val) + "; ";
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
        var sql = 'SELECT * FROM category WHERE 1=1 ' + strWhere + ' ORDER BY category_id DESC';

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


function getListLimit(params, intPage = 1, intLimit = 30, strOrder = 'category_id DESC') {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var offset = intLimit * (intPage - 1);

        var sql = 'SELECT * FROM category WHERE 1=1 ' + strWhere;
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
        var sql = 'SELECT count(*) as total FROM category WHERE 1=1 ' + strWhere + ' ORDER BY category_id DESC';
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
    if (params.categoryID) {
        strWhere += " AND category_id = " + conn.escape(params.categoryID);
    }

    if (params.categoryTitle) {
        strWhere += " AND category_title like '%" + params.categoryTitle + "%'";
    }

    if (params.category_title) {
        strWhere += " AND category_title  = " + conn.escape(params.category_title);
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

    if (params.category_title) {
        strParams += " category_title = " + conn.escape(params.category_title) + ",";
    }

    if (params.category_slug) {
        strParams += " category_slug = " + conn.escape(params.category_slug) + ",";
    }

    if (params.site_title) {
        strParams += " site_title = " + conn.escape(params.site_title) + ",";
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