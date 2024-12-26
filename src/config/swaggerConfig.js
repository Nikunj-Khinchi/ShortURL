const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'URL Shortener API',
            version: '1.0.0',
            description: 'API documentation for the URL Shortener service',
        },
        servers: [
            {
                url: process.env.BASE_URL,
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "Authorization",
                    description: "Enter your API key",
                },
            },
        },
        security: [
            {
                ApiKeyAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.js", "./src/controllers/*.js"], // Adjust paths as necessary
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;