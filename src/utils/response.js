const WriteResponse = (res, statusCode, message = null, data = null) => {
    if (statusCode === 200 || statusCode === 201) {
        return res.status(statusCode).json({
            statusCode: statusCode,
            message: message ? message : "Success.",
            data: data,
        });
    } else if (statusCode === 404) {
        return res.status(statusCode).json({
            statusCode: statusCode,
            message: message ? message : "Data Not Found",
            data: null
        });
    } else {
        return res.status(statusCode).json({
            statusCode: statusCode,
            message: message ? message : "An error occurred.",
            data: null,
        });
    }
};

module.exports = WriteResponse;