const readline = require('readline');
const io = require('socket.io-client');
const socket = require('socket.io');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const IP = 'localhost'

var localState = [];
var SPORT;
var BPORT;
var MODE;
var globalClientBackup;

var _prints = 0;

process.on('uncaughtException', function(err) {
    console.log(err)
})

function getMessage() {
    rl.question('', (answer) => {
    if (answer == 'quit') {
        process.exit();
    } else {
        globalClientBackup.emit('message', answer);
        getMessage(globalClientBackup);
    }});
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

        socket.on('bport', (bport) => {
            BPORT = bport;
            socketServer.emit('bport', bport);
        });

        socket.emit('connection confirmation', localState, BPORT);

        socket.on('message', (data) => {
            let time = Date.now();
            let entry = {time, data};
            localState.push(entry);
            console.log(localState);
            socket.broadcast.emit('updateState', localState);
            
        });

        socket.on('disconnect', () => {
            console.log('Connection closed by ' + socket.client.id);
        });
    });
}

function startClient(port) {
    let ip = IP + ':' + port;
    console.log('ip', ip)
    let client = io.connect('http://' + ip, {
        reconnection : false
    });

    client.on('connect', () => {
        
        if (MODE == 'backup') {
            client.emit('bport', BPORT);
        }

        client.on('connection confirmation', (state, bport) => {
            localState = state;
            globalClientBackup = client;
            BPORT = bport;
        });

        client.on('updateState', (state) => {
            localState = state;
            if (MODE == 'client') {
                console.log(localState);
                // console.log(localState.slice(-1)[0]);
            }
        });

        client.on('bport', (bport) => {
            if (MODE == 'client') {
                BPORT = bport;
            }
        });

        client.on('disconnect', () => {
            SPORT = BPORT;
            BPORT = undefined;
            
            if (MODE == 'backup') {
                console.log('Disconnected from server');    
            } else {
                console.log('Disconnected from server, trying backup');
                startClient(SPORT);
            }
        });
        
        getMessage();
    });
}

function start(answer) {
    
    if (answer == 'backup') {
        MODE = 'backup';
        rl.question('Select port for backup\n', (port) => {
            BPORT = port;
            rl.question('Select server port to connect to\n', (serverPort) => {
                SPORT = serverPort;
                startServer(BPORT);
                startClient(SPORT);
            });
        });

    } else if (answer == 'client') {
        MODE = 'client';
        rl.question('Select port\n', (port) => {
            SPORT = port;
            startClient(SPORT);
        });

    } else if (answer == 'server') {
        MODE = 'server';
        rl.question('Select port for server\n', (port) => {
            SPORT = port;
            startServer(SPORT);
        });

    } else {
        console.log('Wrong input, try again.');
        process.exit();
    }
}

function main() {
    getQuestion();
}

main();
