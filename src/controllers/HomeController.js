import request from "request";
import chatbotService from "../services/chatbotService.js";
require('dotenv').config();

const page_access_token = process.env.PAGE_ACCESS_TOKEN;

const IMAGE_GET_STARTED = "https://s.pro.vn/k7Mu";
const IMAGE_MAIN_MENU_1 = "https://short.com.vn/HvjT";
const IMAGE_MAIN_MENU_2 = "https://short.com.vn/lo3A";
const IMAGE_MAIN_MENU_3 = "https://s.pro.vn/ge78";

const IMAGE_VIEW_APPETIZERS = "https://s.pro.vn/UMQM";
const IMAGE_VIEW_FISH = "https://short.com.vn/XqDR";
const IMAGE_VIEW_MEAT = "https://s.pro.vn/mYYN";

const IMAGE_BACK_MAIN_MENU = "https://short.com.vn/JP78";
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

//handles messages events
function handleMessage(sender_psid, received_message){
    let response;
    
    //check if the message contains text
    if (received_message.text) {

        //create the payload for a basic text message, which
        //will be added to the body of our request to the Send API
        response = {
            "text": `you sent the message: "${received_message.text}". Now send me an image!`
        }
    } else if (received_message.attachments){
        
        //gets the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }
    //sends the response message
    callSendAPI(sender_psid, response);
}
//handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback){
    let response;

    //get the payload for the postback
    let payload = received_postback.payload;

    //set the response based on the postback payload
    switch (payload) {
        case 'yes':
            response = {"text": `Thanks!`}
            break;
        case 'no':
            response = {"text": `Oops, try sending another image.`}
            break;

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
        case 'VIEW_FISH':
        case 'VIEW_MEAT':
        
        case 'BACK_TO_MAIN_MENU':
            let response5 = handleSendMainMenus(sender_psid);
            await callSendAPI(sender_psid, response5);
        default:
            response = {"text": `Oops! I don't know how to respond to postback ${payload}.`}
    }
    //Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

let sendgetStartedtemplate = () => {
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
                            "type": "postback",
                            "title": "ĐẶT BÀN",
                            "payload": "RESERVE_TABLE",
                        },
                        {
                            "type": "postback",
                            "title": "HƯỚNG DẪN SỬ DỤNG BOT",
                            "payload": "GUIDE",
                        }
                    ],
                }]
            }
        }
    }
    return response;
    }

let handleSendMainMenus = () => {
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
                            "type": "postback",
                            "title": "ĐẶT BÀN",
                            "payload": "RESERVE_TABLE",
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

//Sends response messages via the Send API
function callSendAPI(sender_psid, response){
    //Construct the message body
let request_body = {
    "recipient": {
        "id": sender_psid
    },
    "message": response
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
        console.log('message sent!')
    } else {
        console.error("unable to send message:" + err);
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

module.exports = {
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
    setupProfile: setupProfile,
    setupPersistentMenu: setupPersistentMenu,
}