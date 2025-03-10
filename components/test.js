// 2. Repeated Actions (track repeated clicks or interactions)
export const detectRepeatedActions = (element, actionThreshold, callback, resetInterval = 5000) => {
    if (!(element instanceof HTMLElement)) {
        throw new Error('Invalid element provided.');
    }
    if (!Number.isFinite(actionThreshold) || actionThreshold <= 0) {
        throw new Error('Action threshold should be a positive number.');
    }
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }

    let actionCount = 0;
    let resetTimeout;

    element.addEventListener('click', () => {
        actionCount++;
        if (resetTimeout) clearTimeout(resetTimeout);

        // Reset count after the specified interval
        resetTimeout = setTimeout(() => {
            actionCount = 0;
        }, resetInterval);

        if (actionCount > actionThreshold) {
            const data = { type: 'repeated_actions', count: actionCount };
            callback(data); // Execute callback
            sendInteractionData(data); // Send to backend
            actionCount = 0; // Reset after reporting
        }
    });
};

//3. Scroll Behavior (detect user struggles with scrolling)
export const detectScrollBehavior = (threshold, callback) => {
    if (!Number.isFinite(threshold) || threshold <= 0) {
        throw new Error('Threshold should be a positive number.');
    }
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }

    let lastScrollY = 0;
    let scrollCount = 0;
    let recentScrolls = [];
    const repeatScrollThreshold = 3; // Threshold for repeated scrolling to same location
    const erraticScrollCount = 3; // Number of erratic scrolls in a row to trigger callback
    const trackingInterval = 5000; // Time window for tracking scroll behavior (5 seconds)

    const analyzeScrolls = () => {
        const locations = recentScrolls.map(scroll => scroll.scrollY);
        const repeats = locations.filter((value, index, self) => self.indexOf(value) !== index);
        if (repeats.length >= repeatScrollThreshold) {
            const data = { type: 'repeated_scrolling', repeats };
            callback(data);
            sendInteractionData(data);
        }
        recentScrolls = []; // Reset tracked scrolls
    };

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const scrollDifference = Math.abs(currentScrollY - lastScrollY);

        // Detect erratic scrolling
        if (scrollDifference > threshold) {
            scrollCount++;
            if (scrollCount >= erraticScrollCount) {
                const data = { type: 'erratic_scrolling', scrollDifference };
                callback(data);
                sendInteractionData(data);
                scrollCount = 0; // Reset count
            }
        } else {
            scrollCount = 0; // Reset if scroll is smooth
        }

        // Track repeated scroll locations
        recentScrolls.push({ scrollY: currentScrollY, time: Date.now() });
        recentScrolls = recentScrolls.filter(scroll => Date.now() - scroll.time < trackingInterval);

        lastScrollY = currentScrollY;
    });

    // Periodically analyze scroll behavior
    setInterval(analyzeScrolls, trackingInterval);
};


// 4. Navigation Patterns (track user navigating back/forward on pages)
export const detectNavigationPatterns = (threshold, callback, resetInterval = 5000) => {
    if (!Number.isFinite(threshold) || threshold <= 0) {
        throw new Error('Threshold should be a positive number.');
    }
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }

    let navigationCount = 0;
    let resetTimeout;

    const handleNavigation = () => {
        navigationCount++;

        if (resetTimeout) clearTimeout(resetTimeout);

        // Reset the count after the specified interval
        resetTimeout = setTimeout(() => {
            navigationCount = 0;
        }, resetInterval);

        if (navigationCount > threshold) {
            const data = { type: 'navigation_patterns', count: navigationCount };
            callback(data); // Execute callback
            sendInteractionData(data); // Send to backend
            navigationCount = 0; // Reset after reporting
        }
    };

    // Monitor navigation events
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation); // Capture hash-based navigation
};


// 5. Mouse Movements (track erratic or unusual mouse movements)
export const detectMouseMovements = (threshold, callback) => {
    let lastX = 0;
    let lastY = 0;
    let movementCount = 0;

    window.addEventListener('mousemove', (event) => {
        const deltaX = Math.abs(event.clientX - lastX);
        const deltaY = Math.abs(event.clientY - lastY);

        if (deltaX > threshold || deltaY > threshold) {
            movementCount++;
            if (movementCount > 10) { // If too many large movements in a short period
                const data = { type: 'mouse_movements', count: movementCount };
                callback(data);
                sendInteractionData(data); // Send to backend
                movementCount = 0; // Reset count
            }
        }

        lastX = event.clientX;
        lastY = event.clientY;
    });
};

// 6. Form Interactions (detect user struggle points)
export const detectFormInteractions = (formElement, callback) => {
    if (!(formElement instanceof HTMLFormElement)) {
        throw new Error('Provided element is not a valid form.');
    }
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }

    const fieldInteractions = {};

    // Track time spent on each field
    formElement.addEventListener('focusin', (event) => {
        const field = event.target;
        if (field.type !== 'submit') {
            fieldInteractions[field.name || field.id] = {
                startTime: Date.now(),
                value: field.value,
                switchCount: 0, // Track how many times a field is revisited
            };
        }
    });

    // Track time spent on a field and switching behavior
    formElement.addEventListener('focusout', (event) => {
        const field = event.target;
        if (field.type !== 'submit' && fieldInteractions[field.name || field.id]) {
            const { startTime, value, switchCount } = fieldInteractions[field.name || field.id];
            const timeSpent = Date.now() - startTime;

            // Check if the user is spending too long on the field
            if (timeSpent > 5000) { // Example: Long focus time threshold (e.g., 5 seconds)
                const data = {
                    type: 'form_struggle',
                    fieldName: field.name || field.id,
                    timeSpent,
                    switchCount,
                    struggleType: 'long_focus_time',
                };
                callback(data);
                sendInteractionData(data); // Send to backend
            }

            // Reset the field tracking after focusout
            delete fieldInteractions[field.name || field.id];
        }
    });

    // Detect field switching behavior
    formElement.addEventListener('focusin', (event) => {
        const field = event.target;
        if (field.type !== 'submit' && fieldInteractions[field.name || field.id]) {
            // If the field was already visited (switching between fields), increment the switch count
            fieldInteractions[field.name || field.id].switchCount++;
        }
    });

    // Detect form abandonment: if user doesn't submit the form after starting to interact with it
    formElement.addEventListener('submit', (event) => {
        const incompleteFields = Array.from(formElement.elements).filter(
            (field) => !field.value && field.type !== 'submit'
        );

        // If there are incomplete fields or if the user didn't submit after a long time, flag as struggle
        if (incompleteFields.length > 0) {
            const data = {
                type: 'form_abandonment',
                incompleteFields,
                struggleType: 'abandoned_form',
            };
            callback(data);
            sendInteractionData(data); // Send to backend
        }
    });
};


// 7. Track Inactivity
export const detectInactivity = (threshold = 300000, callback) => {
    if (!Number.isFinite(threshold) || threshold <= 0) {
        throw new Error('Threshold should be a positive number.');
    }
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }

    let inactivityTimer;

    const resetInactivityTimer = () => {
        // Clear the previous timer and start a new one
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            const data = { type: 'inactivity', message: 'User has been inactive for too long' };
            callback(data); // Execute callback
            sendInteractionData(data); // Send to backend
        }, threshold); // Time threshold for inactivity (e.g., 5 minutes)
    };

    // Listen to user activities to reset the inactivity timer
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
    activityEvents.forEach(event => {
        window.addEventListener(event, resetInactivityTimer);
    });

    // Initialize the inactivity timer
    resetInactivityTimer();
};