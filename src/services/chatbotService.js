import { response } from "express";
import request from "request"
require('dotenv').config();

const page_access_token = process.env.PAGE_ACCESS_TOKEN;
let callSendAPI = (sender_psid, response) => {
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
    "qs" : { "access_token": page_access_token },
    "method": "POST",
    "headers": { "Content-Type": "application/json" },
    "json": request_body
},(err, res, body) => {
    if (!err) {
        console.log('message sent!')
    } else {
        console.error("unable to send message:" + err);
    }
});
}

let getUserName = (sender_psid) => {
    return new Promise((resolve, reject) => {
request({
    "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${page_access_token}`,
    "method": "GET",
},(err, res, body) => {
    if (!err) {
        body = JSON.parse(body);
        let username = `${body.last_name} ${body.first_name}`;
        resolve(username);
    } else {
        console.error("unable to send message:" + err);
        reject(err);
    }
        });
    })
}

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try{
            let username = await getUserName(sender_psid);
            let response = {"text": `OK. Xin chào bạn ${username} đến với nhà hàng của Bli`}
            await callSendAPI(sender_psid, response);
            resolve('done');
        }catch(e){
            reject(e);
        }
    })
}

module.exports = {
    handleGetStarted: handleGetStarted
}