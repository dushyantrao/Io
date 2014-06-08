var readline = require('readline'),
socket = require('socket.io-client')('http://localhost:3000');
util = require('util'),
color = require('ansi-color').set;

var nick;
var rl = readline.createInterface(process.stdin, process.stdout);

function console_out(msg){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
    rl.prompt(true);
}

rl.question( "Please choose a nickname.", function(nickname){
    nick = nickname;
    var msg = nick + " has joined!";
    socket.emit('send', {type:'notice', message: msg});
    console_out(msg);
    rl.prompt(true); //switch back to prompt mode
});

//must read up


rl.on('line',function(line){
    if(line[0]=='/' && line.length > 1){
        var cmd = line.match(/[a-z]+\b/)[0];
        var arg = line.substr(cmd.length+2, line.length);
        chat_command(cmd, arg);
    } else{
        socket.emit('send',{type:'chat', message: line, nick: nick});
        rl.prompt(true);
    }
});

function chat_command(cmd, arg){
    switch(cmd){
    case 'nick':
        var notice = nick+ " changed their name to "+ arg;
        nick = arg;
        socket.emit('send',{type: 'notice', message: notice });
        break;
    case 'msg':
        var to = arg.match(/[a-z]+\b/)[0];
        var message = arg.substr(to.length, arg.length);
        socket.emit('send',{type:'tell', message: message, to: to, from :nick});
        break;
    case 'me':
        var emote = nick+ " " + arg;
        socket.emit('send',{type: 'emote', message: emote});
        break;
    }
}

//this is the fun part i feel

socket.on('message', function(data){
    var leader;
    if(data.type == 'chat' && data.nick != nick){
        leader = color("<"+data.nick+">", "green");
        console_out(leader+data.message);
    } else if(data.type == 'notice'){
        console_out(color(data.message, "cyan"));
    } else if(data.type == 'tell' && data.to == nick){
        leader = color("["+ data.from + "->" + data.to + "]", "red");
        console_out(leader + data.message);
    } else if(data.type == "emote"){
        console_out(color(data.message,"cyan"));
    }
});
