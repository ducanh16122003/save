const { response, request } = require('express');
import request from "request"
require('dotenv').config();

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

        //create the payload for a basic text message
        response = {
            "text": `you sent the message: "${received_message.text}". Now send me an image!`
        }
    }
    //sends the response message
    callSendAPI(sender_psid, response);
}
//handles messaging_postbacks events
function handlePostback(sender_psid, received_postback){

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
    "qs" : { "access_token": process.env.access_token },
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

module.exports = {
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
}