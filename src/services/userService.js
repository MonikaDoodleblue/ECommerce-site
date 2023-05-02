const bcrypt = require('bcrypt');
const moment = require('moment-timezone');
const xlsx = require('xlsx');
const { generateToken } = require('../middleware/auth');
const messages = require('../validation/message');
const Op = require('sequelize').Op;
const db = require("../models/index");
const Info = db.Info;
const Product = db.Product;
const Order = db.Order;

class UserService { }

UserService.prototype.create = async function (name, email, password, role) {
    try {
        const existingUser = await Info.findOne({ where: { email } });
        if (existingUser) {
            return { error: messages.exists };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Info.create({ name, email, password: hashedPassword, role });
        return { user };

    }
    catch (error) {
        return { error };
    }
};

UserService.prototype.login = async function (email, password) {
    try {
        const user = await Info.findOne({ where: { email } });
        if (!user) {
            return { error: messages.email };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { error: messages.password };
        }

        const token = generateToken(user);
        user.token = token.token;
        return { user };

    } catch (error) {
        return { error };
    }
};

UserService.prototype.uploadProducts = async function (file) {
    try {
        if (!file) {
            return { error: messages.noFile };
        }

        const workbook = xlsx.read(file.data, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        const products = data.map(row => ({
            productName: row.productName,
            productDescription: row.productDescription,
            productBrand: row.productBrand,
            productColor: row.productColor,
            productQuantity: row.productQuantity,
            productPrice: row.productPrice
        }));

        const uploadProducts = await Product.bulkCreate(products)
        return { uploadProducts };

    } catch (error) {
        return { error };
    }
};

UserService.prototype.editProduct = async function (id, updatedProduct) {
    try {
        const updatedRows = await Product.update(updatedProduct, {
            where: { id: id }
        });

        if (updatedRows[0] === 0) {
            return { error: messages.productId };
        }

        const updateProduct = await Product.findOne({
            where: { id: id }
        });

        if (!updateProduct) {
            return { error: messages.productId };
        }

        return { updateProduct };

    } catch (error) {
        return { error };
    }
};

UserService.prototype.getProducts = async function (limit, page, id, productName, productBrand) {
    try {
        let offset = 0;
        if (limit && page) {
            offset = (page - 1) * limit;
        }

        let where = {};
        if (id) {
            where.id = id;
        }
        if (productName) {
            where.productName = { [Op.like]: `%${productName}%` };
        }
        if (productBrand) {
            where.productBrand = { [Op.like]: `%${productBrand}%` };
        }

        const productCount = await Product.count({ where });
        const totalPages = Math.ceil(productCount / limit);

        const products = await Product.findAll({
            where,
            limit,
            offset
        });

        return {
            products,
            totalItems: productCount,
            currentPage: page,
            totalPages: totalPages
        };

    } catch (error) {
        return { error };
    }
};

UserService.prototype.createOrder = async function (order) {
    try {
        const product = await Product.findByPk(order.productId);

        if (!product) {
            return { error: messages.notFound };
        }
        if (order.productQuantity > product.productQuantity) {
            return { error: messages.insufficient };
        }

        const userOrder = await Order.create({
            productId: order.productId,
            userId: order.userId,
            orderDate: moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),
            productQuantity: order.productQuantity,
            productPrice: product.productPrice,
            totalCost: product.productPrice * order.productQuantity,
        });

        return { product, userOrder };
    } catch (error) {
        return { error };
    }
};

UserService.prototype.updateOrder = async function (id, updatedOrder) {
    try {
        const updatedRows = await Order.update(updatedOrder, {
            where: { id: id }
        });

        if (updatedRows[0] === 0) {
            return { error: messages.productId };
        }

        const updatedOrderData = await Order.findOne({
            where: { id: id }
        });

        if (!updatedOrderData) {
            return { error: messages.productId };
        }
        return { updatedOrder: updatedOrderData };

    } catch (error) {
        return { error };
    }
};

UserService.prototype.getOrders = async function (limit, page, id, userId, userRole) {
    try {
        let offset = 0;
        if (limit && page) {
            offset = (page - 1) * limit;
        }

        let where = {};
        if (id) {
            where.id = id;
        }
        if (userRole === 'ADMIN') {
            // For ADMIN, retrieve all users orders
        } else {
            // For USER, retrieve orders for the authenticated user
            where.userId = userId;
        }

        const { count, rows: orders } = await Order.findAndCountAll({
            where,
            limit,
            offset,
            include: {
                model: Info,
                as: 'info',
                attributes: ['name', 'email']
            }
        });

        return { orders, totalCount: count };

    } catch (error) {
        return { error };
    }
};

UserService.prototype.cancelOrder = async function (id) {
    try {
        const deletedOrder = await Order.destroy({ where: { id } });

        if (deletedOrder === 0) {
            return { error: messages.notFound };
        }
        return { deletedOrder };

    } catch (error) {
        return { error };
    }
};

module.exports = new UserService();