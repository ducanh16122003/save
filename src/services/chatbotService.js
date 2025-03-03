import request from "request"
require('dotenv').config();

const chatbotService = require("./chatbotService");

async function handlePostback(sender_psid, received_postback) {
    let payload = received_postback.payload;
    let response;

    switch (payload) {
        case 'GET_STARTED':
            console.log("✅ Nhận sự kiện GET_STARTED từ:", sender_psid);
            await chatbotService.handleGetStarted(sender_psid);
            break;

        case 'MENU':
            response = { "text": "🍽️ Đây là menu của chúng tôi!" };
            break;

        case 'ORDER_FOOD':
            response = { "text": "📦 Vui lòng chọn món bạn muốn đặt hàng!" };
            break;

        case 'CONTACT_SUPPORT':
            response = { "text": "📞 Bạn có thể liên hệ hỗ trợ qua số 0123-456-789." };
            break;

        default:
            response = { "text": `🤖 Tôi chưa hiểu lệnh này: ${payload}` };
            break;
    }

    if (response) {
        await callSendAPI(sender_psid, response);
    }
}

module.exports = {
    handlePostback: handlePostback
};