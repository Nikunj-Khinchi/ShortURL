const rateLimit = require("express-rate-limit");
const WriteResponse = require("../utils/response");

// Custom key generator to use user ID for rate limiting
const keyGenerator = (req) => {
    return req.user ? req.user.uid : req.ip;
};

// Rate limiter for URL creation
const createUrlLimiter = rateLimit({
    windowMs: process.env.WINDOW_SIZE_IN_MIN,
    max: process.env.URL_CREATION_LIMIT,
    keyGenerator: keyGenerator,
    handler: (req, res) => {
        return WriteResponse(res, 429, "Too many URL creation requests from this user, please try again after 15 minutes");
    }
});

// Rate limiter for analytics endpoints
const analyticsLimiter = rateLimit({
    windowMs: process.env.WINDOW_SIZE_IN_MIN,
    max: process.env.ANALYTICS_LIMIT,
    keyGenerator: keyGenerator,
    handler: (req, res) => {
        return WriteResponse(res, 429, "Too many analytics requests from this user, please try again after 15 minutes");
    }
});

module.exports = { createUrlLimiter, analyticsLimiter };