import request from "request";
require('dotenv').config();

const page_access_token = process.env.PAGE_ACCESS_TOKEN;

let callSendAPI = (sender_psid, response) => {
    return new Promise((resolve, reject) => {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v21.0/me/messages",
        "qs": { "access_token": page_access_token },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("unable to send message:" + err);
        }
    })
})
}

let getUserName = (sender_psid) => {
    return new Promise((resolve, reject) => {
        request({
            "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${page_access_token}`,
            "method": "GET",
        }, (err, res, body) => {
            if (!err) {
                body = JSON.parse(body);
                let userName = `${body.first_name} ${body.last_name}`;
                resolve(userName);
            } else {
                console.error("Unable to send message:" + err);
                reject(err);
            }
        });
    })
}

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
    try {
        let userName = await getUserName(sender_psid);
        let response = { "text": `Chào mừng đến với bình nguyên vô tận, ${userName}!` }
        await callSendAPI(sender_psid, response);
        resolve('done');
    } catch (e) {
        reject(e);
    }
})
}

module.exports = {
    handleGetStarted: handleGetStarted,
}