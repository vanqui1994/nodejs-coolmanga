var config = require("config");
var mysql = require("mysql");


var connection = mysql.createConnection({
    host     : config.get("mysql.host"),
    user     : config.get("mysql.user"),
    password : config.get("mysql.password"),
    database : config.get("mysql.database"),
    port : config.get("mysql.port")
});

connection.connect(function(err) {
    if (err) {
        return;
    }
});

function getConnection() {
    if(!connection){
        connection.connect(function(err) {
            if (err) {
                return;
            }
        });
    }
    return connection;
}

module.exports = {
    getConnection : getConnection
};