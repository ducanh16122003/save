import request from "request";
import dotenv from "dotenv";
dotenv.config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Gửi tin nhắn đến người dùng
let callSendAPI = (sender_psid, response) => {
    let request_body = {
        "recipient": { "id": sender_psid },
        "message": response
    };

    request({
        uri: "https://graph.facebook.com/v21.0/me/messages",
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        headers: { "Content-Type": "application/json" },
        json: request_body
    }, (err, res, body) => {
        if (!err) {
            console.log("📩 Message sent successfully!");
        } else {
            console.error("❌ Unable to send message:", err);
        }
    });
};

// Lấy thông tin người dùng từ Facebook API
let getUserName = (sender_psid) => {
    return new Promise((resolve, reject) => {
        request({
            uri: `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name&access_token=${PAGE_ACCESS_TOKEN}`,
            method: "GET",
        }, (err, res, body) => {
            if (!err) {
                let user = JSON.parse(body);
                let userName = `${user.first_name} ${user.last_name}`;
                resolve(userName);
            } else {
                console.error("❌ Error fetching user name:", err);
                reject(err);
            }
        });
    });
};

// Xử lý khi nhấn nút "Bắt đầu"
let handleGetStarted = async (sender_psid) => {
    try {
        let userName = await getUserName(sender_psid);
        let response = { "text": `👋 Xin chào, ${userName}! Chào mừng đến với chatbot.` };
        await callSendAPI(sender_psid, response);
        return "done";
    } catch (e) {
        console.error("❌ Error in handleGetStarted:", e);
        throw e;
    }
};

export default { handleGetStarted, getUserName, callSendAPI };