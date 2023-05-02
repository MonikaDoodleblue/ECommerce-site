const express = require('express');
const app = express();
require('./src/config/db')
const { logger } = require('./src/winston/logger');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const db = require("./src/models");

db.sequelize.sync({ force: false }).then(() => {
    console.log('Drop and Resync Db');
});

const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT;

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use((req, res, next) => {
    logger.defaultMeta.path = `${req.method} ${req.path}`;
    next();
});

const routes = require('./src/routes/index')
routes(app)

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});