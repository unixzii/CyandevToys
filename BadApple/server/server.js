const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let throttleFlag = false;
let allocatedLines = 0;

process.stdout.write('\x1b[?25l');

function clearScreen() {
  if (allocatedLines > 0) {
    process.stdout.write('\x1b[' + allocatedLines + 'A\r');
  } else {
    // process.stdout.write('\x1b[H\x1b[J');
  }
}

function welcomePrompt() {
  console.log('Waiting for connections on "ws://localhost:8080"...');
}

wss.on('connection', function (ws) {
  ws.on('message', function (msg) {
    throttleFlag = !throttleFlag;
    if (throttleFlag) {
      return;
    }
    clearScreen();
    process.stdout.write(msg);
    allocatedLines = msg.split('\n').length;
  });

  ws.on('close', function () {
    clearScreen();
    welcomePrompt();
  });
});

welcomePrompt();

process.on('SIGINT', function () {
  if (allocatedLines) {
    allocatedLines += 2;
    clearScreen();
  }

  process.stdout.write('\x1b[?25h');
  process.stdout.write('\nbye~\n');
  process.exit(0);
});