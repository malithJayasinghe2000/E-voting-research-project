const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Set up Express app
const app = express();
app.use(cors());  // Allow cross-origin requests

const server = http.createServer(app);

// Initialize Socket.IO on the existing HTTP server
const io = new Server(server, {
    cors: {
        origin: '*',  // Allow connections from any origin (adjust for production)
        methods: ['GET', 'POST']
    }
});

// User interaction logs (optional for analysis and debugging)
const userInteractionLogs = {};

// Listen for incoming WebSocket connections
io.on('connection', (socket) => {
    console.log("Client connected:", socket.id);

    // Listen for user interaction data
    socket.on('user_interaction', (data, callback) => {
        // Store interaction data (optional)
        if (!userInteractionLogs[socket.id]) {
            userInteractionLogs[socket.id] = [];
        }
        userInteractionLogs[socket.id].push(data);

        // Analyze the interaction data and send appropriate help if needed
        const response = analyzeUserInteraction(data);

        // If an issue is detected, send feedback to the client
        if (response.issueDetected) {
            socket.emit('help_response', response);
        }

        // Send acknowledgment back to the client
        if (callback) {
            callback({ status: 'ok' });
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log("Client disconnected:", socket.id);
    });
});

// Analyze interaction data to detect user struggles
function analyzeUserInteraction(data) {
    let response = { issueDetected: false };

    // Example: Long time spent on a task
    if (data.type === 'time_on_task' && data.timeSpent > 5000) {
        response = {
            issueDetected: true,
            suggestion: 'It seems you are taking a while. Do you need assistance?',
            highlightButton: true,
            buttonStyles: {
                firstButton: 'transform scale-125 text-5xl',
                secondButton: '', // Leave empty if only Confirm should be highlighted
                thirdButton: ''
            }
        };
    }

    // Other conditions for user struggles...

    return response;
}

// Start the server on a given port
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
