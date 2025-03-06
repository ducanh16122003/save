const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const app = express();

// Kết nối MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "qlbandat"
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
app.get("/tables", (req, res) => {
    db.query("SELECT * FROM tables", (err, results) => {
        if (err) return res.status(500).send("Lỗi Server");
        res.json(results);
    });
});

// API cập nhật trạng thái bàn
app.post("/update_table/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.query("UPDATE tables SET status = ? WHERE id = ?", [status, id], (err) => {
        if (err) return res.status(500).send("Lỗi cập nhật");
        res.send("Cập nhật thành công");
    });
});

// Trang chủ hiển thị sơ đồ bàn ăn
app.get("/", (req, res) => {
    res.render("homepage");
});

document.addEventListener("DOMContentLoaded", function () {
    fetch("/tables") // Gọi API lấy danh sách bàn
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("table-list");
            tableBody.innerHTML = ""; // Xóa dữ liệu cũ (nếu có)

            data.forEach(table => {
                const row = `
                    <tr>
                        <td>${table.id}</td>
                        <td>${table.name}</td>
                        <td>${table.capacity}</td>
                        <td>${table.position}</td>
                        <td>${table.status}</td>
                        <td>
                            <button onclick="editTable(${table.id}, '${table.name}', ${table.capacity}, '${table.position}', '${table.status}')">
                                Sửa
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
});

function loadTables() {
    fetch("/tables")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("table-list");
            tableBody.innerHTML = ""; // Xóa dữ liệu cũ
            data.forEach(table => {
                const row = `
                    <tr id="table-row-${table.id}">
                        <td>${table.id}</td>
                        <td>${table.name}</td>
                        <td>${table.capacity}</td>
                        <td>${table.position}</td>
                        <td>${table.status}</td>
                        <td><button onclick="editTable(${table.id}, '${table.name}', ${table.capacity}, '${table.position}', '${table.status}')">Sửa</button></td>
                    </tr>`;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));
}

    window.deleteTable = async (id) => {
        if (confirm("Bạn có chắc muốn xóa bàn này không?")) {
            await fetch(`/tables/${id}`, { method: "DELETE" });
            loadTables();
        }
    };

    tableForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        let method = tableId.value ? "PUT" : "POST";
        let url = tableId.value ? `/tables/${tableId.value}` : "/tables";

        await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name.value,
                capacity: capacity.value,
                position: position.value,
                status: status.value
            })
        });

        tableForm.reset();
        tableId.value = "";
        loadTables();
    });

    loadTables();