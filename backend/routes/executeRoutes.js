const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { isSafeCode } = require("../utils/validateCode");
const ExecutionLog = require("../models/ExecutionLog");
const { logExecution } = require("../utils/logs");

const router = express.Router();
const TEMP_DIR = path.join(__dirname, "../temp");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

router.post("/execute", async (req, res) => {
    try {
        const { userId, code, language } = req.body;
        if (!code || !language) {
            return res.status(400).json({ message: "Code and Language are required" });
        }

        if (!isSafeCode(code)) {
            return res.status(400).json({ message: "Unsafe code detected!" });
        }

        let filename, dockerfile, containerName;

        switch (language) {
            case "python":
                filename = "temp.py";
                dockerfile = "dockerfiles/Dockerfile.python";
                containerName = "python-runner";
                break;
            case "javascript":
                filename = "temp.js";
                dockerfile = "dockerfiles/Dockerfile.node";
                containerName = "node-runner";
                break;
            case "cpp":
                filename = "temp.cpp";
                dockerfile = "dockerfiles/Dockerfile.cpp";
                containerName = "cpp-runner";
                break;
            default:
                return res.status(400).json({ message: "Unsupported language" });
        }

        const filePath = path.join(TEMP_DIR, filename);
        fs.writeFileSync(filePath, code);

        const execOptions = {
            timeout: 5000, // 5 seconds timeout
            maxBuffer: 1024 * 1024 // Limit output to 1MB
        };

        // Execute user code inside Docker
        const runCmd = `docker run --rm -v "${filePath}:/app/${filename}" ${containerName}`;

        const process = exec(runCmd, execOptions, async (error, stdout, stderr) => {
            const output = error ? stderr || error.message : stdout;

            // Save execution log
            await ExecutionLog.create({ userId, language, code, output });

            // Log execution
            logExecution({ language, code, output, timestamp: new Date().toISOString() });

            if (error) {
                return res.status(400).json({ message: "Execution error", error: output });
            }

            res.json({ output });
        });

        process.on("exit", (code) => {
            if (code === null) {
                res.status(400).json({ message: "Execution timed out!" });
            }
        });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
});

module.exports = router;
