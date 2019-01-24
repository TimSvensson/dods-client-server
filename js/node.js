const readline = require('readline');
const io = require('socket.io-client');
const socket = require('socket.io');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
const IP = 'localhost'
const SPORT = 1055;
const BPORT = 1056;

function getMessage(client) {
    
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
    rl.question('Select mode ', (answer) => {
        console.log(`Thank you for your valuable feedback: ${answer}`);
        start(answer);
    });
}

function start(answer) {
    
    if (answer == 'backup') {
        let ip = IP + ':' + SPORT;
        var socketClient = io.connect('http://' + ip, {
            reconnection: true
        });
        
        socketClient.on('connect', function () {
            
            socketClient.on('connection confirmation', function() {
                console.log('connection confirmation\n');
            });

            socketClient.on('clientEvent', function(data, client) {
                console.log('Server message received: ', data, client);
            });
            
        });

        var socketServer = socket.listen(1056);

        socketServer.on('connection', function (socket) {
            console.log('connected:', socket.client.id);

            
            socket.on('message', function (data) {
                console.log('new message from client:', data);
            });
        });

    } else if (answer == 'client') {
        var ip = IP + ':' + SPORT;
        var client = io.connect('http://' + ip, {
            reconnection: true
        });
        client.on('connect', function () {
            
            client.on('connection confirmation', function() {
                console.log('connection confirmation\n');
            });

            client.on('clientEvent', function(data, client) {
                console.log('Server message received: ', data, client);
            });
            
            getMessage(client);

        });

    } else if (answer == 'server') {
        var socketServer = socket.listen(1055);
        
        console.log('Listening');
        socketServer.sockets.on('connection', (socket) => {
            console.log('connected:', socket.client.id);

            socket.emit('connection confirmation');
        
            socket.on('message', function (data) {
                console.log('Client msg:', data);
                socketServer.sockets.emit('clientEvent', data, socket.client.id);
            });

            socket.on('backupConnection', (adress) => {
               backupInfo = adress;
            });
            
        });

    } else {
        process.exit()
    }
}


function main() {
    getQuestion();
}

main();