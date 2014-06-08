//listen to port 3000
var io = require('socket.io')();
io.listen(3000);
console.log("Server is up");
io.on('connection', function(socket){
    //emit
    socket.on('send',function(data){
        io.emit('message',data);
    });
});
