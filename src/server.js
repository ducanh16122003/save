import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./configs/viewEngine.js";
import webRoutes from "./routes/web";

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
//config view Engine
viewEngine(app);

//config view routes
webRoutes(app);

// Chạy server
let port = process.env.PORT || 8080;

app.listen(port,() => {
    console.log("App is running at the port: " + port);
})

function handleClickButtonReserveTable() {
    $("#btnReserveTable").on("click", function (e) {
        let check = validateInputFields(); //return true or false

        let data = {
            psid: $("#psid").val(),
            customerName: $("#customerName").val(),
            email: $("#email").val(),
            phoneNumber: $("#phoneNumber").val()
        };

        if (!check) {
            console.log("Data to be sent:", data);

            //close webview
            MessengerExtensions.requestCloseBrowser(function success() {
                console.log("Webview closed successfully");
            }, function error(err) {    
                console.log("Error closing webview:", err);
            });

            //send data to node.js server 
            $.ajax({
                url: `${window.location.origin}/reserve-table-ajax`,
                method: "POST",
                data: data,
                success: function (data) {
                    console.log("Response from server:", data);
                },
                error: function (error) {
                    console.log("Error from server:", error);
                }
            });
        } else {
            console.log("Validation failed");
        }
    });
}
