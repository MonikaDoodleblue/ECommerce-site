const assignRoutes = (app) => {
    app.use('/app', require('./commonRoutes'));
}

module.exports = assignRoutes;