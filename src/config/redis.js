const Redis = require("ioredis");
const logger = require("../utils/logger");

// Initialize Redis client
const redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
});

redisClient.on("connect", () => logger.info("Connected to Redis"));
redisClient.on("error", (err) => logger.error("Redis connection error:", err));

module.exports = redisClient;
