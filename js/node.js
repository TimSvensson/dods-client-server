const readline = require('readline');
const io = require('socket.io-client');
const socket = require('socket.io');

var messages = [];
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
        
        socketClient.on('connect', () => {
            
            socketClient.on('connection confirmation', () => {
                console.log('connection confirmation\n');
            });

            socketClient.on('updateState', (data, client) => {
                console.log('Server message received: ', data, client);
            });
        });

        var socketServer = socket.listen(1056);

        socketServer.on('connection', (socket) => {
            console.log('connected:', socket.client.id);

            socket.on('message', (data) => {
                console.log('new message from client:', data);
            });
        });

    } else if (answer == 'client') {
        var ip = IP + ':' + SPORT;
        var client = io.connect('http://' + ip, {
            reconnection: true
        });
        client.on('connect', function () {
            
            client.on('connection confirmation', (state) => {
                messages = state;
                console.log('connection confirmation\n');
                console.log(state);
            });

            client.on('updateState', (state) => {
                console.log('Server message received: ', state);
                messages = state;
            });

            client.on('disconnect', () => {
                console.log('Disconnected');
                process.exit();
            });
            
            getMessage(client);
        });

    } else if (answer == 'server') {
        var socketServer = socket.listen(1055);
        
        console.log('Listening');
        socketServer.sockets.on('connection', (socket) => {
            console.log('connected:', socket.client.id);

            socket.emit('connection confirmation', messages);
        
            socket.on('message', (data) => {
                console.log('Client msg:', data);
                let time = Date.now();
                let entry = {time, data};
                messages.push(entry);
                messages.sort();
                console.log(messages);
                socketServer.sockets.emit('updateState', messages);
            });
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