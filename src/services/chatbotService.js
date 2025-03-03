import request from "request";

const page_access_token = process.env.PAGE_ACCESS_TOKEN;

let getUserName = (sender_psid) => {
    return new Promise((resolve, reject) => {
        request({
            "uri": `https://graph.facebook.com/${sender_psid}`,
            "qs": { "access_token": page_access_token },
            "method": "GET"
        }, (err, res, body) => {
            if (!err) {
                let user = JSON.parse(body);
                let userName = `${user.first_name} ${user.last_name}`;
                resolve(userName);
            } else {
                reject("Unable to fetch user name:" + err);
            }
        });
    });
};

export default {
    getUserName
};