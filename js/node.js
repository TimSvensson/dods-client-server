const readline = require('readline');
const io = require('socket.io-client');
const socket = require('socket.io');

var localState = [];
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
const IP = 'localhost'
const SPORT = 1055;
var BPORT = 1056;
var MODE;

function getMessage(client) {
    console.log('getMessage has client id: ', client.id);
    
    rl.question('', (answer) => {
    if (answer == 'quit') {
        process.exit();
    } else {
        client.emit('message', answer);
        getMessage(client);
    }
    });
}

function getQuestion() {
    rl.question('Select mode: server, backup or client ', (answer) => {
        start(answer);
    });
}

function startServer(port) {
    var socketServer = socket.listen(port);
        
    console.log('Listening on port ' + port);

    socketServer.sockets.on('connection', (socket) => {
        console.log('Connected:', socket.client.id);

        socket.emit('connection confirmation', localState, BPORT);
    
        if (MODE == 'backup') {
            socket.emit('bport', BPORT);
        }

        socket.on('bport', (bport) => {
            BPORT = bport;
            console.log('Got backup port', BPORT);
        });    

        socket.on('message', (data) => {
            console.log('Client msg:', data);
            let time = Date.now();
            let entry = {time, data};
            localState.push(entry);
            console.log(localState);
            socketServer.sockets.emit('updateState', localState);
        });

        socket.on('disconnect', () => {
            console.log('Connection closed by ' + socket.client.id);
        });
    });
}

function startClient(port) {
    var ip = IP + ':' + port;
    var client = io.connect('http://' + ip, {
        reconnection: false
    });

    client.on('connect', function () {
        console.log('Just connected, here is id: ', client.id);
        getMessage(client);
        client.on('connection confirmation', (state, bport) => {
            localState = state;
            BPORT = bport;
            console.log('connection confirmation\n');
            console.log(localState, BPORT);
        });

        client.on('updateState', (state) => {
            console.log('Server message received: ', state);
            localState = state;
        });

        client.on('disconnect', () => {
            if (MODE == 'backup') {
                console.log('Disconnected from server');    
                client.close();
            } else {
                console.log('Disconnected from server, trying backup');
                startClient(BPORT);
            }
        });
    });
}


function start(answer) {
    
    if (answer == 'backup') {
        MODE = 'backup';
        rl.question('Select port for backup', (port) => {
            startServer(port);
            startClient(SPORT);
        });

    } else if (answer == 'client') {
        MODE = 'client';
        rl.question('Select port ', (port) => {
            startClient(port);
        });

    } else if (answer == 'server') {
        MODE = 'server';
        startServer(SPORT);

    } else {
        console.log('Wrong input, try again.')
        process.exit()
    }
}


function main() {
    getQuestion();
}

main();