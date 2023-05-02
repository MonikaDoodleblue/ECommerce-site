require('dotenv').config();
module.exports = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    db: process.env.DB_DATABASE,
    dialect: "mysql",
    pool: {
        max: parseInt(process.env.MAX),
        min: parseInt(process.env.MIN),
        acquire: parseInt(process.env.ACQUIRE),
        idle: parseInt(process.env.IDLE)
    }
};