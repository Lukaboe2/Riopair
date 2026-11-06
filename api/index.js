const app = require("../index");
const config = require("../config");
const { init } = require("../luka/sessionStore");

let initPromise;

module.exports = async function handler(req, res) {
    try {
        if (!initPromise) initPromise = init(config);
        await initPromise;
        return app(req, res);
    } catch (error) {
        console.error("Vercel function startup error:", error);
        return res.status(500).json({
            success: false,
            message: "Pair service failed to initialize. Check Vercel Function Logs."
        });
    }
};
