const readline = require('readline');
const io = require('socket.io-client');
const socket = require('socket.io');

var localState = [];
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
const IP = 'localhost'
var SPORT = 1055;
var BPORT = undefined;
var MODE;
var globalClientBackup;

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

        socket.emit('connection confirmation', localState, BPORT);
    
        if (MODE == 'backup') {
            socket.emit('bport', BPORT);
        }

        socket.on('bport', (bport) => {
            BPORT = bport;
            console.log('Got backup port', BPORT);
        });    

        socket.on('message', (data) => {
            let time = Date.now();
            let entry = {time, data};
            localState.push(entry);
            console.log(entry);
            socket.broadcast.emit('updateState', localState);
        });

        socket.on('disconnect', () => {
            console.log('Connection closed by ' + socket.client.id);
        });
    });
}

function startClient(port) {
    SPORT = port;
    let ip = IP + ':' + SPORT;
    let client = io.connect('http://' + ip, {
        reconnection: false,
        
    });

    client.on('connect', () => {
        console.log('Just connected, here is id: ', client.id);
        
        client.on('connection confirmation', (state, bport) => {
            localState = state;

            if (bport != undefined) {
                BPORT = bport;
            }

            console.log('connection confirmed\n');
            globalClientBackup = client;
        });

        if (MODE == 'backup') {
            client.emit('bport', BPORT);
        }

        client.on('updateState', (state) => {
            localState = state;
            console.log(localState);
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
        if (MODE != 'backup') {
            setInterval(() => {
                client.emit('message', Math.random());
            }, 200);
            
        }
        
        // getMessage();
    });
}

/*
    User can give backup port if it should be backup server, or give no port for it to just be a server


*/

function start(answer) {
    
    if (answer == 'backup') {
        MODE = 'backup';
        rl.question('Select port for backup\n', (port) => {
            BPORT = port;
            rl.question('Select server port to connect to\n', (serverPort) => {
                SPORT = serverPort;
                startServer(port);
                startClient(SPORT);
            });
            
        });

    } else if (answer == 'client') {
        MODE = 'client';
        rl.question('Select port\n', (port) => {
            startClient(port);
        });

    } else if (answer == 'server') {
        MODE = 'server';
        rl.question('Select port for server\n', (port) => {
            SPORT = port;
            startServer(port);
        });

    } else {
        console.log('Wrong input, try again.')
        process.exit()
    }
}

function main() {
    getQuestion();
}

main();
