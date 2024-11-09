let chart;
let signalData = [];
let reportData = [];
let intervalId;

// Initialize Chart.js graph
function initializeChart() {
    const ctx = document.getElementById('signal-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Wi-Fi Signal Strength (dBm)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: { display: true, title: { display: true, text: 'Time (s)' } },
                y: { display: true, title: { display: true, text: 'Signal Strength (dBm)' } }
            }
        }
    });
}

// Start Wi-Fi monitoring based on user-defined duration
function startMonitoring() {
    const duration = parseInt(document.getElementById('duration').value, 10);
    if (isNaN(duration) || duration <= 0) {
        alert("Please enter a valid duration.");
        return;
    }

    // Reset chart and data
    signalData = [];
    reportData = [];
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();

    document.getElementById('report-section').classList.add('hidden');
    
    // Start monitoring the Wi-Fi signal every second
    let secondsElapsed = 0;
    intervalId = setInterval(() => {
        if (secondsElapsed >= duration) {
            clearInterval(intervalId);
            generateReport();
            document.getElementById('report-section').classList.remove('hidden');
        } else {
            fetchWiFiSignalData();
            secondsElapsed++;
        }
    }, 1000);
}

// Fetch the Wi-Fi signal strength from the server
function fetchWiFiSignalData() {
    fetch('/wifi-info')
        .then(response => response.text())
        .then(data => {
            const signalStrength = extractSignalStrength(data);
            updateChart(signalStrength);
            signalData.push(signalStrength);
            reportData.push(`Time: ${signalData.length}s - Signal Strength: ${signalStrength} dBm`);
        })
        .catch(err => {
            console.error("Error fetching Wi-Fi info:", err);
        });
}

// Extract signal strength from the fetched data
function extractSignalStrength(data) {
    const match = data.match(/Signal\s+:\s*(-?\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}

// Update the chart with the new signal data
function updateChart(signalStrength) {
    const currentTime = signalData.length + 1;
    chart.data.labels.push(currentTime);
    chart.data.datasets[0].data.push(signalStrength);
    chart.update();
}

// Generate a report of the Wi-Fi signal strength
function generateReport() {
    const report = reportData.join('\n');
    document.getElementById('report-output').textContent = report;
}

// Download the generated report as a .txt file
function downloadReport() {
    const reportText = document.getElementById('report-output').textContent;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wifi_signal_report.txt';
    link.click();
}

// Initialize the chart when the page loads
window.onload = initializeChart;
