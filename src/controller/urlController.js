const UAParser = require("ua-parser-js");
const { createShortUrl, findUrlByAlias, logClick } = require("../services/urlService");
const logger = require("../utils/logger");
const WriteResponse = require("../utils/response");
const redisClient = require("../config/redis");

const createShortUrlHandler = async (req, res) => {
    const { longUrl, customAlias, topic } = req.body;
    const userId = req.user.uid;

    try {
        const newUrl = await createShortUrl({ longUrl, customAlias, topic, userId });

        const response = {
            shortUrl: `${process.env.BASE_URL}/api/shorten/${newUrl.shortUrl}`,
            createdAt: newUrl.createdAt
        }

        const cacheObject = {
            shortUrl: `${process.env.BASE_URL}/api/shorten/${newUrl.shortUrl}`,
            longUrl: newUrl.longUrl,
            urlId: newUrl._id,
        }

        // Cache the short URL in Redis
        const cacheKey = `shortUrl:${newUrl.shortUrl}`;
        await redisClient.set(cacheKey, JSON.stringify(cacheObject), "EX", 60 * 60 * 24); // Cache for 24 hours

        return WriteResponse(res, 201, "Short URL created successfully", response);
    } catch (error) {
        if (error.message.includes("Custom alias already in use")) {
            return WriteResponse(res, 409, error.message); // Conflict error
        }
        return WriteResponse(res, 500, "Error creating short URL", error.message);
    }
};

const redirectShortUrlHandler = async (req, res) => {
    const { alias } = req.params;

    try {
        // Check if the URL exists in Redis
        const cacheKey = `shortUrl:${alias}`;
        const cachedData = await redisClient.get(cacheKey);

        let longUrl;
        let urlId;

        if (cachedData) {
            logger.info(`Cache hit for alias: ${alias}`);
            const parsedData = JSON.parse(cachedData);
            longUrl = parsedData.longUrl;
            urlId = parsedData.urlId;
        } else {
            // Cache miss: Query the database
            const url = await findUrlByAlias(alias);
            if (!url) return WriteResponse(res, 404, "Short URL not found");

            longUrl = url.longUrl;
            urlId = url._id;

            // Cache the long URL along with its database ID
            const urlData = {
                shortUrl: `${process.env.BASE_URL}/api/shorten/${url.shortUrl}`,
                longUrl: url.longUrl,
                urlId: url._id,
            };
            await redisClient.set(cacheKey, JSON.stringify(urlData), "EX", 60 * 60 * 24); // Cache for 24 hours
        }

        // Extract information from the User-Agent
        const parser = new UAParser(req.headers["user-agent"]);
        const os = parser.getOS().name || "Unknown"; // OS name
        const device = parser.getDevice().type || "desktop"; // Device type ('mobile', 'tablet', 'desktop', etc.)

        // Extract the client's IP address
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Prepare click data
        const clickData = {
            userAgent: req.headers["user-agent"],
            ip,
            os,
            device,
        };

        // Log the click data
        await logClick(urlId, clickData);

        // Redirect to the long URL
        res.redirect(longUrl);
        logger.info(`Redirected to: ${longUrl}`);
    } catch (error) {
        logger.error("Error during redirection:", error);
        return WriteResponse(res, 500, "Error during redirection", error.message);
    }
};

module.exports = { createShortUrlHandler, redirectShortUrlHandler };