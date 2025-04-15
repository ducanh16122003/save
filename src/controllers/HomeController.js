import request, { get } from "request";
import chatbotService from "../services/chatbotService.js";
import moment from "moment";
require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');

const page_access_token = process.env.PAGE_ACCESS_TOKEN;
const SPEADSHEET_ID = process.env.SPEADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

const IMAGE_GET_STARTED = "https://s.pro.vn/k7Mu";
const IMAGE_MAIN_MENU_1 = "https://short.com.vn/HvjT";
const IMAGE_MAIN_MENU_2 = "https://short.com.vn/lo3A";
const IMAGE_MAIN_MENU_3 = "https://s.pro.vn/ge78";

const IMAGE_VIEW_APPETIZERS = "https://s.pro.vn/UMQM";
const IMAGE_VIEW_FISH = "https://short.com.vn/XqDR";
const IMAGE_VIEW_MEAT = "https://s.pro.vn/mYYN";

const IMAGE_BACK_MAIN_MENU = "https://short.com.vn/JP78";

const IMAGE_DETAIL_APPETIZERS_1 = "https://s.pro.vn/HVxs";
const IMAGE_DETAIL_APPETIZERS_2 = "https://s.pro.vn/dfjD";
const IMAGE_DETAIL_APPETIZERS_3 = "https://s.pro.vn/nSDb";

const IMAGE_DETAIL_FISH_1 = "https://short.com.vn/njBx";
const IMAGE_DETAIL_FISH_2 = "https://s.pro.vn/OcA8";
const IMAGE_DETAIL_FISH_3 = "https://short.com.vn/VNWS";

const IMAGE_DETAIL_MEAT_1 = "https://s.pro.vn/N1NW";
const IMAGE_DETAIL_MEAT_2 = "https://s.pro.vn/zKlK";
const IMAGE_DETAIL_MEAT_3 = "https://short.com.vn/pcKS";

const IMAGE_DETAIL_ROOMS = "https://s.pro.vn/Yc6n";

let writeDataToGoogleSheet = async (data) => {
    
    let currentDate = new Date();
    const format = "HH:mm DD/MM/YYYY";
    let formatedDate = moment(currentDate).format(format);
    
    //Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = new GoogleSpreadsheet(SPEADSHEET_ID);
    //initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.useServiceAccountAuth({
        client_email: JSON.parse(`"${GOOGLE_SERVICE_ACCOUNT_EMAIL}"`),
        private_key: JSON.parse(`"${GOOGLE_PRIVATE_KEY}"`),
    });

    await doc.loadInfo(); //Loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    
    //append rows
    await sheet.addRow(
        {   
            "Tên khách hàng": data.customerName,
            "Địa chỉ Email": data.email,
            "Số điện thoại": data.phoneNumber,
            "Thời gian": formatedDate,
        });
}  

//process.env.NAME_VARIABLES
let getHomePage = (req, res) => {
    return res.render('homepage.ejs');
};

let postWebhook = (req, res) => {
    let body = req.body;
    // Checks this is an event from a page subscription
    if (body.object === "page") {
        
        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {
            
            //Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            //Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('sender PSID: ' + sender_psid);

            //check if the event is a message or postback and
            //pass the event to the appropriate handler function
            if(webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send("EVENT_RECEIVED");
        } else {
            //Returns a '404 not found' if event is not from a page subscription
            res.sendStatus(404);
        }
}

let getWebhook = (req, res) => {
    // Your verify token. Should be a random string
    let verify_token = process.env.verify_token;

    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
  
    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === verify_token) {
      
            // Respond with the challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
}

//handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback){
    let response;

    //get the payload for the postback
    let payload = received_postback.payload;

    //set the response based on the postback payload
    switch (payload) {
        case 'RESTART_BOT':
        case 'GET_STARTED':
            let response2 = {"text": `Chào mừng bạn đến với nhà hàng của Bli.`}

            let response1 = sendgetStartedtemplate(sender_psid);

            await callSendAPI(sender_psid, response1);

            await callSendAPI(sender_psid, response2); 
            break;
        case 'MAIN_MENU':
            let response = handleSendMainMenus(sender_psid);
            await callSendAPI(sender_psid, response);
            break;

        case 'LUNCH_MENU':
            let response3 = getlunchmenutemplate(sender_psid);
            await callSendAPI(sender_psid, response3);
            break;

        case 'DINNER_MENU':
            let response4 = getdinnermenutemplate(sender_psid);
            await callSendAPI(sender_psid, response4);
            break;
        
        case 'VIEW_APPETIZERS':
            let response6 = handleDetailViewAppetizer(sender_psid);
            await callSendAPI(sender_psid, response6);
            break;
        case 'VIEW_FISH':
            let response7 = handleDetailViewFish(sender_psid);
            await callSendAPI(sender_psid, response7);
            break;
        case 'VIEW_MEAT':
            let response8 = handleDetailViewMeat(sender_psid);
            await callSendAPI(sender_psid, response8);
            break;
        
        case 'BACK_TO_MAIN_MENU':
            let response5 = handleSendMainMenus(sender_psid);
            await callSendAPI(sender_psid, response5);
            break;

        case "SHOW_ROOMS":
            let response9 = getImageRoomTemplate(sender_psid);

            let response10 = getButtonRoomTemplate(sender_psid);

            await callSendAPI(sender_psid, response9);

            await callSendAPI(sender_psid, response10);
            break;
        case 'CUSTOMER_CARE':
            let response11 = {"text": `bạn đã chọn chăm sóc khách hàng, vui lòng chờ để được nhân viên hỗ trợ`}
            await callSendAPI(sender_psid, response11);
        default:
            response = {"text": `Oops! I don't know how to respond to postback ${payload}.`}
    }
    //Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

let sendgetStartedtemplate = (senderID) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Xin chào bạn đến với nhà hàng của Bli",
                    "subtitle": "Dưới đây là các lựa chọn của nhà hàng",
                    "image_url": IMAGE_GET_STARTED,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "Chăm sóc khách hàng",
                            "payload": "CUSTOMER_CARE",
                        }
                    ],
                }]
            }
        }
    }
    return response;
    }

let handleSendMainMenus = (senderID) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                    "title": "Menu của nhà hàng",
                    "subtitle": "Chúng tôi hân hạnh mang đến cho bạn thực đơn phong phú cho bữa trưa và bữa tối",
                    "image_url": IMAGE_MAIN_MENU_1,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "BỮA TRƯA",
                            "payload": "LUNCH_MENU",
                        },
                        {
                            "type": "postback",
                            "title": "BỮA TỐI",
                            "payload": "DINNER_MENU",
                        },
                    ],
                },
                {
                    "title": "Giờ mở cửa",
                    "subtitle": "Thứ 2 - Thứ 6: 10AM - 11PM | Thứ 7: 5PM - 10PM | Chủ nhật: 5PM - 9PM",
                    "image_url": IMAGE_MAIN_MENU_2,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                    ],
                },
                {
                    "title": "Không gian nhà hàng",
                    "subtitle": "Nhà hàng có sức chưa lên đến 300 khách ngồi, phù hợp cho các buổi tiệc lớn",
                    "image_url": IMAGE_MAIN_MENU_3,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "CHI TIẾT KHÔNG GIAN",
                            "payload": "SHOW_ROOMS",
                        },
                    ],
                }]
            }
        }
    }
    return response;
}

let getlunchmenutemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                    "title": "Món tráng miệng",
                    "subtitle": "Nhà hàng có nhiều món tráng miệng cực kỳ hấp dẫn",
                    "image_url": IMAGE_VIEW_APPETIZERS,
                    "buttons": [
                        {   
                            //Appetizers
                            "type": "postback",
                            "title": "XEM CHI TIẾT",
                            "payload": "VIEW_APPETIZERS",
                        },
                    ],
                },
                {
                    "title": "Cá bảy màu",
                    "subtitle": "Cá nước mặn và cá nước ngọt",
                    "image_url": IMAGE_VIEW_FISH,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "XEM CHI TIẾT",
                            "payload": "VIEW_FISH",
                        },
                    ],
                },
                {
                    "title": "Thịt hun khói",
                    "subtitle": "Đảm bảo chất lượng hàng đầu",
                    "image_url": IMAGE_VIEW_MEAT,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "XEM CHI TIẾT",
                            "payload": "VIEW_MEAT",
                        },
                    ],
                },
                {
                    "title": "Quay trở lại",
                    "subtitle": "Quay trở lại Menu chính",
                    "image_url": IMAGE_BACK_MAIN_MENU,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "QUAY TRỞ LẠI",
                            "payload": "BACK_TO_MAIN_MENU",
                        },
                    ],
                },
            ]
            }
        }
    }
    return response;
}

let getdinnermenutemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                    "title": "Món tráng miệng",
                    "subtitle": "Nhà hàng có nhiều món tráng miệng cực kỳ hấp dẫn",
                    "image_url": IMAGE_VIEW_APPETIZERS,
                    "buttons": [
                        {   
                            //Appetizers
                            "type": "postback",
                            "title": "XEM CHI TIẾT",
                            "payload": "VIEW_APPETIZERS",
                        },
                    ],
                },
                {
                    "title": "Cá bảy màu",
                    "subtitle": "Cá nước mặn và cá nước ngọt",
                    "image_url": IMAGE_VIEW_FISH,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "XEM CHI TIẾT",
                            "payload": "VIEW_FISH",
                        },
                    ],
                },
                {
                    "title": "Thịt hun khói",
                    "subtitle": "Đảm bảo chất lượng hàng đầu",
                    "image_url": IMAGE_VIEW_MEAT,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "XEM CHI TIẾT",
                            "payload": "VIEW_MEAT",
                        },
                    ],
                }]
            }
        }
    }
    return response;
}

let handleDetailViewAppetizer = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                    "title": "Dưa hấu",
                    "subtitle": "50000 VND/1kg",
                    "image_url": IMAGE_DETAIL_APPETIZERS_1,
                },
                {
                    "title": "Xoài",
                    "subtitle": "20000 VND/1kg",
                    "image_url": IMAGE_DETAIL_APPETIZERS_2,
                },
                {
                    "title": "Ổi",
                    "subtitle": "30000 VND/1kg",
                    "image_url": IMAGE_DETAIL_APPETIZERS_3,
                },
                {
                    "title": "Quay trở lại",
                    "subtitle": "Quay trở lại Menu chính",
                    "image_url": IMAGE_BACK_MAIN_MENU,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "QUAY TRỞ LẠI",
                            "payload": "BACK_TO_MAIN_MENU",
                        },
                    ],
                },
            ]
            }
        }
    }
    return response;
}

let handleDetailViewFish = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                    "title": "Cá hồi Canada",
                    "subtitle": "150000 VND/1kg",
                    "image_url": IMAGE_DETAIL_FISH_1,
                },
                {
                    "title": "Cá chép ông địa",
                    "subtitle": "200000 VND/1kg",
                    "image_url": IMAGE_DETAIL_FISH_2,
                },
                {
                    "title": "Cá Ngừ 900 Màu",
                    "subtitle": "300000 VND/1kg",
                    "image_url": IMAGE_DETAIL_FISH_3,
                },
                {
                    "title": "Quay trở lại",
                    "subtitle": "Quay trở lại Menu chính",
                    "image_url": IMAGE_BACK_MAIN_MENU,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "QUAY TRỞ LẠI",
                            "payload": "BACK_TO_MAIN_MENU",
                        },
                    ],
                },
            ]
            }
        }
    }
    return response;
}

let handleDetailViewMeat = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                    "title": "Thịt bò Mỹ",
                    "subtitle": "500000 VND/1kg",
                    "image_url": IMAGE_DETAIL_MEAT_1,
                },
                {
                    "title": "Thịt heo",
                    "subtitle": "200000 VND/1kg",
                    "image_url": IMAGE_DETAIL_MEAT_2,
                },
                {
                    "title": "Thịt trâu",
                    "subtitle": "300000 VND/1kg",
                    "image_url": IMAGE_DETAIL_MEAT_3,
                },
                {
                    "title": "Quay trở lại",
                    "subtitle": "Quay trở lại Menu chính",
                    "image_url": IMAGE_BACK_MAIN_MENU,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "QUAY TRỞ LẠI",
                            "payload": "BACK_TO_MAIN_MENU",
                        },
                    ],
                },
            ]
            }
        }
    }
    return response;
}
let getImageRoomTemplate = () => {
    let response = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": IMAGE_DETAIL_ROOMS,
                "is_reusable": true
            }
        }
    }
    return response;
}

let getButtonRoomTemplate = (senderID) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                    "title": "bàn 1",
                    "subtitle": "Vị trí: trong nhà - 6 người, bàn ghế tiện nghi sạch sẽ",
                    "image_url": IMAGE_MAIN_MENU_1,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                    ],
                },
                {
                    "title": "bàn 2",
                    "subtitle": "Vị trí: trong nhà - 6 người, bàn ghế tiện nghi sạch sẽ",
                    "image_url": IMAGE_MAIN_MENU_1,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                    ],
                },
                {
                    "title": "bàn 3",
                    "subtitle": "Vị trí: trong nhà - 5 người, bàn ghế tiện nghi sạch sẽ",
                    "image_url": IMAGE_MAIN_MENU_1,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                    ],
                },
                {
                    "title": "bàn 4",
                    "subtitle": "Vị trí: trong nhà - 7 người, bàn ghế tiện nghi sạch sẽ",
                    "image_url": IMAGE_MAIN_MENU_1,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                    ],
                },
                {
                    "title": "bàn 5",
                    "subtitle": "Vị trí: trong nhà - 4 người, bàn ghế tiện nghi sạch sẽ",
                    "image_url": IMAGE_MAIN_MENU_1,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                    ],
                },
                {
                    "title": "bàn 1",
                    "subtitle": "Vị trí: Ngoài trời - 10 người, bàn ghế tiện nghi sạch sẽ",
                    "image_url": IMAGE_MAIN_MENU_1,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                    ],
                },
                {
                    "title": "bàn 2",
                    "subtitle": "Vị trí: Ngoài trời - 9 người, bàn ghế tiện nghi sạch sẽ",
                    "image_url": IMAGE_MAIN_MENU_1,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                    ],
                },
                {
                    "title": "bàn 3",
                    "subtitle": "Vị trí: Ngoài trời - 8 người, bàn ghế tiện nghi sạch sẽ",
                    "image_url": IMAGE_MAIN_MENU_1,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                    ],
                },
                {
                    "title": "bàn 4",
                    "subtitle": "Vị trí: Ngoài trời - 7 người, bàn ghế tiện nghi sạch sẽ",
                    "image_url": IMAGE_MAIN_MENU_1,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                    ],
                },
                {
                    "title": "bàn 5",
                    "subtitle": "Vị trí: Ngoài trời - 6 người, bàn ghế tiện nghi sạch sẽ",
                    "image_url": IMAGE_MAIN_MENU_1,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": `${process.env.URL_WEB_VIEW_ORDER}/${senderID}`,
                            "title": "ĐẶT BÀN",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true //false: open the webview in new tab
                        },
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                    ],
                }]
            }
        }
    }
    return response;
}

//Sends response messages via the Send API
let callSendAPI = async (sender_psid, response) =>{
    //Construct the message body
let request_body = {
    "recipient": {
        "id": sender_psid
    },
    "message": response
}

await sendMarkReadMessage(sender_psid);
await sendTypingOn(sender_psid);

//Send the HTTP request to the Messenger Platform
request({
    "uri": "https://graph.facebook.com/v21.0/me/messages",
    "qs" : { "access_token": process.env.page_access_token },
    "method": "POST",
    "headers": { "Content-Type": "application/json" },
    "json": request_body
},(err, res, body) => {
    if (!err) {
        console.log('message sent!')
    } else {
        console.error("unable to send message:" + err);
    }
})
}

let sendTypingOn = (sender_psid) => {
    //Construct the message body
let request_body = {
    "recipient": {
        "id": sender_psid
    },
    "sender_action": "typing_on"
}

//Send the HTTP request to the Messenger Platform
request({
    "uri": "https://graph.facebook.com/v21.0/me/messages",
    "qs" : { "access_token": process.env.page_access_token },
    "method": "POST",
    "headers": { "Content-Type": "application/json" },
    "json": request_body
},(err, res, body) => {
    if (!err) {
        console.log('sendTypingOn sent!')
    } else {
        console.error("unable to send sendTypingOn:" + err);
    }
})
}

let sendMarkReadMessage = (sender_psid) => {
    //Construct the message body
let request_body = {
    "recipient": {
        "id": sender_psid
    },
    "sender_action": "mark_seen"
}

//Send the HTTP request to the Messenger Platform
request({
    "uri": "https://graph.facebook.com/v21.0/me/messages",
    "qs" : { "access_token": process.env.page_access_token },
    "method": "POST",
    "headers": { "Content-Type": "application/json" },
    "json": request_body
},(err, res, body) => {
    if (!err) {
        console.log('sendTypingOn sent!')
    } else {
        console.error("unable to send sendTypingOn:" + err);
    }
})
}

let setupProfile = async (req, res) =>{
    //call profile facebook api
    //Construct the message body
let request_body = {
    "get_started": {"payload": "GET_STARTED"},
    "whitelisted_domains": ["https://save-3e8r.onrender.com/"]
}

//template string
//Send the HTTP request to the Messenger Platform
await request({
    "uri": `https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${page_access_token}`,
    "qs" : { "access_token": process.env.page_access_token },
    "method": "POST",
    "json": request_body
},(err, res, body) => {
    console.log(body)
    if (!err) {
        console.log('Setup user profile succeeds!')
    } else {
        console.error("unable to Setup user profile:" + err);
    }
});
    return res.send("Setup user profile succeeds!");
}

let setupPersistentMenu = async (req, res) =>{
    //call profile facebook api
    //Construct the message body
let request_body = {
        "persistent_menu": [
              {
                  "locale": "default",
                  "composer_input_disabled": false,
                  "call_to_actions": [
                      {
                          "type": "web_url",
                          "title": "Youtube channel",
                          "url": "https://www.youtube.com/@ucanhnguyen5202",
                          "payload": "VIEW_YOUTUBE_CHANNEL"
                      },
                      {
                          "type": "web_url",
                          "title": "Facebook page bli food",
                          "url": "https://www.facebook.com/profile.php?id=61572421920351",
                          "webview_height_ratio": "full"
                      },
                      {
                          "type": "postback",
                          "title": "khởi đông lại bot",
                          "payload": "RESTART_BOT"
                          
                      }
                  ]
              }
          ]
      }

//template string
//Send the HTTP request to the Messenger Platform
await request({
    "uri": `https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${page_access_token}`,
    "qs" : { "access_token": page_access_token },
    "method": "POST",
    "json": request_body
},(err, res, body) => {
    console.log(body)
    if (!err) {
        console.log('Setup persistent menu succeeds!')
    } else {
        console.error("unable to Setup user profile:" + err);
    }
});
    return res.send("Setup persistent menu succeeds!");
}

let handleReserveTable = (req, res) => {
    let senderId = req.params.senderId;
    return res.render('reserve-table.ejs', {
        senderId: senderId
    });
}

let handlePostReserveTable = async (req, res) => {
    try{
        //write data to google sheet
        let data= {
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            customerName: req.body.customerName,
        };
        await writeDataToGoogleSheet(data);
        let customerName = "";
        if(req.body.customerName === "") {
            customerName = "Khách hàng";
        }   else customerName = req.body.customerName;
        
        // i demo response with sample text
        // you can check database for customer order's status
        let response11 = {
            "text": `---Thông tin khách hàng đặt bàn---
            \nHọ và tên: ${customerName}
            \nEmail: ${req.body.email}
            \nSố điện thoại: ${req.body.phoneNumber}
            `
        };
    await callSendAPI(req.body.psid, response11);
        return res.status(200).json({
            message: "ok"
    });
    } catch (e) {
        console.log(`lỗi post reserve table:`, e);
        return res.status(500).json({
            message: "error"
        });
    }
};

module.exports = {
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
    setupProfile: setupProfile,
    setupPersistentMenu: setupPersistentMenu,
    handleReserveTable: handleReserveTable,
    handlePostReserveTable: handlePostReserveTable,
}