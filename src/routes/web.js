import express from "express";
import HomeController from "../controllers/HomeController";
let router = express.Router();
let initwebRoutes = (app) => {
    router.get("/", HomeController.getHomePage);

    router.post('/setup-profile', HomeController.setupProfile);

    router.post('/webhook', HomeController.postWebhook);
    router.get('/webhook', HomeController.getWebhook)
    return app.use('/', router);
}

module.exports = initwebRoutes;