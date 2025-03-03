import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./configs/viewEngine.js";
import webRoutes from "./routes/web";

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
//config view Engine
viewEngine(app);

//config view routes
webRoutes(app);

let port = process.env.PORT || 8080;

app.listen(port,() => {
    console.log("App is running at the port: " + port);
})

app.post("/webhook", async (req, res) => {
    try {
        let body = req.body;
        console.log("📩 Webhook nhận dữ liệu:", JSON.stringify(body, null, 2));

        if (body.object === "page") {
            body.entry.forEach(async function (entry) {
                let webhook_event = entry.messaging[0];

                if (webhook_event.postback && webhook_event.postback.payload === "GET_STARTED") {
                    let sender_psid = webhook_event.sender.id;
                    console.log("📩 Nhận được GET_STARTED từ PSID:", sender_psid);
                    
                    await chatbotService.handleGetStarted(sender_psid);
                }
            });

            res.status(200).send("EVENT_RECEIVED");
        }
    } catch (error) {
        console.error("🚨 Lỗi trong webhook:", error);
    }
});
