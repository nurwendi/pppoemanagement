const telnet = require('telnet-client');
const { Telnet } = telnet;

async function run() {
    const connection = new Telnet();

    const params = {
        host: '103.150.33.187',
        port: 11023,
        username: 'zte',
        password: 'zte',
        shellPrompt: /(?:#|>)\s*$/,
        loginPrompt: /Username:/i,
        passwordPrompt: /Password:/i,
        timeout: 10000,
        debug: true
    };

    console.log('Connecting...');

    try {
        connection.on('data', (data) => {
            console.log('[RAW DATA]:', data.toString());
        });

        await connection.connect(params);
        console.log('Connected!');

        const termRes = await connection.send('terminal length 0');
        console.log('Terminal length result:', termRes);

        const fs = require('fs');
        const res = await connection.send('show running');
        console.log('Command finished. Writing to debug-output.txt...');
        fs.writeFileSync('debug-output.txt', res);
        console.log('Done.');

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
