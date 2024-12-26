const rateLimit = require("express-rate-limit");
const WriteResponse = require("../utils/response");

// Rate limiter for URL creation
const createUrlLimiter = rateLimit({
    windowMs: process.env.WINDOW_SIZE_IN_MIN,
    max: process.env.URL_CREATION_LIMIT, 
    handler: (req, res) => {
        return WriteResponse(res, 429, "Too many URL creation requests from this IP, please try again after 15 minutes");
    }
});

// Rate limiter for analytics endpoints
const analyticsLimiter = rateLimit({
    windowMs: process.env.WINDOW_SIZE_IN_MIN,
    max: process.env.ANALYTICS_LIMIT,
    handler: (req, res) => {
        return WriteResponse(res, 429, "Too many analytics requests from this IP, please try again after 15 minutes");
    }
});

module.exports = { createUrlLimiter, analyticsLimiter };