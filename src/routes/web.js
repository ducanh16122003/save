import express from "express";
import HomeController from "../controllers/HomeController";
let router = express.Router();
let initwebRoutes = (app) => {
    app.use((req, res, next) => {
        res.setHeader(
            "Content-Security-Policy",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
        );
        next();
    });
    
    router.get("/", HomeController.getHomePage);

    //setup get staret button & whitelisted domains
    router.post('/setup-profile', HomeController.setupProfile);
    
    //setup persistent menu
    router.post('/setup-persistent-menu', HomeController.setupPersistentMenu)

    router.post('/webhook', HomeController.postWebhook);
    router.get('/webhook', HomeController.getWebhook)

    router.get('/reserve-table/:senderId', HomeController.handleReserveTable);
    router.post('/reserve-table-ajax', HomeController.handlePostReserveTable);
    return app.use('/', router);
}

module.exports = initwebRoutes;