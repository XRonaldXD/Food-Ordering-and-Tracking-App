// Database configuration
const config = {
    development: {
        port: process.env.PORT || 3000,
        database: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            name: process.env.DB_NAME || 'book_review_dev'
        }
    },
    production: {
        port: process.env.PORT || 8080,
        database: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            name: process.env.DB_NAME
        }
    }
};

module.exports = config[process.env.NODE_ENV || 'development'];