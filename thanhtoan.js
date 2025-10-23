// ================================
// 💰 Thanh Toán + Lịch sử - BlackTea POS v2.6
// ================================
// 🔹 Mở màn hình thanh toán (bố cục giống mochitietdon)
function moManHinhThanhToan(don) {
  if (!don) return;
  const main = document.querySelector(".main-container");
  const header = document.querySelector("header");

  // Header giống mochitietdon + chữ trắng
  header.innerHTML = `
    <h1 class="invoice-title-ct" style="color: #fff;">Thanh toán đơn hàng</h1>
    <div class="header-icons">
      <button id="btnBackPayment" class="btn-close">×</button>
    </div>
  `;

  // Danh sách món
  const htmlChiTiet = don.cart.map(m => `
    <div class="mon-item">
      <div class="mon-left">
        <span class="mon-name">${m.name}</span>
        <span class="mon-sub">${m.soluong} × ${m.price.toLocaleString()}đ</span>
      </div>
      <div class="mon-right">${(m.soluong * m.price).toLocaleString()}đ</div>
    </div>
  `).join("");

  // Tổng tiền
  const tongTien = don.cart.reduce((a, m) => a + m.price * m.soluong, 0);

  main.innerHTML = `
    <div class="order-detail-ct">
      <div class="invoice-header-ct">
        <div class="invoice-title-ct">${don.name}</div>
        <div class="invoice-time-ct">Thời gian: ${new Date(don.createdAt).toLocaleString("vi-VN")}</div>
      </div>

      <div class="order-content-ct">
        ${htmlChiTiet}
      </div>

      <div class="order-total-ct">
        <strong>Tổng cộng: ${tongTien.toLocaleString()}đ</strong>
      </div>

      <div class="order-footer-ct">
        <button id="btnChuyenKhoan" class="btn-primary">💳 Chuyển khoản</button>
        <button id="btnTienMat" class="btn-primary">💵 Tiền mặt</button>
      </div>
    </div>
  `;

  // Nút quay lại
  document.getElementById("btnBackPayment")?.addEventListener("click", () => {
    khoiPhucHeaderMacDinh();
    hienThiManHinhChinh();
    renderTables();
  });

  // Hai hình thức thanh toán
  document.getElementById("btnChuyenKhoan")?.addEventListener("click", () => {
    xuLyThanhToan(don, "Chuyển khoản");
  });
  document.getElementById("btnTienMat")?.addEventListener("click", () => {
    xuLyThanhToan(don, "Tiền mặt");
  });
}

// ================================
// ✅ Xử lý thanh toán thật sự
// ================================
// ================================
// ✅ Xử lý thanh toán thật sự (phiên bản Firestore + offline)
// ================================
async function xuLyThanhToan(don, kieuThanhToan = "") {
  if (!don) return;
  const xacNhan = confirm(`Xác nhận thanh toán "${don.name}" (${kieuThanhToan})?`);
  if (!xacNhan) return;

  don.status = "done";
  don.paidAt = new Date().toISOString();
  don.paymentType = kieuThanhToan;

  try {
    if (!db) throw new Error("Firestore chưa sẵn sàng");

    // ✅ 1. Lưu vào collection 'history'
    await db.collection("history").doc(String(don.id)).set(don);

    // ✅ 2. Xóa khỏi collection 'orders'
    await db.collection("orders").doc(String(don.id)).delete();

    console.log("💰 Đã chuyển đơn vào Firestore > history:", don.name);
  } catch (err) {
    // 🔸 Nếu mất mạng → lưu tạm offline
    console.warn("⚠️ Mất mạng khi thanh toán, lưu tạm offline:", err);
    const lichSu = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");
    lichSu.push(don);
    localStorage.setItem("BT_LICHSU_THANHTOAN", JSON.stringify(lichSu));
  }

  // ✅ Xóa khỏi danh sách đơn tại chỗ
  if (typeof hoaDonChinh !== "undefined" && Array.isArray(hoaDonChinh)) {
    hoaDonChinh = hoaDonChinh.filter((d) => d.id !== don.id);
  }

  // 🔔 Thông báo
  if (typeof hienThongBao === "function")
    hienThongBao(`💰 Đã thanh toán ${don.name} (${kieuThanhToan})`);
  else
    alert(`💰 Đã thanh toán ${don.name} (${kieuThanhToan})`);

  // 🔄 Quay về màn chính
  khoiPhucHeaderMacDinh();
  hienThiManHinhChinh();
  renderTables();
}


// ================================
// ✅ Xử lý thanh toán thật sự (Firestore + đồng bộ orders)
// ================================
async function xuLyThanhToan(don, kieuThanhToan = "") {
  if (!don) return;
  const xacNhan = confirm(`Xác nhận thanh toán "${don.name}" (${kieuThanhToan})?`);
  if (!xacNhan) return;

  don.status = "done";
  don.paidAt = new Date().toISOString();
  don.paymentType = kieuThanhToan;

  try {
    if (!db) throw new Error("Firestore chưa sẵn sàng");

    // ✅ 1. Lưu sang collection 'history'
    await db.collection("history").doc(String(don.id)).set(don);

    // ✅ 2. Xóa khỏi 'orders' (đơn đã phục vụ)
    await db.collection("orders").doc(String(don.id)).delete();

    console.log("💰 Đã chuyển đơn vào history và xoá khỏi orders:", don.name);
  } catch (err) {
    console.warn("⚠️ Mất mạng khi thanh toán, lưu tạm offline:", err);

    // Lưu cache offline nếu Firestore không sẵn sàng
    const lichSu = JSON.parse(localStorage.getItem("BT_LICHSU_THANHTOAN") || "[]");
    lichSu.push(don);
    localStorage.setItem("BT_LICHSU_THANHTOAN", JSON.stringify(lichSu));

    // Gắn cờ để sau này đồng bộ lại
    const queue = JSON.parse(localStorage.getItem("BT_OFFLINE_DONE") || "[]");
    queue.push(don);
    localStorage.setItem("BT_OFFLINE_DONE", JSON.stringify(queue));
  }

  // ✅ 3. Xóa khỏi danh sách đang phục vụ trong bộ nhớ
  if (typeof hoaDonChinh !== "undefined" && Array.isArray(hoaDonChinh)) {
    hoaDonChinh = hoaDonChinh.filter((d) => d.id !== don.id);
  }

  // ✅ 4. Gọi hàm render lại màn hình
  capNhatHoaDon();
  renderTables();

  // ✅ 5. Thông báo
  if (typeof hienThongBao === "function")
    hienThongBao(`💰 Đã thanh toán ${don.name} (${kieuThanhToan})`);
  else
    alert(`💰 Đã thanh toán ${don.name} (${kieuThanhToan})`);

  // 🔄 Quay về màn chính
  khoiPhucHeaderMacDinh();
  hienThiManHinhChinh();
  renderTables();
}

// 🔹 Popup xem chi tiết hóa đơn
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
      ${don.cart
        .map(
          (m) => `
        <div class="popup-item">
          <span>${m.name}</span>
          <span>${m.soluong} × ${m.price.toLocaleString()}đ</span>
        </div>`
        )
        .join("")}
    </div>
    <hr>
    <p><strong>Tổng cộng: ${tongTien.toLocaleString()}đ</strong></p>
    <p>Hình thức: ${don.paymentType || "Không rõ"}</p>
  `;

  popup.classList.remove("hidden");

  // Đóng popup (nút × hoặc Thoát)
  const closePopup = () => popup.classList.add("hidden");
  document.getElementById("btnDongPopup")?.addEventListener("click", closePopup);
  document.getElementById("btnThoatPopup")?.addEventListener("click", closePopup);

  // In lại hóa đơn
  document.getElementById("btnInLai")?.addEventListener("click", () => {
    window.print();
  });
}


