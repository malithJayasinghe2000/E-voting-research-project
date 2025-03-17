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
        console.log("Received user interaction data:", data); // Log interaction data

        // Store interaction data (optional)
        if (!userInteractionLogs[socket.id]) {
            userInteractionLogs[socket.id] = [];
        }
        userInteractionLogs[socket.id].push(data);

        // Analyze the interaction data and send appropriate help if needed
        const response = analyzeUserInteraction(data);
        console.log("Analyzed response:", response); // Log the response

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

    if (data.type === 'inactivity_detected') {
        response = {
            issueDetected: true,
            suggestion: 'You seem inactive. Do you need help choosing a language?',
            startGuide: true,  // This will trigger the Joyride guide in the frontend
            
        };
    }

    if (data.type === 'repetitive_navigation') {
        response = {
            issueDetected: true,
            suggestion: "You seem to be switching screens repeatedly. Do you need assistance?",
            startGuide: true, // Trigger frontend guide/help message
            navigation:true
        };
    }

    if (data.type === 'repeated_clicks') {
        response = {
            issueDetected: true,
            suggestion: "You have clicked the button repeatedly. Is there an issue you're encountering?",
            startGuide: true, // Trigger frontend guide/help message
            repeatedClicks: true
            
        };
    }

    console.log("Analyzed response:", response); // Add this line for debugging
    return response;
}

// Start the server on a given port
const PORT = 4000;
server.listen(PORT, () => {
    console.log('Server is running on port ${PORT}');
});