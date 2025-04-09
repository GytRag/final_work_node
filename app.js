

const express = require('express');
const app = express();
const cors = require('cors');
const mainRouter = require('./router/routes');
const mongoose = require("mongoose");
require("dotenv").config();
const path = require('path');

const sockets = require('./modules/sockets')
sockets.listen(3011);

mongoose
    .connect(process.env.MONGO_KEY)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.error(err);
    })

app.use(cors({
    origin: '*', //'http://thecode.lt'
    credentials: true
}));
app.use(express.json());

// app.use('/api/crud/', mainRouter)
app.use('/crud/', mainRouter)

// Serve React App - CRUD (Frontend)
app.use('/crud', express.static(path.join(__dirname, 'crud/build')));
app.get('/crud/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'crud/build', 'index.html'));
});

app.listen(3022);
console.log('Server started on port 3022');




