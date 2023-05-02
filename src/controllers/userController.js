const userService = require('../services/userService');
const status = require('../validation/status');
const messages = require('../validation/message');
const { logger } = require('../winston/logger');
const { mailService } = require('../middleware/auth');
const db = require("../models/index");
const Info = db.Info;
const Product = db.Product;
 
class UserController { }

UserController.prototype.create = async function (req, res) {
    try {
        const { name, email, password, role } = req.body;
        const { user, error } = await userService.create(name, email, password, role);

        if (error) {
            return res.status(status.badRequest).json({ success: status.false, error: error });
        }

        logger.info(messages.registeredSuccess, { user });
        res.status(status.success).json({ success: status.true, data: user });

    } catch (error) {
        logger.error(messages.registeredFailed, { error });
        return res.status(status.internalServerError).json({ status: status.false, error: messages.internalServerError });
    }
};

UserController.prototype.login = async function (req, res) {
    try {
        const { email, password } = req.body;
        const { user, error } = await userService.login(email, password);

        if (error) {
            return res.status(status.badRequest).json({ success: status.false, error: error });
        }

        logger.info(messages.loginSuccess, { user });
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: user.token
        };
        res.status(status.success).json({ success: status.true, data: userData });

    } catch (error) {
        logger.error(messages.loginFailed, { error });
        return res.status(status.internalServerError).json({ status: status.false, error: messages.internalServerError });
    }
};

UserController.prototype.uploadProducts = async function (req, res) {
    try {
        const { uploadProducts, error } = await userService.uploadProducts(req.files.file);
        if (error) {
            return res.status(status.badRequest).json({ status: status.false, error: error });
        }
        logger.info(messages.uploadSuccess, { uploadProducts });
        res.status(status.success).json({ status: status.true, data: uploadProducts });

    } catch (error) {
        console.error(error);
        logger.info(messages.uploadFailed, { error });
        return res.status(status.internalServerError).json({ status: status.false, error: messages.internalServerError });
    }
};

UserController.prototype.editProduct = async function (req, res) {
    try {
        const { id } = req.params;
        const { productName, productDescription, productBrand, productColor, productQuantity, productPrice } = req.body;

        const { updateProduct, error } = await userService.editProduct(id, {
            productName,
            productDescription,
            productBrand,
            productColor,
            productQuantity,
            productPrice
        });

        if (error) {
            return res.status(status.badRequest).json({ status: status.false, error: error });
        }

        logger.info(messages.editProductSuccess, { updateProduct });

        const product = await Product.findByPk(updateProduct.id);
        if (!product) {
            return res.status(status.badRequest).json({ status: status.false, error: messages.notFound });
        }

        return res.status(status.created).json({ status: status.true, data: updateProduct });

    } catch (error) {
        logger.error(messages.notUpdated, { error });
        return res.status(status.internalServerError).json({ status: status.false, error: messages.internalServerError });
    }
};

UserController.prototype.getProducts = async function (req, res) {
    try {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const { id, productName, productBrand } = req.query;

        const result = await userService.getProducts(limit, page, id, productName, productBrand);

        if (!result || !result.products || result.products.length === 0) {
            return res.status(status.badRequest).json({ status: status.false, message: messages.notFound, data: [] });
        } else {
            const { products, totalItems, totalPages } = result;
            res.status(status.success).json({ status: status.true, totalItems, data: { products }, totalPages, currentPage: page });
        }

        logger.info(messages.listProducts, { products: result.products, totalItems: result.totalItems, currentPage: page, totalPages: result.totalPages });

    } catch (error) {
        console.error(error);
        logger.error(messages.notFetched, { error });
        return res.status(status.internalServerError).json({ status: status.false, error: messages.internalServerError });
    }
};

UserController.prototype.createOrder = async function (req, res) {
    try {
        const { productId, productQuantity } = req.body;

        if (!productId || !productQuantity) {
            return res.status(status.badRequest).json({ status: status.false, error: messages.fieldsRequired });
        }

        const { userOrder, error } = await userService.createOrder({
            productId,
            productQuantity,
            userId: req.user.id,
        });

        if (error) {
            return res.status(status.badRequest).json({ status: status.false, error: error });
        }

        logger.info(messages.orderCreated, { userOrder });

        // Fetch user email from database
        const userInfo = await Info.findByPk(req.user.id, { attributes: ['email'] });
        if (!userInfo) {
            return res.status(status.badRequest).json({ status: status.false, error: messages.notFound });
        }

        const userEmail = userInfo.email;

        // Fetch product details from database
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(status.badRequest).json({ status: status.false, error: messages.notFound });
        }
        const productName = product.productName;
        const productPrice = product.productPrice;

        // Create email attachment with order details
        const attachment = {
            filename: 'orderDetails.txt',
            content: `orderId:${userOrder.id}\nProduct: ${productName}\nQuantity: ${productQuantity}\nPrice: ${productPrice}\nTotal Cost: ${userOrder.totalCost}`
        };

        // Get current date and format it
        const date = new Date().toLocaleDateString();

        // Send confirmation email to user
        const html = `Hi ${req.user.name},<br><br>Your order was confirmed on ${date}.<br><br>order details are attached.`;

        await mailService(userEmail, 'Order Confirmed', html, attachment);

        res.status(status.success).json({ status: status.true, data: userOrder });

    } catch (error) {
        logger.error(messages.notPurchased, { error });
        return res.status(status.internalServerError).json({ status: status.false, error: messages.internalServerError });
    }
};

UserController.prototype.updateOrder = async function (req, res) {
    try {
        const { id } = req.params;
        const { productId, productQuantity } = req.body;

        const { updatedOrder, error } = await userService.updateOrder(id, {
            productId,
            productQuantity
        });

        if (error) {
            return res.status(status.badRequest).json({ status: status.false, error: error });
        }

        logger.info(messages.orderUpdated, { updatedOrder });

        // Fetch product details from database
        const product = await Product.findByPk(updatedOrder.productId);
        if (!product) {
            return res.status(status.badRequest).json({ status: status.false, error: messages.notFound });
        }

        // Update the order details
        const updatedCost = product.productPrice * updatedOrder.productQuantity;
        updatedOrder.totalCost = updatedCost;
        await updatedOrder.save();


        res.status(status.created).json({ status: status.true, data: updatedOrder });

    } catch (error) {
        logger.error(messages.notUpdated, { error });
        return res.status(status.internalServerError).json({ status: status.false, error: messages.internalServerError });
    }
};

UserController.prototype.getOrders = async function (req, res) {
    try {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const { id } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        const result = await userService.getOrders(limit, page, id, userId, userRole);

        if (!result || !result.orders || result.orders.length === 0) {
            return res.status(status.badRequest).json({ status: status.false, message: messages.notFound, data: [] });
        } else {
            const { orders, totalCount } = result;
            const totalPages = Math.ceil(totalCount / limit);
            res.status(status.success).json({ status: status.true, totalItems: totalCount, data: { orders }, currentPage: page, totalPages });
            logger.info(messages.listOrders, { orders: result.orders });
        }

    } catch (error) {
        console.error(error);
        logger.error(messages.notFetched, { error });
        return res.status(status.internalServerError).json({ status: status.false, error: messages.internalServerError });
    }
};

UserController.prototype.cancelOrder = async function (req, res) {
    try {
        const { id } = req.params;
        const { deletedOrder, error } = await userService.cancelOrder(id);

        if (error) {
            return res.status(status.badRequest).json({ status: status.false, error: error, data: null });
        }

        if (!deletedOrder) {
            return res.status(status.badRequest).json({ status: status.false, message: messages.notFound });
        }

        // Fetch user email from database
        const userInfo = await Info.findByPk(req.user.id, { attributes: ['email', 'name'] });
        if (!userInfo) {
            return res.status(status.badRequest).json({ status: status.false, error: messages.notFound });
        }

        const userEmail = userInfo.email;
        const userName = userInfo.name;

        // Get current date and format it
        const date = new Date().toLocaleDateString();

        // Create email options
        const emailContent = `Hi ${userName},<br><br>Your order with id ${id} has been cancelled on ${date}.`;

        await mailService(userEmail, 'Order Cancelled', emailContent);

        logger.info(messages.orderDeleted, { deletedOrder });
        return res.status(status.success).json({ status: status.true, message: { order: messages.orderDeleted, mail: messages.mailSent } });

    } catch (error) {
        console.error(error);
        logger.error(messages.notDeleted, { error });
        return res.status(status.internalServerError).json({ status: status.false, error: messages.internalServerError });
    }
};

module.exports = new UserController();