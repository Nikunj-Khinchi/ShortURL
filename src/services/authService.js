const admin = require("firebase-admin");
const User = require("../models/userModel");
const logger = require("../utils/logger");


// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle newlines in private key
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
    }),
});

const verifyToken = async (idToken) => {

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        let user = await User.findOne({ uid });
        if (!user) {
            user = new User({ uid, email, name, picture });
            await user.save();
        }

        return user;
    } catch (error) {
        logger.error("Error during authentication:", error);
        throw new Error("Authentication failed");
    }
};

module.exports = { verifyToken };
