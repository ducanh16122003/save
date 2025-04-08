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

const mysql = require("mysql");

// Kết nối MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nhahang",
    port: 3306
});

db.connect(err => {
    if (err) throw err;
    console.log("✅ Kết nối MySQL thành công!");
});

// Cấu hình server
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

// API lấy danh sách bàn
app.get("/tablebooking", (req, res) => {
    db.query("SELECT * FROM tablebooking", (err, results) => {
        if (err) return res.status(500).send("Lỗi Server");
        res.json(results);
    });
});

// Thêm bàn mới
app.post('/tablebooking', (req, res) => {
    const { name, capacity, position, status } = req.body;
    if (!name || !capacity || !position || !status) {
        return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const sql = "INSERT INTO tablebooking (name, capacity, position, status) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, capacity, position, status], (err, result) => {
        if (err) {
            console.error("Lỗi khi thêm bàn:", err);
            return res.status(500).json({ message: "Lỗi server" });
        }
        res.json({ message: "Thêm bàn thành công", id: result.insertId });
    });
});

// API cập nhật trạng thái bàn
app.put('/tablebooking/:id', (req, res) => {
    const { name, capacity, position, status } = req.body;
    const { id } = req.params;
    if (!name || !capacity || !position || !status) {
        return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const sql = "UPDATE tablebooking SET name = ?, capacity = ?, position = ?, status = ? WHERE id = ?";
    db.query(sql, [name, capacity, position, status, id], (err, result) => {
        if (err) {
            console.error("Lỗi khi cập nhật bàn:", err);
            return res.status(500).json({ message: "Lỗi server" });
        }
        res.json({ message: "Cập nhật bàn thành công" });
    });
});

// Xóa bàn
app.delete("/tablebooking/:id", (req, res) => {
    db.query("DELETE FROM nhahang WHERE id=?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Xóa bàn thành công" });
    });
});

// Trang chủ hiển thị sơ đồ bàn ăn
app.get("/", (req, res) => {
    res.render("homepage");
});

// Chạy server
let port = process.env.PORT || 8080;

app.listen(port,() => {
    console.log("App is running at the port: " + port);
})
