const API_URL = "http://localhost:8080";

// Lấy danh sách bàn
async function fetchTables() {
    try {
        const response = await fetch(`${API_URL}/tables`);
        const tables = await response.json();
        console.log("Dữ liệu từ API:", tables); // 👈 Xem dữ liệu có nhận được không
        renderTables(tables);
    } catch (error) {
        console.error("Lỗi khi tải danh sách bàn:", error);
    }
}

// Hiển thị danh sách bàn
function renderTables(tables) {
    const tableList = document.getElementById("table-list");
    tableList.innerHTML = "";
    tables.forEach(table => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${table.id}</td>
            <td>${table.name}</td>
            <td>${table.capacity}</td>
            <td>${table.position}</td>
            <td>${table.status}</td>
            <td>
                <button onclick="editTable(${table.id}, '${table.name}', ${table.capacity}, '${table.position}', '${table.status}')">Sửa</button>
                <button onclick="deleteTable(${table.id})">Xóa</button>
            </td>
        `;
        console.log(row.innerHTML); // 👈 Kiểm tra HTML
        tableList.appendChild(row);
    });
}

// Đổi trạng thái bàn
async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === "Available" ? "Occupied" : "Available";
    await fetch(`${API_URL}/update_table/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
    });
    fetchTables(); // Cập nhật lại danh sách
}

//Thêm hoặc sửa bàn
document.getElementById("table-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("table-id").value;
    const name = document.getElementById("table-name").value;
    const capacity = document.getElementById("table-capacity").value;
    const position = document.getElementById("table-position").value;
    const status = document.getElementById("table-status").value;

    const tableData = { name, capacity, position, status };

    if (id) {
        await fetch(`/update_table/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tableData)
        });
    } else {
        await fetch("/add_table", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tableData)
        });
    }

    fetchTables();
    document.getElementById("table-form").reset();
});

// Xóa bàn
async function deleteTable(id) {
    if (confirm("Bạn có chắc muốn xóa bàn này?")) {
        await fetch(`${API_URL}/delete_table/${id}`, { method: "DELETE" });
        fetchTables();
    }
}

// Tải danh sách bàn khi mở trang
fetchTables();
