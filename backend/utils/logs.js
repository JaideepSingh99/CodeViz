const fs = require('fs');
const path = require('path');

/**
 * Logs code execution details to a file.
 * @param {Object} logData - Data to log.
 * @param {string} logData.language - The programming language.
 * @param {string} logData.code - The executed code.
 * @param {string} logData.output - The output or error message.
 * @param {string} logData.timestamp - The timestamp of execution.
 */
function logExecution(logData) {
    const logFilePath = path.join(__dirname, "../logs/execution.log");

    // Format log entry
    const logEntry = `[${logData.timestamp}] Language: ${logData.language}\nCode:\n${logData.code}\nOutput:\n${logData.output}\n---\n`;

    // Ensure the logs directory exists
    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }

    // Append log entry to file
    fs.appendFileSync(logFilePath, logEntry, "utf8");
}

module.exports = { logExecution };
