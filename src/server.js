require("dotenv").config();

const { httpServer } = require("./app");
const logger = require("./utils/logger");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    connectDB();
    logger.info(`Server running on port ${PORT}`);
});
