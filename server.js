// server.js
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3001;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the main HTML file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to fetch Wi-Fi info
app.get('/wifi-info', (req, res) => {
    exec('netsh wlan show interfaces', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return res.status(500).json({ error: 'Error fetching Wi-Fi info' });
        }
        res.json({ data: stdout });
    });
});

// Endpoint to fetch connected devices
app.get('/connected-devices', (req, res) => {
    exec('arp -a', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return res.status(500).json({ error: 'Error fetching connected devices' });
        }

        const lines = stdout.split('\n');
        const devices = lines
            .filter(line => line.includes('dynamic'))
            .map(line => {
                const match = line.match(/\? \(([\d\.]+)\)\s+([a-fA-F0-9:-]+)\s+([a-zA-Z]+)/);
                if (match) {
                    return {
                        ipAddress: match[1],
                        macAddress: match[2],
                        type: match[3]
                    };
                }
                return null;
            })
            .filter(Boolean);

        res.json({ devices });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
