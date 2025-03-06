import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./configs/viewEngine.js";
import webRoutes from "./routes/web";

const mysql = require("mysql");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
//config view Engine
viewEngine(app);

//config view routes
webRoutes(app);

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "restaurant_db"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

// API lấy danh sách bàn
app.get("/tables", (req, res) => {
    db.query("SELECT * FROM tables", (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// API cập nhật trạng thái bàn
app.post("/update_table/:id", (req, res) => {
    const { status } = req.body;
    db.query("UPDATE tables SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
        if (err) throw err;
        res.json({ message: "Cập nhật thành công!" });
    });
});

// API thêm bàn mới
app.post("/add_table", (req, res) => {
    const { name, capacity, position } = req.body;
    db.query("INSERT INTO tables (name, capacity, position) VALUES (?, ?, ?)", [name, capacity, position], (err) => {
        if (err) throw err;
        res.json({ message: "Bàn đã được thêm!" });
    });
});

// API xóa bàn
app.delete("/delete_table/:id", (req, res) => {
    db.query("DELETE FROM tables WHERE id = ?", [req.params.id], (err) => {
        if (err) throw err;
        res.json({ message: "Xóa bàn thành công!" });
    });
});

// Chạy server
let port = process.env.PORT || 8080;

app.listen(port,() => {
    console.log("App is running at the port: " + port);
})