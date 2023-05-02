const router = require('express').Router();
const { create, login, uploadProducts, editProduct, getProducts, createOrder, updateOrder, cancelOrder, getOrders } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { joiRegister, joiLogin, joiQuery, joiBody } = require('../validation/joi')

router
    .post('/register', joiRegister, create)

    .post('/login', joiLogin, login)

    .post('/uploadProducts', authenticate(['ADMIN']), uploadProducts)

    .put('/editProduct/:id', authenticate(['ADMIN']), joiBody, editProduct)

    .get('/listProducts', authenticate(['ADMIN', 'USER']), joiQuery, getProducts)

    .post('/createOrder', authenticate(['USER']), joiBody, createOrder)

    .put('/updateOrder/:id', authenticate(['USER']), joiBody, updateOrder)

    .delete('/cancelOrder/:id', authenticate(['USER']), joiQuery, cancelOrder)

    .get('/listOrders', authenticate(['ADMIN', 'USER']), joiQuery, getOrders);

module.exports = router;