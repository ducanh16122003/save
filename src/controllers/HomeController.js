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
            
            // Gets the message, entry.messaging in an array, but
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
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

module.exports = {
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
}