// ================================
// 💰 Thanh Toán + Lịch sử - BlackTea POS v3.0 (Realtime Firestore)
// ================================

// 🔹 Mở màn hình thanh toán
function moManHinhThanhToan(don) {
  if (!don) return;
  const main = document.querySelector(".main-container");
  const header = document.querySelector("header");

  header.innerHTML = `
    <h1 class="invoice-title-ct" style="color: #fff;">Thanh toán đơn hàng</h1>
    <div class="header-icons">
      <button id="btnBackPayment" class="btn-close">×</button>
    </div>
  `;

  const htmlChiTiet = don.cart.map(m => `
    <div class="mon-item">
      <div class="mon-left">
        <span class="mon-name">${m.name}</span>
        <span class="mon-sub">${m.soluong} × ${m.price.toLocaleString()}đ</span>
      </div>
      <div class="mon-right">${(m.soluong * m.price).toLocaleString()}đ</div>
    </div>
  `).join("");

  const tongTien = don.cart.reduce((a, m) => a + m.price * m.soluong, 0);

  main.innerHTML = `
    <div class="order-detail-ct">
      <div class="invoice-header-ct">
        <div class="invoice-title-ct">${don.name}</div>
        <div class="invoice-time-ct">Thời gian: ${new Date(don.createdAt).toLocaleString("vi-VN")}</div>
      </div>
      <div class="order-content-ct">${htmlChiTiet}</div>
      <div class="order-total-ct"><strong>Tổng cộng: ${tongTien.toLocaleString()}đ</strong></div>
      <div class="order-footer-ct">
        <button id="btnChuyenKhoan" class="btn-primary">💳 Chuyển khoản</button>
        <button id="btnTienMat" class="btn-primary">💵 Tiền mặt</button>
      </div>
    </div>
  `;

  document.getElementById("btnBackPayment")?.addEventListener("click", () => {
    khoiPhucHeaderMacDinh();
    hienThiManHinhChinh();
    renderTables();
  });

  document.getElementById("btnChuyenKhoan")?.addEventListener("click", () => {
    xuLyThanhToan(don, "Chuyển khoản");
  });
  document.getElementById("btnTienMat")?.addEventListener("click", () => {
    xuLyThanhToan(don, "Tiền mặt");
  });
}

// ================================
// ✅ Xử lý thanh toán đồng bộ Firestore
// ================================
async function xuLyThanhToan(don, kieuThanhToan = "") {
  if (!don) return;

  don.status = "done";
  don.paidAt = new Date().toISOString();
  don.paymentType = kieuThanhToan;

  // 🧹 Xóa khỏi danh sách phục vụ local
  if (Array.isArray(hoaDonChinh))
    hoaDonChinh = hoaDonChinh.filter(d => d.id !== don.id);
  saveAll();

  // 🖥️ Cập nhật UI ngay lập tức
  hienThiManHinhChinh();
  renderTables();

  // 🔄 Lưu lịch sử local
  const lichSu = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");
  lichSu.push(don);
  localStorage.setItem("BT_LICHSU_THANHTOAN", JSON.stringify(lichSu));

  // 🔥 Đồng bộ Firestore (online/offline)
  if (navigator.onLine && db) {
    try {
      await db.collection("orders_done").doc(String(don.id)).set(don);
      await db.collection("orders").doc(String(don.id)).delete();
      console.log("✅ Thanh toán Firestore:", don.name);
    } catch (e) {
      console.warn("⚠️ Lỗi khi lưu Firestore, lưu tạm offline:", e);
      themVaoHangDoiOffline(don);
    }
  } else {
    console.log("📴 Offline, lưu vào hàng đợi:", don.name);
    themVaoHangDoiOffline(don);
  }
}

// ================================
// 📦 Hàng đợi offline (sẽ tự đẩy khi có mạng)
// ================================
function themVaoHangDoiOffline(don) {
  let queue = JSON.parse(localStorage.getItem("BT_OFFLINE_QUEUE") || "[]");
  queue.push({ ...don, action: "PAYMENT" });
  localStorage.setItem("BT_OFFLINE_QUEUE", JSON.stringify(queue));
}

// Khi có mạng trở lại
window.addEventListener("online", async () => {
  const queue = JSON.parse(localStorage.getItem("BT_OFFLINE_QUEUE") || "[]");
  if (!queue.length || !db) return;

  console.log("🌐 Có mạng trở lại, đồng bộ lại Firestore...");
  for (const item of queue) {
    try {
      if (item.action === "PAYMENT") {
        await db.collection("orders_done").doc(String(item.id)).set(item);
        await db.collection("orders").doc(String(item.id)).delete();
        console.log("⬆️ Đã đồng bộ lại:", item.name);
      }
    } catch (e) {
      console.error("❌ Lỗi khi đồng bộ lại:", e);
    }
  }
  localStorage.removeItem("BT_OFFLINE_QUEUE");
});

// ================================
// 📜 Lịch sử Thanh Toán
// ================================
async function hienThiLichSuThanhToan() {
  let data = [];

  // 🔹 Ưu tiên lấy từ Firestore nếu có mạng
  if (navigator.onLine && db) {
    try {
      const snap = await db.collection("orders_done").orderBy("paidAt", "desc").get();
      snap.forEach(doc => data.push(doc.data()));
      localStorage.setItem("BT_LICHSU_THANHTOAN", JSON.stringify(data));
    } catch (e) {
      console.warn("⚠️ Không tải được Firestore, dùng local:", e);
      data = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");
    }
  } else {
    data = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");
  }

  const main = document.querySelector(".main-container");
  const header = document.querySelector("header");
  header.innerHTML = `
    <h1>Lịch sử thanh toán</h1>
    <div class="header-icons">
      <button id="btnBack" class="btn-close-order" title="Quay lại">×</button>
    </div>
  `;

  main.innerHTML = `
    <div class="filter-bar">
      <input type="date" id="filterDate">
      <select id="filterType">
        <option value="all">Tất cả</option>
        <option value="Chuyển khoản">Chuyển khoản</option>
        <option value="Tiền mặt">Tiền mặt</option>
      </select>
    </div>
    <div id="historyList"></div>
    <div id="popupChiTiet" class="popup hidden">
      <div class="popup-content">
        <button id="btnDongPopup" class="popup-close">×</button>
        <div id="popupNoiDung"></div>
        <div class="popup-actions">
          <button id="btnThoatPopup" class="btn-secondary hieuung-nhat">Thoát</button>
          <button id="btnInLai" class="btn-primary hieuung-noi">🖨️ In lại</button>
        </div>
      </div>
    </div>
  `;

  const renderList = () => {
    const dateVal = document.getElementById("filterDate").value;
    const typeVal = document.getElementById("filterType").value;
    const container = document.getElementById("historyList");

    let filtered = [...data];

    if (dateVal) {
      filtered = filtered.filter(d => {
        const ngayThanhToan = new Date(d.paidAt).toLocaleDateString("vi-VN");
        const ngayChon = new Date(dateVal).toLocaleDateString("vi-VN");
        return ngayThanhToan === ngayChon;
      });
    }

    if (typeVal !== "all") {
      filtered = filtered.filter(d => d.paymentType === typeVal);
    }

    if (!filtered.length) {
      container.innerHTML = `<p>📭 Không có hóa đơn nào phù hợp.</p>`;
      return;
    }

const danhSach = [...filtered].reverse();
container.innerHTML = danhSach
  .map((d, i) => `
    <div class="lichsu-item" style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:6px 0;">
      <div style="flex:1;">
        <strong>${d.name}</strong><br>
        <small>${new Date(d.paidAt).toLocaleString("vi-VN")}</small><br>
        ${d.cart.length} món • <strong>${d.cart
          .reduce((a, m) => a + m.price * m.soluong, 0)
          .toLocaleString()}đ</strong> • ${d.paymentType || "Không rõ"}
      </div>
      <button class="btn-primary btn-xemlai hieuung-noi" data-index="${i}" style="white-space:nowrap; min-width:90px;">
        👁️ Xem lại
      </button>
    </div>
    <hr>`
  )
  .join("");


    document.querySelectorAll(".btn-xemlai").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = e.target.dataset.index;
        const don = danhSach[danhSach.length - 1 - idx];
        moPopupChiTietDon(don);
      });
    });
  };

  renderList();

  document.getElementById("filterDate").addEventListener("change", renderList);
  document.getElementById("filterType").addEventListener("change", renderList);
  document.getElementById("btnBack")?.addEventListener("click", () => {
    khoiPhucHeaderMacDinh();
    hienThiManHinhChinh();
    renderTables();
  });
}

// ================================
// 🔍 Popup xem chi tiết hóa đơn
// ================================
function moPopupChiTietDon(don) {
  const popup = document.getElementById("popupChiTiet");
  const noiDung = document.getElementById("popupNoiDung");
  if (!popup || !noiDung) return;

  const tongTien = don.cart.reduce((a, m) => a + m.price * m.soluong, 0);
  const timeStr = new Date(don.paidAt || don.createdAt).toLocaleString("vi-VN");

  noiDung.innerHTML = `
    <h3>${don.name}</h3>
    <p><small>Thanh toán lúc: ${timeStr}</small></p>
    <div class="popup-list">
      ${don.cart.map(m => `
        <div class="popup-item">
          <span>${m.name}</span>
          <span>${m.soluong} × ${m.price.toLocaleString()}đ</span>
        </div>`).join("")}
    </div>
    <hr>
    <p><strong>Tổng cộng: ${tongTien.toLocaleString()}đ</strong></p>
    <p>Hình thức: ${don.paymentType || "Không rõ"}</p>
  `;

  popup.classList.remove("hidden");
  const closePopup = () => popup.classList.add("hidden");
  document.getElementById("btnDongPopup")?.addEventListener("click", closePopup);
  document.getElementById("btnThoatPopup")?.addEventListener("click", closePopup);
  document.getElementById("btnInLai")?.addEventListener("click", () => window.print());
}
