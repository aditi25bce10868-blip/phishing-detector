// Get the currently active browser tab
chrome.tabs.query(
    { active: true, currentWindow: true },
    function (tabs) {

        // Make sure a tab exists
        if (!tabs || tabs.length === 0) {
            return;
        }

        const tab = tabs[0];

        // Display the current URL
        document.getElementById("website").textContent =
            tab.url || "Unknown";


        // Ask content.js for webpage information
        chrome.tabs.sendMessage(
            tab.id,
            {},
            function (response) {

                // Content script may not work on Chrome internal pages
                if (chrome.runtime.lastError) {

                    console.log(
                        "Content script unavailable:",
                        chrome.runtime.lastError.message
                    );

                    return;
                }


                // No response
                if (!response) {
                    return;
                }


                // -----------------------------
                // DISPLAY WEBPAGE FEATURES
                // -----------------------------

                document.getElementById("https").textContent =
                    response.https ? "✓" : "✗";

                document.getElementById("forms").textContent =
                    response.forms;

                document.getElementById("passwords").textContent =
                    response.passwordFields;

                document.getElementById("links").textContent =
                    response.links;

                document.getElementById("iframes").textContent =
                    response.iframes;


                // -----------------------------
                // CALCULATE PROTOTYPE RISK SCORE
                // -----------------------------

                let riskScore = 0;


                // Rule 1: HTTP instead of HTTPS
                if (!response.https) {
                    riskScore += 30;
                }


                // Rule 2: Password field
                if (response.passwordFields > 0) {
                    riskScore += 10;
                }


                // Rule 3: Suspicious URL
                const url = response.url.toLowerCase();

                if (
                    url.includes("login") ||
                    url.includes("verify") ||
                    url.includes("secure") ||
                    url.includes("account") ||
                    url.includes("update")
                ) {
                    riskScore += 30;
                }


                // Rule 4: Suspicious form destination
                if (response.suspiciousForm) {
                    riskScore += 30;
                }


                // Maximum score = 100
                if (riskScore > 100) {
                    riskScore = 100;
                }


                // Display score
                document.getElementById("riskScore").textContent =
                    riskScore + "/100";


                // -----------------------------
                // CLASSIFY RISK
                // -----------------------------

                const riskLevel =
                    document.getElementById("riskLevel");

                const riskMessage =
                    document.getElementById("riskMessage");

                const statusIcon =
                    document.getElementById("statusIcon");

                const warning =
                    document.getElementById("warning");


                if (riskScore <= 30) {

                    riskLevel.textContent = "LOW RISK";
                    statusIcon.textContent = "🟢";

                    riskMessage.textContent =
                        "No major suspicious signals detected.";

                    warning.style.display = "none";

                }

                else if (riskScore <= 60) {

                    riskLevel.textContent = "MEDIUM RISK";
                    statusIcon.textContent = "🟡";

                    riskMessage.textContent =
                        "Some suspicious characteristics detected.";

                    warning.style.display = "block";

                }

                else {

                    riskLevel.textContent = "HIGH RISK";
                    statusIcon.textContent = "🔴";

                    riskMessage.textContent =
                        "Multiple suspicious characteristics detected.";

                    warning.style.display = "block";
                }

            }
        );
    }
);