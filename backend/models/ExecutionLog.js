const mongoose = require("mongoose");

const executionLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    output: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ExecutionLog", executionLogSchema);
