const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
require('./config/passport');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Session Middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({mongoUrl: process.env.MONGO_URI}),
        cookie: {secure: false}
    })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', require('./routes/authRoutes'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log(`MongoDB connected`))
.catch((e) => console.error(e));

// Default Route
app.get("/", (req, res) => {
    res.json({message: "Server is running"});
});

app.listen(port, () => console.log(`Server running on port ${port}`));