const forbiddenPatterns = [
    /rm\s+-rf\s+\//,
    /import\s+os.*system/,
    /system\s*\(/
];

function isSafeCode(code) {
    return !forbiddenPatterns.some((pattern) => {
        pattern.test(code);
    });
}

module.exports = {isSafeCode};