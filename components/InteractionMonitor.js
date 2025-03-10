//interactioMonitor.js
import { getSocket } from './SocketSingleton'; // Import the singleton socket instance

const socket = getSocket(); // Use the singleton socket instance

// Helper function to send interaction data to the backend
const sendInteractionData = (data) => {
    if (socket.connected) {
        socket.emit('user_interaction', data, (ack) => {});
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
