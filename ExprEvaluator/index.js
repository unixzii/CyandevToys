const readline = require('readline');

const core = require('./core');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.setPrompt('expr> ');
rl.prompt();

rl.on('line', (line) => {
    line = line.trim();

    console.dir(core(line));

    rl.prompt();
});

rl.on('close', () => {
    console.log('\nBye bye.');
    process.exit(0);
});