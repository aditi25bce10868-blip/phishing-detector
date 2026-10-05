const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/check-url", (req, res) => {

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            error: "URL is required"
        });
    }

    let riskScore = 0;

    // HTTPS check
    if (!url.startsWith("https://")) {
        riskScore += 20;
    }

    // Suspicious words
    const suspiciousWords = [
        "login",
        "verify",
        "account",
        "secure",
        "update",
        "password"
    ];

    suspiciousWords.forEach(word => {
        if (url.toLowerCase().includes(word)) {
            riskScore += 10;
        }
    });

    // Maximum 100
    if (riskScore > 100) {
        riskScore = 100;
    }

    let result;

    if (riskScore >= 70) {
        result = "HIGH RISK";
    } else if (riskScore >= 40) {
        result = "MEDIUM RISK";
    } else {
        result = "LOW RISK";
    }

    res.json({
        riskScore: riskScore,
        result: result
    });
});

app.listen(5000, () => {
    console.log("Phishing Guard backend running on http://localhost:5000");
});
