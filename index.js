const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const { PORT } = config;
const { qrRoute, pairRoute } = require("./routes");
const { init, isConfigured, getSession } = require("./luka/sessionStore");
const app = express();
app.set("json spaces", 2);

// CORS: allow the Vercel static frontend to call the Railway API.
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

require("events").EventEmitter.defaultMaxListeners = 2000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/pair", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "pair.html"), { dotfiles: "allow" }, (err) => {
        if (err) res.status(500).send("Error serving page: " + err.message);
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"), { dotfiles: "allow" }, (err) => {
        if (err) res.status(500).send("Error serving page: " + err.message);
    });
});

app.get("/qr", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "qr.html"), { dotfiles: "allow" }, (err) => {
        if (err) res.status(500).send("Error serving page: " + err.message);
    });
});
app.use("/qr", qrRoute);
app.use("/code", pairRoute);

app.get("/session/:id", async (req, res) => {
    if (!isConfigured()) {
        return res.status(503).send("No database configured on this server.");
    }
    try {
        const session = await getSession(req.params.id);
        if (!session) {
            return res.status(404).send("Session not found.");
        }
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.send(session);
    } catch (e) {
        res.status(500).send("Error retrieving session.");
    }
});

app.get("/health", (req, res) => {
    res.json({
        status: 200,
        success: true,
        service: "LUKA-AI Pair",
        storage: isConfigured() ? "database" : "inline-zlib",
        timestamp: new Date().toISOString(),
    });
});

async function startServer() {
    await init(config);
    app.listen(PORT, () => {
        console.log(`\nLUKA-AI Pair Server running on port ${PORT}`);
    });
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error('Server startup failed:', error);
        process.exit(1);
    });
}

module.exports = app;
