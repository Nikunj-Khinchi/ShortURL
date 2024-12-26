const express = require("express");
const { googleAuth } = require("../controller/authController");
const router = express.Router();
const authentication = require("../middleware/authMiddleware");
const { createShortUrlHandler, redirectShortUrlHandler } = require("../controller/urlController");
const { getUrlAnalyticsHandler, getTopicAnalyticsHandler, getOverallAnalyticsController } = require("../controller/analyticsController");
const { createUrlLimiter, analyticsLimiter } = require("../middleware/rateLimiter");

/**
 * @swagger
 * /api/google-auth:
 *   post:
 *     summary: Google authentication
 *     description: Ensure before using this you added your token into the Authorize button.  Use this endpoint to verify your token.
 *     responses:
 *       200:
 *         description: Successful authentication
 */
router.post("/google-auth", googleAuth);

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Create a short URL
 *     description: |
 *       Ensure before using this you added your token into the `Authorize` button. |
 *       Use this endpoint to create a short URL from a long URL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longUrl:
 *                 type: string
 *                 description: The original long URL
 *               topic:
 *                 type: string
 *                 description: The topic or category of the URL
 *               customAlias:
 *                 type: string
 *                 description: Custom alias for the short URL (optional)
 *     responses:
 *       201:
 *         description: Short URL created successfully
 */
router.post("/shorten", createUrlLimiter, authentication, createShortUrlHandler);

/**
 * @swagger
 * /api/shorten/{alias}:
 *   get:
 *     summary: Redirect to the original URL
 *     description: Redirects a short alias to its original URL.
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to the original URL
 */
router.get("/shorten/:alias", redirectShortUrlHandler);

/**
 * @swagger
 * /api/analytics/overall:
 *   get:
 *     summary: Get overall analytics
 *     description: Shows the analytics of all the generated short links. Ensure you are authorized before accessing this.
 *     responses:
 *       200:
 *         description: Overall analytics retrieved successfully
 */
router.get("/analytics/overall", analyticsLimiter, authentication, getOverallAnalyticsController);

/**
 * @swagger
 * /api/analytics/{alias}:
 *   get:
 *     summary: Get URL analytics
 *     description: Provides analytics for a specific short URL alias. Ensure you are authorized before accessing this.
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL analytics retrieved successfully
 */
router.get("/analytics/:alias", analyticsLimiter, authentication, getUrlAnalyticsHandler);

/**
 * @swagger
 * /api/analytics/topic/{topic}:
 *   get:
 *     summary: Get topic analytics
 *     description: Provides analytics for all short URLs categorized under a specific topic. Ensure you are authorized before accessing this.
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic analytics retrieved successfully
 */
router.get("/analytics/topic/:topic", analyticsLimiter, authentication, getTopicAnalyticsHandler);

module.exports = router;
