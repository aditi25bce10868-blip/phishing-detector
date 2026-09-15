// Listen for requests from popup.js
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {

        // Find all forms on the webpage
        const forms = document.querySelectorAll("form");


        // Count suspicious form destinations
        let suspiciousForm = false;


        forms.forEach(function (form) {

            const action = form.action;

            if (action) {

                const actionUrl = action.toLowerCase();

                // Basic prototype check
                if (
                    actionUrl.includes("login") ||
                    actionUrl.includes("verify") ||
                    actionUrl.includes("password") ||
                    actionUrl.includes("account")
                ) {
                    suspiciousForm = true;
                }
            }
        });


        // Collect webpage features
        const features = {

            // Current URL
            url: window.location.href,

            // HTTPS or HTTP
            https: window.location.protocol === "https:",

            // Domain
            domain: window.location.hostname,

            // Number of forms
            forms: document.forms.length,

            // Number of password fields
            passwordFields:
                document.querySelectorAll(
                    'input[type="password"]'
                ).length,

            // Number of links
            links:
                document.querySelectorAll("a").length,

            // Number of iframes
            iframes:
                document.querySelectorAll("iframe").length,

            // Suspicious form
            suspiciousForm: suspiciousForm
        };


        // Send features back to popup.js
        sendResponse(features);
    }
);