const express = require('express');
const ensureAuth = require('../middlewares/authMiddleware');
const CodeSnippet = require('../models/Code');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * @route POST /api/code/save
 * @desc Save a new code snippet
 * @access Private
 */
router.post('/save', ensureAuth, async (req, res) => {
    try {
        const { code, language } = req.body;
        const userId = req.user._id; 

        if (!code || !language) {
            return res.status(400).json({message: "Code and language are required"});
        }

        const newSnippet = await CodeSnippet.create({ userId, code, language });

        res.status(201).json({ message: "Code saved successfully", snippet: newSnippet });
    } catch (e) {
        console.error("Error saving code:", e);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @route GET /api/code/user
 * @desc Get all snippets of the logged-in user
 * @access Private
 */
router.get('/user', ensureAuth, async (req, res) => {
    try {
        const snippets = await CodeSnippet.find({ userId: req.user._id });
        res.json(snippets);
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @route PUT /api/code/update/:id
 * @desc Update a user's code snippet
 * @access Private
 */
router.put('/update/:id', ensureAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({message: "Invalid code ID"});
        }

        const snippet = await CodeSnippet.findById(id);
        if (!snippet || snippet.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized or Snippet not found" });
        }
        
        const { code, language } = req.body;
        snippet.code = code;
        snippet.language = language;
        await snippet.save();

        res.json({ message: "Snippet updated successfully", snippet });
    } catch (e) {
        console.error("Error updating snippet:", e);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @route DELETE /api/code/delete/:id
 * @desc Delete a user's code snippet
 * @access Private
 */
router.delete('/delete/:id', ensureAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid code ID" });
        }

        const snippet = await CodeSnippet.findById(id);
        if (!snippet) {
            return res.status(404).json({ message: "Snippet not found" });
        }

        if (snippet.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await snippet.deleteOne();
        res.json({ message: "Snippet deleted successfully" });
    } catch (e) {
        console.error("Error deleting snippet:", e);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
