const logger = require("../utils/logger");
const WriteResponse = require("../utils/response");
const admin = require("firebase-admin");

// Middleware to verify Firebase ID Token
const authentication = async (req, res, next) => {
    try {
        const idToken = req.header('Authorization');

        if (!idToken) {
            logger.error("Authorization token is required");
            return WriteResponse(res, 401, "Authorization token is required");
        }

        // Verify token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        logger.error("Error during authentication:", error);
        return WriteResponse(res, 401, "Authentication failed", error.message);
    }
};


module.exports = authentication;