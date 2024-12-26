const { getUrlAnalytics, getTopicAnalytics, getOverallAnalytics } = require("../services/analyticsService");
const logger = require("../utils/logger");
const WriteResponse = require("../utils/response");

const getUrlAnalyticsHandler = async (req, res) => {
    const { alias } = req.params;

    try {
        const analytics = await getUrlAnalytics(alias);
        return WriteResponse(res, 200, "Analytics retrieved successfully", analytics);
    } catch (error) {
        logger.error("Error retrieving analytics:", error);
        return WriteResponse(res, 500, "Error retrieving analytics", error.message);
    }
};

const getTopicAnalyticsHandler = async(req,res) =>{
    const {topic } = req.params;

    try{
        const analytics = await getTopicAnalytics(topic);
        return WriteResponse(res, 200, "Analytics retrieved successfully", analytics);
    } catch(error){
        if(error.message === "No URLs found for the specified topic"){
            return WriteResponse(res, 404, "No URLs found for the specified topic");
        }
        logger.error("Error retrieving analytics:", error);
        return WriteResponse(res, 500, "Error retrieving analytics", error.message);
    }
}

const getOverallAnalyticsController = async (req, res) => {
    try {
        const userId = req.user.uid; // Assuming user ID is available in req.user
        const analytics = await getOverallAnalytics(userId);
        res.json(analytics);
    } catch (error) {
        console.error("Error retrieving overall analytics:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = { 
    getUrlAnalyticsHandler,
    getTopicAnalyticsHandler,
    getOverallAnalyticsController
};
