const createProxyMiddleware = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            //target: process.env.REACT_APP_BACKEND_URL,
            target: "http://220.149.231.241:5001",
            changeOrigin: true,
        })
    );
};