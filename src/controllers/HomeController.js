import request from "request";
import chatbotService from "../services/chatbotService";
require('dotenv').config();

const page_access_token = process.env.PAGE_ACCESS_TOKEN;

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
        case 'GET_STARTED':
            await chatbotService.handleGetStarted(sender_psid);
            break;
        default:
            response = {"text": `Oops! I don't know how to respond to postback ${payload}.`}
    }
    //Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
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
module.exports = {
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
    setupProfile: setupProfile,
}