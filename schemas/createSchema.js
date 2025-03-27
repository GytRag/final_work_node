const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const createSchema = new Schema({
    image: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    name : {
        type: String,
        required: true
    },
    user_id : {
        type: String,
        required: true
    },
    comments : [],
    timestamp : {
        type: Number,
        required: true
    },



});

const post = mongoose.model("posts", createSchema);

module.exports = post;