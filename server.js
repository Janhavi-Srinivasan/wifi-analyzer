const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3001;

// Serve static HTML file from the current directory
app.use(express.static(path.join(__dirname)));

// Endpoint to fetch Wi-Fi info
app.get('/wifi-info', (req, res) => {
    exec('netsh wlan show interfaces', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${stderr}`);
            return res.status(500).send(`Error fetching Wi-Fi info: ${stderr}`);
        }

        // Example regex to extract max devices (adjust based on actual output)
        const maxDevicesMatch = stdout.match(/Max\s+Clients\s*:\s*(\d+)/);
        const maxDevices = maxDevicesMatch ? maxDevicesMatch[1] : 'Unknown';

        res.send(`<pre>${stdout}</pre>\n\nMaximum allowed devices: ${maxDevices}`);
    });
});

// Endpoint to fetch connected devices
app.get('/connected-devices', (req, res) => {
    exec('arp -a', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${stderr}`);
            return res.status(500).send(`Error fetching connected devices: ${stderr}`);
        }

        // Split the output into lines and parse each line for relevant information
        const lines = stdout.split('\n');
        const devices = lines
            .filter(line => line.includes('dynamic')) // Filter out only dynamic devices
            .map(line => {
                // Regex to extract IP address, MAC address, and device type
                const match = line.match(/\? \(([\d\.]+)\)\s+([a-fA-F0-9:-]+)\s+([a-zA-Z]+)/);
                if (match) {
                    return {
                        ipAddress: match[1],      // IP address
                        macAddress: match[2],     // MAC address
                        type: match[3]            // Device type (static/dynamic)
                    };
                }
            }).filter(device => device); // Remove any null values

        // Prepare the response with detailed device info
        if (devices.length > 0) {
            let response = `Currently connected devices: ${devices.length}\n\n`;
            devices.forEach(device => {
                response += `IP Address: ${device.ipAddress}\nMAC Address: ${device.macAddress}\nType: ${device.type}\n\n`;
            });
            res.send(response);
        } else {
            res.send('No devices currently connected.');
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
