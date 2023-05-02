const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    operatorsAliases: 0,
    pool: {
        max: parseInt(process.env.MAX),
        min: parseInt(process.env.MIN),
        acquire: parseInt(process.env.ACQUIRE),
        idle: parseInt(process.env.IDLE)
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Info = require("../models/infoModel")(sequelize, Sequelize);
db.Product = require("../models/productModel")(sequelize, Sequelize);
db.Order = require("../models/orderModel")(sequelize, Sequelize);

db.Product.hasMany(db.Order, {
    foreignKey: 'productId',
    as: 'orders',
});

db.Info.hasMany(db.Order, {
    foreignKey: 'userId',
    as: 'orders',
});

//To get userDetails while listing orders
db.Order.belongsTo(db.Info, {
    foreignKey: 'userId',
    as: 'info',
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('database connected successfully');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

module.exports = db;