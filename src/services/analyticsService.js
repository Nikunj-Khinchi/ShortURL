const URL = require("../models/urlModel");
const geoip = require("geoip-lite");
const logger = require("../utils/logger");

const getClicksByDate = (clickData) => {
    return clickData.reduce((acc, click) => {
        const date = click.timestamp.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
};

const getAnalyticsByField = (clickData, field) => {
    const analytics = clickData.reduce((acc, click) => {
        const value = click[field] || "Unknown"; // Fallback to "Unknown" if the field is missing
        if (!acc[value]) {
            acc[value] = { uniqueClicks: 0, uniqueUsers: new Set() };
        }
        acc[value].uniqueClicks += 1;
        acc[value].uniqueUsers.add(click.ip);
        return acc;
    }, {});

    return Object.entries(analytics).map(([key, data]) => ({
        [field]: key,
        uniqueClicks: data.uniqueClicks,
        uniqueUsers: data.uniqueUsers.size,
    }));
};

// const getGeolocationAnalytics = (clickData) => {
//     const locationAnalytics = {};
//     clickData.forEach((click) => {
//         const geo = geoip.lookup(click.ip);
//         const location = geo ? `${geo.city}, ${geo.country}` : "Unknown";
//         locationAnalytics[location] = locationAnalytics[location] || { uniqueClicks: 0, uniqueUsers: new Set() };
//         locationAnalytics[location].uniqueClicks += 1;
//         locationAnalytics[location].uniqueUsers.add(click.ip);
//     });

//     return Object.entries(locationAnalytics).map(([location, data]) => ({
//         location,
//         uniqueClicks: data.uniqueClicks,
//         uniqueUsers: data.uniqueUsers.size,
//     }));
// };


const getUrlAnalytics = async (alias) => {
    const url = await URL.findOne({ $or: [{ shortUrl: alias }, { customAlias: alias }] });
    if (!url) throw new Error("URL not found");

    const totalClicks = url.clickData.length;
    const uniqueClicks = new Set(url.clickData.map((click) => click.ip)).size;
    const clicksByDate = getClicksByDate(url.clickData);

    // Generate analytics for OS and Device
    const osType = getAnalyticsByField(url.clickData, "os");
    const deviceType = getAnalyticsByField(url.clickData, "device");
    // const locationAnalytics = getGeolocationAnalytics(url.clickData);

    return { totalClicks, uniqueClicks, clicksByDate, osType, deviceType };
};


const getTopicAnalytics = async (topic) => {

    try {
        const urls = await URL.find({ topic });

        if (!urls.length) {
            throw new Error("No URLs found for the specified topic");
        }

        let totalClicks = 0;
        let uniqueClicksSet = new Set();
        let clicksByDate = {};

        const urlAnalytics = urls.map((url) => {
            const urlTotalClicks = url.clickData.length;
            const urlUniqueClicks = new Set(url.clickData.map((click) => click.ip)).size;
            const urlClicksByDate = getClicksByDate(url.clickData);

            totalClicks += urlTotalClicks;
            url.clickData.forEach((click) => uniqueClicksSet.add(click.ip));

            // Merge clicksByDate
            Object.entries(urlClicksByDate).forEach(([date, count]) => {
                clicksByDate[date] = (clicksByDate[date] || 0) + count;
            });

            return {
                shortUrl: url.shortUrl,
                totalClicks: urlTotalClicks,
                uniqueClicks: urlUniqueClicks,
            };
        });

        const uniqueClicks = uniqueClicksSet.size;

        return {
            totalClicks,
            uniqueClicks,
            clicksByDate: Object.entries(clicksByDate).map(([date, count]) => ({ date, count })),
            urls: urlAnalytics,
        };
    } catch (error) {
        logger.error("Error retrieving topic analytics:", error);
        throw error;
    }
}


const getOverallAnalytics = async (userId) => {
    try {
        const urls = await URL.find({ userId });

        if (!urls.length) {
            throw new Error("No URLs found for the specified user");
        }

        let totalUrls = urls.length;
        let totalClicks = 0;
        let uniqueClicksSet = new Set();
        let clicksByDate = {};
        let osType = {};
        let deviceType = {};

        const urlAnalytics = urls.map((url) => {
            totalClicks += url.clickData.length;
            url.clickData.forEach((click) => {
                uniqueClicksSet.add(click.ip);

                // Aggregate clicks by date
                const date = click.timestamp.toISOString().split("T")[0];
                clicksByDate[date] = (clicksByDate[date] || 0) + 1;

                // Aggregate OS type
                const os = click.os || "Unknown";
                if (!osType[os]) {
                    osType[os] = { uniqueClicks: 0, uniqueUsers: new Set() };
                }
                osType[os].uniqueClicks += 1;
                osType[os].uniqueUsers.add(click.ip);

                // Aggregate device type
                const device = click.device || "Unknown";
                if (!deviceType[device]) {
                    deviceType[device] = { uniqueClicks: 0, uniqueUsers: new Set() };
                }
                deviceType[device].uniqueClicks += 1;
                deviceType[device].uniqueUsers.add(click.ip);
            });

            return {
                shortUrl: url.shortUrl,
                longUrl: url.longUrl,
                totalClicks: url.clickData.length,
                uniqueClicks: new Set(url.clickData.map((click) => click.ip)).size,
            };
        });

        const uniqueClicks = uniqueClicksSet.size;

        return {
            totalUrls,
            totalClicks,
            uniqueClicks,
            clicksByDate: Object.entries(clicksByDate).map(([date, count]) => ({ date, count })),
            osType: Object.entries(osType).map(([osName, data]) => ({
                osName,
                uniqueClicks: data.uniqueClicks,
                uniqueUsers: data.uniqueUsers.size,
            })),
            deviceType: Object.entries(deviceType).map(([deviceName, data]) => ({
                deviceName,
                uniqueClicks: data.uniqueClicks,
                uniqueUsers: data.uniqueUsers.size,
            })),
            urls: urlAnalytics,
        };
    } catch (error) {
        logger.error("Error retrieving overall analytics:", error);
        throw error;
    }
};


module.exports = { 
    getUrlAnalytics,
    getTopicAnalytics,
    getOverallAnalytics
};