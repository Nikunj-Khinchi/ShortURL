const shortid = require("shortid");
const URL = require("../models/urlModel");
const logger = require("../utils/logger");

const createShortUrl = async ({ longUrl, customAlias, topic, userId }) => {
    try {
        // Check if the provided customAlias is already in use
        if (customAlias) {
            const existingUrl = await URL.findOne({ customAlias });
            if (existingUrl) {
                throw new Error("Custom alias already in use. Please choose a different alias.");
            }
        }

        // Start with the provided customAlias or generate a new one
        let shortUrl = customAlias || shortid.generate();

        // Ensure generated alias is unique
        while (await URL.findOne({ shortUrl })) {
            shortUrl = shortid.generate(); // Generate a new alias if conflict exists
        }

        // Create and save the new URL document
        const newUrl = new URL({
            longUrl,
            shortUrl,
            customAlias: customAlias || shortUrl,
            topic,
            userId,
        });

        await newUrl.save();
        return newUrl;
    } catch (error) {
        logger.error("Error creating short URL:", error);
        throw error;
    }
};


const findUrlByAlias = async (alias) => {
    try {
        const url = await URL.findOne({
            $or: [{ shortUrl: alias }, { customAlias: alias }]
        });

        if (!url) {
            throw new Error("URL not found");
        }

        return url;
    } catch (error) {
        logger.error("Error finding URL by alias:", error);
        throw error;
    }
};

const logClick = async (urlId, clickData) => {
    try {
        const updatedUrl = await URL.findByIdAndUpdate(urlId, { $push: { clickData } }, { new: true });
        if (!updatedUrl) {
            throw new Error("URL not found for logging click");
        }
        return updatedUrl;
    } catch (error) {
        logger.error("Error logging click:", error);
        throw error;
    }
};

module.exports = { createShortUrl, findUrlByAlias, logClick };