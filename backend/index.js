const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')

require('dotenv').config();
const app = express();
const port = 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true, origin: "http://localhost:5173"}));

mongoose.connect(process.env.MONGO_URI);


// Routes
app.use("/api/auth", require("./routes/authRoutes"));


app.get('/', (req, res) => {
    res.json("Server is Runnig");
})

app.listen(port, () => {
    console.log(`Server is running at ${port} port.`);
})