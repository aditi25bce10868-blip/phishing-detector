chrome.tabs.query(
    { active: true, currentWindow: true },
    function (tabs) {
        if (!tabs || tabs.length === 0) {
            return;
        }

        const tab = tabs[0];

        document.getElementById("website").textContent =
            tab.url || "Unknown";

        chrome.tabs.sendMessage(
            tab.id,
            {},
            function (response) {
                if (chrome.runtime.lastError) {
                    console.log(
                        "Content script unavailable:",
                        chrome.runtime.lastError.message
                    );
                    return;
                }

                if (!response) {
                    return;
                }

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

                const m3 = response.m3 || {};
                const behavior = m3.behavior || {};
                const dynamic = m3.dynamic || {};
                const forms = m3.forms || [];

                let riskScore = 0;

                if (!response.https) {
                    riskScore += 30;
                }

                if (response.passwordFields > 0) {
                    riskScore += 10;
                }

                if (response.suspiciousForm) {
                    riskScore += 30;
                }

                if (behavior.crossOriginSubmission) {
                    riskScore += 15;
                }

                if (dynamic.dynamicFormDetected) {
                    riskScore += 10;
                }

                if (dynamic.dynamicPasswordFieldDetected) {
                    riskScore += 10;
                }

                if (behavior.passwordFieldInteracted) {
                    riskScore += 5;
                }

                if (
                    behavior.formSubmitted &&
                    behavior.crossOriginSubmission
                ) {
                    riskScore += 10;
                }

                if (forms.some((form) => form.crossOrigin)) {
                    riskScore += 10;
                }

                riskScore = Math.min(riskScore, 100);

                document.getElementById("riskScore").textContent =
                    riskScore + "/100";

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
                } else if (riskScore <= 60) {
                    riskLevel.textContent = "MEDIUM RISK";
                    statusIcon.textContent = "🟡";
                    riskMessage.textContent =
                        "Some suspicious characteristics detected.";
                    warning.style.display = "block";
                } else {
                    riskLevel.textContent = "HIGH RISK";
                    statusIcon.textContent = "🔴";
                    riskMessage.textContent =
                        "Multiple suspicious characteristics detected.";
                    warning.style.display = "block";
                }

                console.log("M3 DOM features:", m3.dom);
                console.log(
                    "M3 behavior features:",
                    behavior
                );
                console.log(
                    "M3 dynamic features:",
                    dynamic
                );
            }
        );
    }
);
