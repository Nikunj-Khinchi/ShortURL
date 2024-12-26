const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
    longUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true },
    customAlias: { type: String, unique: true },
    topic: String,
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    clickData: [
        {
            timestamp: { type: Date, default: Date.now },
            userAgent: String,
            ip: String,
            os: String,
            device: String,
            location: String,
        },
    ],
}, { timestamps: true });

const URL = mongoose.model("URL", urlSchema);
module.exports = URL;
