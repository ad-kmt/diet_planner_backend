
const swaggerJsDocs = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'FG4L API',
            version: "1.0.0",
            description: 'Fit Gut For Life API Information',
            contact: {
                name: "Hitesh Kumawat"
            },
            servers: ["http://localhost:8000"],
        },
    },
    apis: [`server.js`, `routes/api/*.js`, `swagger/*.yaml`]
};

const generateSwaggerDocs = () => {
    return swaggerJsDocs(swaggerOptions);
}

module.exports = generateSwaggerDocs;