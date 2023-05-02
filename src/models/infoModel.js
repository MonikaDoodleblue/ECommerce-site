module.exports = (sequelize, DataTypes) => {

    const Info = sequelize.define('info', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('ADMIN', 'USER'),
            allowNull: false,
            defaultValue: 'USER'
        },
    });

    return Info;
};  