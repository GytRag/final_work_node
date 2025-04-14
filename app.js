

const express = require('express');
const app = express();
const cors = require('cors');
const mainRouter = require('./router/routes');
const mongoose = require("mongoose");
require("dotenv").config();

const sockets = require('./modules/sockets')
sockets.listen(4011);

mongoose
    .connect(process.env.MONGO_KEY)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.error(err);
    })

app.use(cors({
    origin:'*', //'https://thecode.lt'
    credentials: true
}));
app.use(express.json());

// app.use('/api', mainRouter)
app.use('/', mainRouter)

app.listen(4021);
console.log('Server started on port 4021');




