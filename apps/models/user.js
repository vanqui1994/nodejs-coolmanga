var q = require("q");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var db = require("../common/database");
var conn = db.getConnection();

//khai báo keyCached cho từng model;
var keyCached = "tmpUser:";

function addUser(params) {
    if (params) {
        var defer = q.defer();
        var query = conn.query('INSERT INTO users SET ?', params, function (error, results) {
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
        var sql = "UPDATE users SET " + strParams + " WHERE 1=1 " + strWhere;

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



function getList(params) {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var sql = 'SELECT * FROM users WHERE 1=1 ' + strWhere + ' ORDER BY user_id DESC';
        
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

function getListLimit(params, intPage = 1, intLimit = 30, strOrder = 'user_id DESC') {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var offset = intLimit * (intPage - 1);

        var sql = 'SELECT * FROM users WHERE 1=1 ' + strWhere;
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
    if (params.email) {
        strWhere += " AND email = " + conn.escape(params.email);
    }

    if (params.user_id) {
        strWhere += " AND user_id = " + conn.escape(params.user_id);
    }

    if (params.is_deleted != null) {
        strWhere += " AND is_deleted = " + conn.escape(params.is_deleted);
    }

    if (params.fullname) {
        strWhere += " AND fullname = " + conn.escape(params.fullname);
    }

    return strWhere;
}


function buildParams(params) {
    var strParams = '';
    if (params.password) {
        strParams += " password = " + conn.escape(params.password) + ",";
    }

    if (params.is_deleted != null) {
        strParams += " is_deleted = " + conn.escape(params.is_deleted) + ",";
    }
    strParams = strParams.replace(/(^,)|(,$)/g, "");
    
    return strParams;
}

//function buildWhere(params) {
//    var obj = {};
//    if (params.email) {
//        obj.email = params.email;
//    }
//    
//    if (params.fullname) {
//        obj.fullname = params.fullname;
//    }
//    
//   return obj;
//    
//}

module.exports = {
    addUser: addUser,
    edit: edit,
    getList: getList,
    getListLimit: getListLimit
};