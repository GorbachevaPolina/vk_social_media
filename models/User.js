const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        min: 3,
        max: 20
    }, 
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    profilePicture: {
        type: String,
        default: ""
    },
    friends: {
        type: Array,
        default: []
    },
    friends_req: {
        type: Array,
        default: []
    },
    friends_pending: {
        type: Array,
        default: []
    },
    age: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    university: {
        type: String,
        default: ""
    }
},
{
    timestamps: true
})

module.exports = mongoose.model("User", UserSchema)