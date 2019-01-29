const readline = require('readline');
const io = require('socket.io-client');
const socket = require('socket.io');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const IP = 'localhost'

var localState = [];
var SPORT = 1055;
var BPORT = 1056;
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

        socket.emit('connection confirmation', localState, BPORT);
    
        if (MODE == 'backup') {
            console.log('BPORT');
            socket.emit('bport', BPORT);
        }

        socket.on('bport', (bport) => {
            BPORT = bport;
        });    

        socket.on('message', (data) => {
            let time = Date.now();
            let entry = {_prints, time, data};
            _prints+=1;
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
    let ip = IP + ':' + port;
    console.log('ip', ip)
    let client = io.connect('http://' + ip);

    client.on('connect', () => {
        
        client.on('connection confirmation', (state, bport) => {
            localState = state;
            BPORT = bport;
           
            console.log('connection confirmed\n');
            globalClientBackup = client;
        });

        // if (MODE == 'backup') {
        //     client.emit('bport', BPORT);
        // }

        client.on('updateState', (state) => {
            localState = state;
            if (MODE == 'client') {
                console.log(localState.slice(-1)[0]);
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
        if (MODE == 'client') {
            setInterval(() => {
                client.emit('message', Math.random());
            }, 200);
            console.log('outside of interval')
        }
        
        getMessage();
    });
}

function start(answer) {
    
    if (answer == 'backup') {
        MODE = 'backup';
        startServer(BPORT);
        startClient(SPORT);
        // rl.question('Select port for backup\n', (port) => {
        //     // BPORT = port;
        //     rl.question('Select server port to connect to\n', (serverPort) => {
        //         // SPORT = serverPort;
                
        //     });
        // });

    } else if (answer == 'client') {
        MODE = 'client';
        startClient(SPORT);
        // rl.question('Select port\n', (port) => {
        // });

    } else if (answer == 'server') {
        MODE = 'server';
        startServer(SPORT);
        // rl.question('Select port for server\n', (port) => {
        //     // SPORT = port;
        // });

    } else {
        console.log('Wrong input, try again.');
        process.exit();
    }
}

function main() {
    getQuestion();
}

main();
