const LOG_DEBUG = true;

/**
 * Creates a console logging function with log level highlighting.
 * 
 * @param {"log" | "error" | "warn" | "info" | "debug"} logLevel 
 *  Log levels available on the `console` object.
 * @param {boolean} enabled 
 *  Turn console output on or off. Best used with environment variables.
 * @returns {(...args: any[]) => void}
 * @author Benjamin P.C. Hovinga
 * @license MIT
 */
function createLogger(logLevel = "log", enabled = true) {
    // Define console colors for each log level
    const colors = {
        "log": "\x1b[30m", // BLACK
        "error": "\x1b[31m", // RED
        "warn": "\x1b[33m", // YELLOW
        "info": "\x1b[36m", // CYAN
        "debug": "\x1b[35m", // MAGENTA
    };
    const reset = "\x1b[0m";  // RESET COLOR

    // Validate logLevel
    if (!colors.hasOwnProperty(logLevel))
        throw TypeError(`${logLevel} is not a valid logLevel.`);

    // Build prefix string
    const prefix = `${colors[logLevel]}[${logLevel.toUpperCase()}]${reset}`;

    // Return logger function
    return function (...args) {
        if (enabled) console[logLevel](prefix, ...args);
    }
}

// Create console loggers
const debug = createLogger("debug", LOG_DEBUG);
const info = createLogger("info");
const error = createLogger("error");


function preloadImage(url) {
    return new Promise((resolve, reject) => {
        info("Preloading the image.")
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}


async function displayPersona(user) {
    debug("user:", user);

    // Assign selected user data to persona details
    const personaDetails = {
        photo: user?.picture?.large,
        name: `${user?.name?.first} ${user?.name?.last}`,
        age: user?.dob?.age,
        gender: user?.gender,
        city: user?.location?.city,
        state: user?.location?.state,
        country: user?.location?.country,
    };
    debug("personaDetails:", personaDetails);

    // Update the persona elements
    for(const key in personaDetails) {
        const element = document.getElementById(`persona-${key}`);
        if (element) {
            debug(`element[${key}]`, element);
            if (element.tagName === 'IMG') element.src = personaDetails[key];
            else element.innerText = personaDetails[key];
        };
    }

    // Wait for the browser to load the photo before opening the modal
    await preloadImage(personaDetails.photo);

    // Open the persona-modal
    const modal = document.getElementById('persona-modal');
    modal.setAttribute('open', true);
    info("Persona modal was opened.");

    // Close the persona-modal when button clicked
    modal.querySelector('button[rel="prev"]').addEventListener('click', (event) => {
        const dialog = event.target.closest('dialog');
        dialog.removeAttribute('open');
        info("User closed persona modal.");
    });
}

// Generate button was clicked
document.getElementById("submit-btn").addEventListener('click', (event) => {
    info("User clicked Generate button.");
    event.preventDefault();
    const button = event.target;
    
    // Lock out button
    const backupText = button.innerText;
    button.setAttribute('disabled', true);
    button.innerText = "Please wait...";
    button.ariaBusy = true;

    // Start building the request URL
    const requestURL = new URL("https://randomuser.me/api/1.4/");
    requestURL.searchParams.set("results", "1");

    // Parse the gender field
    const gender = document.querySelector('input[name="gender"]:checked').value;
    if (gender !== "any") requestURL.searchParams.set("gender", gender);
    debug("gender:", gender);

    // Parse the nationality field
    const nationality = document.querySelector('select[name="nationality"]')?.value;
    if (nationality !== "any") requestURL.searchParams.set("nat", nationality);
    debug("nationality: ", nationality);

    // Make the request to the API
    info("Making a request to the API.");
    debug("requestURL:", requestURL);
    fetch(requestURL)
        .then((response) => {
            debug("response:", response);
            // Check if the response was ok
            if (!response.ok) throw new Error("HTTP status: " + response.status);
            info("The API request was successful.");
            return response.json();
        })
        .then((json) => {
            debug("json:", json);
            // Perform basic data validation on the json object
            if (json.hasOwnProperty('error')) throw new Error("API Error: " + json.error);
            if (!json.hasOwnProperty('results')) throw new Error("Received malformed response from API.");
            return displayPersona(json.results[0]);
        })
        .catch((err) => {
            error(err);
        })
        .finally(() => {
            // Unlock the button
            button.removeAttribute('disabled');
            button.innerText = backupText;
            button.ariaBusy = false;
        });
});
