//interactioMonitor.js
import { getSocket } from './SocketSingleton'; // Import the singleton socket instance

const socket = getSocket(); // Use the singleton socket instance

// Helper function to send interaction data to the backend
const sendInteractionData = (data) => {
    if (socket.connected) {
        socket.emit('user_interaction', data, (ack) => {
            console.log("Interaction data sent:", data); // Add this line for debugging
        });
    } else {
        console.warn('Socket connection not established.');
    }
};

// 1. Time Spent on Task (track time spent on a task element)
export const detectTimeSpentOnTask = (elementRef, threshold, callback, buttonType) => {
    if (!(elementRef.current instanceof HTMLElement)) {
        throw new Error('Invalid elementRef provided.');
    }
    if (!Number.isFinite(threshold) || threshold <= 0) {
        throw new Error('Threshold should be a positive number.');
    }
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }

    let startTime = 0;
    let timerId = null;

    const element = elementRef.current;

    element.addEventListener('mouseenter', () => {
        startTime = performance.now();
        timerId = setTimeout(() => {
            const timeSpent = performance.now() - startTime;
            const data = { type: 'time_on_task', timeSpent, button: buttonType };
            callback(data);
            sendInteractionData(data);

            // Apply highlight effect only to the hovered button
            element.classList.add('transform', 'scale-125', 'text-5xl');
        }, threshold);
    });

    element.addEventListener('mouseleave', () => {
        clearTimeout(timerId);
        startTime = 0;
        callback({ type: 'time_on_task', timeSpent: 0, button: buttonType });

        // Remove highlight effect when mouse leaves
        element.classList.remove('transform', 'scale-125', 'text-5xl');
    });
};

// Inactivity detection and socket interaction
export const detectInactivity = (timeout, callback) => {
    if (!Number.isFinite(timeout) || timeout <= 0) {
        throw new Error('Timeout should be a positive number.');
    }
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }

    let inactivityTimer;

    const resetTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            const data = { type: 'inactivity_detected' };
            callback(data);
            sendInteractionData(data);
        }, timeout);
    };

    ['mousemove', 'keydown', 'scroll'].forEach(event =>
        window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
        ['mousemove', 'keydown', 'scroll'].forEach(event =>
            window.removeEventListener(event, resetTimer)
        );
        clearTimeout(inactivityTimer);
    };
};

// 3. Back-and-Forth Navigation Detection
const navigationHistory = [];
const MAX_HISTORY = 6; // Keep track of the last 6 screens

export const trackNavigation = (currentScreen) => {
    navigationHistory.push(currentScreen);
    console.log('Navigation History:', navigationHistory); // Log navigation history

    // Keep history within limits
    if (navigationHistory.length > MAX_HISTORY) {
        navigationHistory.shift(); 
    }

    // Check for back-and-forth pattern
    if (detectBackAndForth(navigationHistory)) {
        console.log('Back-and-forth pattern detected'); // Log detection
        const data = { type: 'repetitive_navigation', history: [...navigationHistory] };
        sendInteractionData(data);
    }
};

const detectBackAndForth = (history) => {
    if (history.length < 4) return false; // We need at least 4 steps to detect a pattern

    const lastFour = history.slice(-4); // Get the last 4 navigation states

    // Check if it's an exact alternating pattern
    return (
        lastFour[0] === "ConfirmVote" &&
        lastFour[1] === "CandidateSelection" &&
        lastFour[2] === "ConfirmVote" &&
        lastFour[3] === "CandidateSelection"
    );
};

// Track repeated button clicks
export const detectRepeatedClicks = (elementRef, threshold, callback, buttonType) => {
    if (!(elementRef.current instanceof HTMLElement)) {
        throw new Error('Invalid elementRef provided.');
    }
    if (!Number.isFinite(threshold) || threshold <= 0) {
        throw new Error('Threshold should be a positive number.');
    }
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }

    let lastClickTime = 0;
    let clickCount = 0;

    const element = elementRef.current;

    element.addEventListener('click', () => {
        const currentTime = Date.now();
        if (currentTime - lastClickTime < threshold) {
            clickCount++;
        } else {
            clickCount = 1; // reset on first click after threshold
        }
        lastClickTime = currentTime;

        if (clickCount >= 3) {
            const data = { type: 'repeated_clicks', button: buttonType, clickCount };
            callback(data);
            sendInteractionData(data);
        }
    });
};


//other functions