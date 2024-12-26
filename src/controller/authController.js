const logger = require("../utils/logger");
const WriteResponse = require("../utils/response");
const User = require("../models/userModel");
const { verifyToken } = require("../services/authService");


const googleAuth = async (req, res) => {
    // const { idToken } = req.body;
    const idToken = req.header('Authorization');
    
    if (!idToken) return WriteResponse(res, 401, "Authorization token is required");
    try {
        const user = await verifyToken(idToken);
        logger.info(`User authenticated: ${user}`);
        return WriteResponse(res, 200, "User authenticated", user);
    } catch (error) {
        logger.error("Error during authentication:", error);
        return WriteResponse(res, 401, "Authentication failed", error.message);
    }
};

module.exports = { googleAuth };
