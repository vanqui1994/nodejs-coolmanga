module.exports = function (io) {
    var usernames = [];
    io.sockets.on("connection", function (socket) {
        console.log("Co user connect");

        socket.on("addUser", function (username) {

            //luu tru lai
            socket.username = username;
            usernames.push(username);

            //Notify to myself
            var data = {
                sender: "Server",
                message: "You have join chat room"
            };

            socket.emit("updateMessage", data);

            //Notify to other user
            var data = {
                sender: "Server",
                message: username + " have join to chat room"
            };

            socket.broadcast.emit("updateMessage", data);

        });

        //lang nghe send message
        socket.on("sendMessage", function (message) {

            //notify to myself
            var data = {
                sender: "You",
                message: message
            };
            socket.emit("updateMessage", data);

            //notify to other user
            var data = {
                sender: socket.username,
                message: message
            };

            socket.broadcast.emit("updateMessage", data);

        });


        socket.on("disconnect", function () {
            //xoa user
            for (var i = 0; i < usernames.length; i++) {
                if (usernames[i] == socket.username) {
                    usernames.splice(i, 1);
                }
            };
            
            //notify to other user
            var data = {
                sender: "Server",
                message: socket.username + " disconnect to chat room"
            };

            socket.broadcast.emit("updateMessage", data);
        });
    });
};