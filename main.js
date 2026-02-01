const DEBUG = true;

/**
 * Helper function to output debug messages to the console.
 * @param  {...any} args 
 * @returns {void}
 */
function debug(...args) {
    if (DEBUG) console.debug("[DEBUG]", ...args);
}


function showPersona(user) {
    debug("user:", user);

    const personaDetails = {
        name: `${user?.name?.first} ${user?.name?.last}`,
        age: user?.dob?.age,
        gender: user?.gender,
        state: user?.location?.state,
        country: user?.location?.country
    };

    debug("personaDetails:", personaDetails);

    // Update the persona elements
    for(const key in personaDetails) {
        document.getElementById(`persona-${key}`).innerText = personaDetails[key];
    }
    document.getElementById('persona-photo').src = user?.picture?.large;

    // Open the persona-modal
    const modal = document.getElementById('persona-modal');
    modal.setAttribute('open', true);

    // Close the persona-modal when button clicked
    modal.querySelector('button[rel="prev"]').addEventListener('click', (ev) =>{
        const dialog = ev.target.closest('dialog');
        dialog.removeAttribute('open');
    });
}

// Generate button was clicked
document.getElementById("submit-btn").addEventListener('click', async (ev) => {
    ev.preventDefault();
    const button = ev.target
    
    // Lock out button
    const backupText = button.innerText
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

    debug("requestURL:", requestURL);

    try {
        // Fetch the data from the API
        const response = await fetch(requestURL);

        debug("response:", response);

        // Basic response validation
        if (!response.ok) throw new Error("HTTP status: " + response.status);

        // Convert it to JSON
        const data = await response.json();
        debug("data:", data);

        // Basic data validation
        if (data.hasOwnProperty('error')) throw new Error("API Error: " + data.error);
        if (!data.hasOwnProperty('results')) throw new Error("Received malformed response from API.");

        // Display the persona on screen
        showPersona(data.results[0]);
    } catch (error) {
        console.error('There was an error when attempting to fetch from the api.', error);
    } finally {
        // Unlock the button
        button.removeAttribute('disabled');
        button.innerText = backupText;
        button.ariaBusy = false;
    }
});
