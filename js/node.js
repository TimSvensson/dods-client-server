const readline = require('readline');
const io = require('socket.io-client');
const socket = require('socket.io');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });


function getMessage(client) {
    rl.question('Message?', (answer) => {
        client.emit('message', answer);
        getMessage(client);
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
        var socketClient = io.connect("http://localhost:1055/", {
            reconnection: true
        });

        var socketServer = socket.listen(1056);

        socketServer.on('connection', function (socket) {
            console.log('connected:', socket.client.id);
            socket.on('message', function (data) {
                console.log('new message from client:', data);
            });
        
            
        });

        socketClient.on('connect', function () {
            console.log('connected to localhost:1055');
            socketClient.on('clientEvent', function (data) {
                console.log('message from the server:', data);
                socketClient.emit('serverEvent', "thanks server! for sending '" + data + "'");
            });
        });

        socketClient.on('test', function() {
            console.log('test message received');
        });

    } else if (answer == 'client') {
        
        var client = io.connect("http://localhost:1056", {
            reconnection: true
        });
        client.on('connect', function () {
            console.log('connected to localhost:1056');
            
            client.on('clientEvent', function (data) {
                console.log('message from the server:', data);
                client.emit('serverEvent', "thanks server! for sending '" + data + "'");
            });
            
            getMessage(client);

        });

    } else if (answer == 'server') {
        var socketServer = socket.listen(1055);
        
        console.log('Listening');
        socketServer.on('connection', (socket) => {
            console.log('connected:', socket.client.id);
        
            




            socket.on('serverEvent', (data) => {
                console.log('new message from client:', data);
            });
            
            socket.emit('test');

            socket.on('backupConnection', (adress) => {
               backupInfo = adress;
            });
        
        });

    } else {
        console.log('invalid input');
    }
}


function main() {
    getQuestion();
}

main();