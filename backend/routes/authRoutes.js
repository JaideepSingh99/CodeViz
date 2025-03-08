const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({ name, email, password: hashedPassword });

        res.status(200).json({ message: "User Registered successfully" });
    } catch (e) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, { httpOnly: true }).json({ message: "Login Successful" });
    } catch (e) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Logout Route
router.post('/logout', async (req, res) => {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) }).json({ message: "Logged out" });
});

// Get Current User
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password");

        res.json(user);
    } catch (e) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
