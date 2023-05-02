module.exports = (sequelize, Sequelize) => {

    const Product = sequelize.define('product', {
        productName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        productDescription: {
            type: Sequelize.STRING,
            allowNull: false
        },
        productBrand: {
            type: Sequelize.STRING,
            allowNull: false
        },
        productColor: {
            type: Sequelize.STRING,
            allowNull: false
        },
        productQuantity: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        productPrice: {
            type: Sequelize.FLOAT,
            allowNull: false
        }
    });

    return Product;
};