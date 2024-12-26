require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const redisClient = require("./config/redis");
const urlRoutes = require("./routes/route");
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');
const http = require("http");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
// server image files
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.get("/api/healthcheck", async (req, res) => {
    try {
        const redisStatus = await redisClient.ping(); // Check Redis connection
        res.json({
            status: "200",
            message: "Server is up and running",
            redis: redisStatus === "PONG" ? "Connected" : "Not Connected",
        });
    } catch (error) {
        res.status(500).json({ message: "Redis check failed", error: error.message });
    }
});

// Render the index page with Firebase config
app.get("/", (req, res) => {
    res.render("index", {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        baseUrl: process.env.BASE_URL,
    });
});

app.use("/api", urlRoutes);
// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});

const httpServer = http.createServer(app);
module.exports = { app , httpServer}


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, async () => {
//     connectDB();
//     logger.info(`Server running on port ${PORT}`);
// });
