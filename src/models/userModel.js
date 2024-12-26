const mongoose = require("mongoose");

// User Schema and Model
const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: String,
    picture: String,
}, { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;