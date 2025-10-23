/* ===============================
   📋 Quản lý Hóa Đơn Chính
   =============================== */

let hoaDonChinh = [];
let hoaDonHienTai = null; // ✅ thay cho currentTable

// 🧩 Tải dữ liệu hóa đơn từ localStorage
function loadAll() {
  const local = localStorage.getItem("BT_TABLES");
  if (local) hoaDonChinh = JSON.parse(local);
  else hoaDonChinh = [];
}


// 🆕 Tạo hóa đơn mới (bàn mới)
function createNewTable(name, type = "mangdi") {
  const don = {
    id: Date.now(),
    name: name,
    type: type,
    cart: [],
    served: false,
    createdAt: Date.now(),
    _isDraft: true
  };
  hoaDonChinh.push(don);
  saveAll();
  return don;
}

// 🔍 Mở hóa đơn theo ID
function openTable(id) {
  const don = hoaDonChinh.find(t => t.id === id);
  if (don) hoaDonHienTai = don; // ✅ đổi currentTable → hoaDonHienTai
  return don;
}

// ❌ Đóng hóa đơn hiện tại
function closeCurrentTable() {
  if (!hoaDonHienTai) return;
  hoaDonChinh = hoaDonChinh.filter(t => t.id !== hoaDonHienTai.id);
  hoaDonHienTai = null; // ✅
  saveAll();
}

// 💾 Cập nhật lại hóa đơn hiện tại
function updateCurrentTable() {
  if (!hoaDonHienTai) return;
  const index = hoaDonChinh.findIndex(t => t.id === hoaDonHienTai.id);
  if (index >= 0) hoaDonChinh[index] = hoaDonHienTai;
  saveAll();
}

// 🧮 Lọc hóa đơn đang phục vụ
function getActiveTables() {
  return hoaDonChinh.filter(t => !t.served);
}

// 🧾 Xóa toàn bộ hóa đơn (reset hệ thống)
function clearAllTables() {
  hoaDonChinh = [];
  localStorage.removeItem("BT_TABLES");
}

// ⚙️ Khởi tạo khi mở app
loadAll();



