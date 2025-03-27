const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    userOne: {
        type: String,
        required: true
    },
    userOne_id: {
        type: String,
        required: true
    },
    userOne_image: {
        type: String,
        required: true
    },
    userTwo: {
        type: String,
        required: true
    },
    userTwo_id: {
        type: String,
        required: true
    },
    userTwo_image: {
        type: String,
        required: true
    },
    messages: []
});

const message = mongoose.model("messages", messageSchema);

module.exports = message;