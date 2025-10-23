// ================================
// ⚙️ MÀN HÌNH CÀI ĐẶT
// ================================
function moManHinhCaiDat() {
  // Ẩn tất cả màn hình
  document.querySelectorAll(".screen").forEach(s => s.style.display = "none");

  // Hiển thị màn hình settings
  const settingsScreen = document.getElementById("settings-screen");
  settingsScreen.style.display = "block";

  const header = document.querySelector("header");
  const main = document.getElementById("settingsContent");

  // Cập nhật header
  header.innerHTML = `
    <h1>Cài đặt</h1>
    <div class="header-icons">
      <button id="btnBackSetting" class="btn-close-order" title="Quay lại">×</button>
    </div>
  `;

  // Nội dung cài đặt
  main.innerHTML = `
    <div class="setting-container">
      <div class="setting-tabs">
        <button class="tab-btn active" data-tab="menu">📋 Cài đặt menu</button>
        <button class="tab-btn" data-tab="printer">🖨️ Cài đặt máy in</button>
        <button class="tab-btn" data-tab="account">👤 Cài đặt tài khoản</button>
      </div>

      <div class="setting-content">
        <div class="tab-content" id="tab-menu">
          <h2>📋 Cài đặt menu</h2>
          <p>Thêm, bớt hoặc chỉnh sửa món trong menu.</p>
          <button id="btnThemMon" class="btn-primary hieuung-noi">➕ Thêm món mới</button>
          <div id="menuList"></div>
        </div>

        <div class="tab-content hidden" id="tab-printer">
          <h2>🖨️ Cài đặt máy in</h2>
          <p>Tùy chỉnh nội dung và kích thước khi in hóa đơn.</p>
          <button id="btnTuyChinhIn" class="btn-primary hieuung-noi">⚙️ Tùy chỉnh</button>
        </div>

        <div class="tab-content hidden" id="tab-account">
          <h2>👤 Cài đặt tài khoản</h2>
          <p>Tính năng sẽ được cập nhật sau.</p>
        </div>
      </div>
    </div>
  `;

  // Nút quay lại
  document.getElementById("btnBackSetting")?.addEventListener("click", () => {
    khoiPhucHeaderMacDinh();   // Khôi phục header ban đầu
    hienThiManHinhChinh();     // Hiển thị màn hình chính
    renderTables();             // Render lại danh sách bàn
  });

  // Chuyển tab
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.remove("hidden");
    });
  });

  // Gọi danh sách menu (nếu có)
  if (typeof taiDanhSachMenu === "function") taiDanhSachMenu();
}