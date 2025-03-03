import request from "request";
require('dotenv').config();

const page_access_token = process.env.PAGE_ACCESS_TOKEN;

async function callSendAPI(sender_psid, response) {
    let request_body = {
        recipient: { id: sender_psid },
        message: response
    };

    console.log("📡 Gửi request đến Facebook API:", request_body);

    try {
        let res = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${page_access_token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request_body)
        });

        let resData = await res.json();
        console.log("📩 Kết quả từ Facebook API:", resData);
        return resData;
    } catch (error) {
        console.error("🚨 Lỗi khi gửi tin nhắn:", error);
    }
}


    async function handleGetStarted(sender_psid) {
        console.log("📩 Bắt đầu gửi tin nhắn đến:", sender_psid);
    
        let response = {
            text: "Chào mừng bạn đến với chatbot!"
        };
    
        try {
            let res = await callSendAPI(sender_psid, response);
            console.log("✅ Phản hồi từ API Facebook:", res);
        } catch (error) {
            console.error("❌ Lỗi khi gửi tin nhắn:", error);
        }
    }
    

module.exports = {
    handleGetStarted: handleGetStarted,
}