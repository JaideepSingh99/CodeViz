const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { exec } = require('child_process');
const WebSocket = require('ws');
const http = require('http')
require('dotenv').config();
require('./config/passport');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const wss = new WebSocket.Server({server});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({mongoUrl: process.env.MONGO_URI}),
        cookie: {
            secure: false,
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/code', require('./routes/codeRoutes'));
app.use('/api/code', require('./routes/executeRoutes'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log(`MongoDB connected`))
.catch((e) => console.error(e));

// WebSocket Connection
wss.on("connection", (ws) => {
    console.log("Client Connected");

    ws.on("message", (message) => {
        console.log("Recieved:", message);
    });

    ws.on("close", () => {
        console.log("Client Disconnected");
    });
});

// Function to build Docker images
const buildDockerImages = () => {
    const images = [
        {name: "python-runner", dockerfile: "dockerfiles/Dockerfile.python"},
        {name: "node-runner", dockerfile: "dockerfiles/Dockerfile.node"},
        {name: "cpp-runner", dockerfile: "dockerfiles/Dockerfile.cpp"}
    ];

    images.forEach(({name, dockerfile}) => {
        exec(`docker build -t ${name} -f ${dockerfile} .`, (error, stdout,stderr) => {
            if (error) {
                console.error(`Error building ${name}:`, stderr || error.message);
            } else {
                console.log(`${name} built successfully`);
            }
        });
    });
};

buildDockerImages();

// Default Route
app.get("/", (req, res) => {
    res.json({message: "Server is running"});
});

app.listen(port, () => console.log(`Server running on port ${port}`));