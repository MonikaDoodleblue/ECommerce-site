module.exports = (sequelize, DataTypes) => {

    const Order = sequelize.define('order', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        totalCost: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });

    Order.associate = (models) => {
        Order.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product',
        });
        Order.belongsTo(models.Info, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return Order;
};