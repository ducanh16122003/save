const API_URL = "http://localhost:8080";

// Lấy danh sách bàn
async function fetchTables() {
    const response = await fetch(`${API_URL}/tables`);
    const tables = await response.json();
    renderTables(tables);
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
            <td class="${table.status === 'Available' ? 'available' : 'occupied'}">${table.status}</td>
            <td>
                <button onclick="toggleStatus(${table.id}, '${table.status}')">Đổi trạng thái</button>
                <button onclick="deleteTable(${table.id})">Xóa</button>
            </td>
        `;
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

// Xóa bàn
async function deleteTable(id) {
    if (confirm("Bạn có chắc muốn xóa bàn này?")) {
        await fetch(`${API_URL}/delete_table/${id}`, { method: "DELETE" });
        fetchTables();
    }
}

// Tải danh sách bàn khi mở trang
fetchTables();
