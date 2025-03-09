const express = require('express');
const passport = require('passport');

const router = express.Router();

// Google OAuth Login
router.get("/google", passport.authenticate("google", {scope: ["profile", "email"]}));

// Callback Route
router.get(
    "/google/callback",
    passport.authenticate("google", {failureRedirect: "/"}),
    (req, res) => {
        res.redirect("/")
    }
);

// Logout
router.get("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

// Get Current User
router.get("/me", (req, res) => {
    if (!req.user) {
        return res.status(401).json({message: "Unauthorized"});
    }
    res.json(req.user);
});

module.exports = router;