const behavioralFeatures = {
    passwordFieldInteracted: false,
    usernameEmailFieldInteracted: false,
    formSubmitted: false,
    crossOriginSubmission: false,
    dynamicFormDetected: false,
    dynamicPasswordFieldDetected: false,
    dynamicLoginElementDetected: false,
    mutationCount: 0
};

const domFeatures = {
    formCount: 0,
    passwordFieldCount: 0,
    emailFieldCount: 0,
    hiddenFieldCount: 0,
    iframeCount: 0,
    scriptCount: 0,
    linkCount: 0
};

function analyzeDOM() {
    const forms = document.querySelectorAll("form");
    const passwordFields = document.querySelectorAll(
        'input[type="password"]'
    );
    const emailFields = document.querySelectorAll(
        'input[type="email"]'
    );
    const hiddenFields = document.querySelectorAll(
        'input[type="hidden"]'
    );
    const iframes = document.querySelectorAll("iframe");
    const scripts = document.querySelectorAll("script");
    const links = document.querySelectorAll("a");

    domFeatures.formCount = forms.length;
    domFeatures.passwordFieldCount = passwordFields.length;
    domFeatures.emailFieldCount = emailFields.length;
    domFeatures.hiddenFieldCount = hiddenFields.length;
    domFeatures.iframeCount = iframes.length;
    domFeatures.scriptCount = scripts.length;
    domFeatures.linkCount = links.length;

    return {
        ...domFeatures
    };
}

function analyzeForms() {
    const forms = document.querySelectorAll("form");
    const formDetails = [];

    forms.forEach((form, index) => {
        const action = form.action || window.location.href;
        const currentOrigin = window.location.origin;

        let formOrigin = currentOrigin;
        let crossOrigin = false;

        try {
            formOrigin = new URL(
                action,
                window.location.href
            ).origin;

            crossOrigin = currentOrigin !== formOrigin;
        } catch (error) {
            formOrigin = null;
        }

        formDetails.push({
            index: index + 1,
            method: form.method,
            action: action,
            currentOrigin: currentOrigin,
            formOrigin: formOrigin,
            crossOrigin: crossOrigin
        });

        if (crossOrigin) {
            behavioralFeatures.crossOriginSubmission = true;
        }
    });

    return formDetails;
}

function detectSuspiciousForms() {
    const forms = document.querySelectorAll("form");
    let suspiciousForm = false;

    forms.forEach((form) => {
        const action = (form.action || "").toLowerCase();

        if (
            action.includes("login") ||
            action.includes("verify") ||
            action.includes("password") ||
            action.includes("account")
        ) {
            suspiciousForm = true;
        }
    });

    return suspiciousForm;
}

function getAllFeatures() {
    const dom = analyzeDOM();
    const forms = analyzeForms();

    return {
        dom: {
            ...dom
        },
        forms: forms,
        behavior: {
            ...behavioralFeatures
        },
        dynamic: {
            dynamicFormDetected:
                behavioralFeatures.dynamicFormDetected,
            dynamicPasswordFieldDetected:
                behavioralFeatures.dynamicPasswordFieldDetected,
            dynamicLoginElementDetected:
                behavioralFeatures.dynamicLoginElementDetected,
            mutationCount:
                behavioralFeatures.mutationCount
        }
    };
}

document.addEventListener("focusin", (event) => {
    const element = event.target;

    if (
        element instanceof HTMLInputElement &&
        element.type === "password"
    ) {
        behavioralFeatures.passwordFieldInteracted = true;
    }
});

document.addEventListener("focusin", (event) => {
    const element = event.target;

    if (!(element instanceof HTMLInputElement)) {
        return;
    }

    const name = (element.name || "").toLowerCase();
    const id = (element.id || "").toLowerCase();

    if (
        element.type === "email" ||
        name.includes("user") ||
        name.includes("login") ||
        id.includes("user") ||
        id.includes("login")
    ) {
        behavioralFeatures.usernameEmailFieldInteracted = true;
    }
});

document.addEventListener("submit", (event) => {
    const form = event.target;

    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    behavioralFeatures.formSubmitted = true;

    try {
        const currentOrigin = window.location.origin;
        const formOrigin = new URL(
            form.action || window.location.href,
            window.location.href
        ).origin;

        if (currentOrigin !== formOrigin) {
            behavioralFeatures.crossOriginSubmission = true;
        }
    } catch (error) {
        behavioralFeatures.crossOriginSubmission = false;
    }
});

function startMutationMonitoring() {
    if (!document.body) {
        return;
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            behavioralFeatures.mutationCount++;

            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    return;
                }

                const element = node;

                if (
                    element.matches &&
                    element.matches("form")
                ) {
                    behavioralFeatures.dynamicFormDetected = true;
                }

                if (
                    element.matches &&
                    element.matches('input[type="password"]')
                ) {
                    behavioralFeatures.dynamicPasswordFieldDetected = true;
                }

                if (
                    element.querySelector &&
                    element.querySelector("form")
                ) {
                    behavioralFeatures.dynamicFormDetected = true;
                }

                if (
                    element.querySelector &&
                    element.querySelector(
                        'input[type="password"]'
                    )
                ) {
                    behavioralFeatures.dynamicPasswordFieldDetected = true;
                }

                if (
                    element.matches &&
                    element.matches(
                        'button, input[type="submit"], a'
                    )
                ) {
                    const text = (
                        element.innerText ||
                        element.value ||
                        ""
                    ).toLowerCase();

                    if (
                        text.includes("login") ||
                        text.includes("sign in") ||
                        text.includes("signin") ||
                        text.includes("continue")
                    ) {
                        behavioralFeatures.dynamicLoginElementDetected = true;
                    }
                }

                if (element.querySelector) {
                    const loginElements =
                        element.querySelectorAll(
                            'button, input[type="submit"], a'
                        );

                    loginElements.forEach((loginElement) => {
                        const text = (
                            loginElement.innerText ||
                            loginElement.value ||
                            ""
                        ).toLowerCase();

                        if (
                            text.includes("login") ||
                            text.includes("sign in") ||
                            text.includes("signin") ||
                            text.includes("continue")
                        ) {
                            behavioralFeatures.dynamicLoginElementDetected = true;
                        }
                    });
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

if (document.body) {
    startMutationMonitoring();
}

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        const m3Features = getAllFeatures();

        const features = {
            url: window.location.href,
            https: window.location.protocol === "https:",
            domain: window.location.hostname,
            forms: document.forms.length,
            passwordFields:
                document.querySelectorAll(
                    'input[type="password"]'
                ).length,
            links:
                document.querySelectorAll("a").length,
            iframes:
                document.querySelectorAll("iframe").length,
            suspiciousForm: detectSuspiciousForms(),
            m3: m3Features
        };

        sendResponse(features);

        return true;
    }
);
