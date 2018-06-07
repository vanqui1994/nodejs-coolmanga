var q = require("q");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var db = require("../common/database");
var conn = db.getConnection();

//khai báo keyCached cho từng model;
var keyCached = "tmpConfig:";

function add(params) {
    if (params) {
        var defer = q.defer();
        var query = conn.query('INSERT INTO config SET ?', params, function (error, results) {
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
        var sql = "UPDATE config SET " + strParams + " WHERE 1=1 " + strWhere;
        
        conn.query(sql, function (error, results) {
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



function getList(params) {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var sql = 'SELECT * FROM config WHERE 1=1 ' + strWhere + ' ORDER BY config_id DESC';

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


//function getList(params) {
//    if (params) {
//        var defer = q.defer();
//        var strWhere = buildWhere(params);
//        var sql = 'SELECT * FROM config WHERE 1=1 ' + strWhere + ' ORDER BY config_id DESC';
//
//        var key = keyCached + sql;
//        var result = '';
//        myCache.get(key, function (err, value) {
//            if (value == undefined) {
//                conn.query(sql, function (error, results) {
//                    if (error) {
//                        defer.reject(error);
//                    } else {
//                        defer.resolve(results);
//                    }
//                });
//                result = defer.promise;
//                myCache.set(key, result, 60 * 60 * 24 * 7);
//            } else {
//                result = value;
//            }
//        });
//        return result;
//    }
//    return false;
//}

function getListLimit(params, intPage = 1, intLimit = 30, strOrder = 'config_id DESC') {
    if (params) {
        var defer = q.defer();
        var strWhere = buildWhere(params);
        var offset = intLimit * (intPage - 1);

        var sql = 'SELECT * FROM config WHERE 1=1 ' + strWhere;
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
    if (params.configID) {
        strWhere += " AND config_id = " + conn.escape(params.configID);
    }

    return strWhere;
}


function buildParams(params) {
    var strParams = '';
    if (params.config_email) {
        strParams += " config_email = " + conn.escape(params.config_email) + ",";
    }

    if (params.config_title) {
        strParams += " config_title = " + conn.escape(params.config_title) + ",";
    }
    
    if (params.config_footer) {
        strParams += " config_footer = " + conn.escape(params.config_footer) + ",";
    }
    
    if (params.config_fanpage) {
        strParams += " config_fanpage = " + conn.escape(params.config_fanpage) + ",";
    }
    
    if (params.config_summary) {
        strParams += " config_summary = " + conn.escape(params.config_summary) + ",";
    }
    
    if (params.config_logo) {
        strParams += " config_logo = " + conn.escape(params.config_logo) + ",";
    }
    strParams = strParams.replace(/(^,)|(,$)/g, "");
    
    return strParams;
}


module.exports = {
    add: add,
    edit: edit,
    getList: getList,
    getListLimit: getListLimit
};