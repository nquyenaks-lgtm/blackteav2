// ================================
// 🔥 Cấu hình Firestore + Lưu tạm Offline
// ================================
let db;
let hoaDonTamOffline = [];

try {
  db = firebase.firestore();
  console.log("✅ Đã kết nối Firestore");
} catch (err) {
  console.warn("⚠️ Không khởi tạo được Firestore:", err);
}

// Khi có mạng trở lại, đồng bộ dữ liệu
window.addEventListener("online", () => {
  const list = JSON.parse(localStorage.getItem("BT_OFFLINE_QUEUE") || "[]");
  if (list.length === 0) return;

  console.log("🌐 Có mạng trở lại, đang đẩy dữ liệu lên Firestore...");
  list.forEach(async (don) => {
    try {
      await db.collection("orders").doc(String(don.id)).set(don);
      console.log("⬆️ Đã đẩy:", don.name);
    } catch (e) {
      console.error("❌ Lỗi khi đẩy:", e);
    }
  });
  localStorage.removeItem("BT_OFFLINE_QUEUE");
});


// ================================
// 📦 BlackTea POS v2.3 - app.js (đã chỉnh chọn bàn kiểu icon ghế)
// ================================

// 🔢 Biến đếm đơn "Mang đi"
let demMangDi = 0;

// ✅ Tải dữ liệu khi mở trang
window.addEventListener("load", () => {
  try {
    const saved = localStorage.getItem("BT_TABLES");
    if (saved) hoaDonChinh = JSON.parse(saved); // ✅ đổi TABLES → hoaDonChinh
    loadDemMangDi();

    // Gọi render khi khởi động
    if (typeof renderTables === "function") renderTables();
  } catch (err) {
    console.error("Lỗi khi load dữ liệu:", err);
  }
});

// ✅ Lưu dữ liệu ra localStorage
function saveAll() {
  localStorage.setItem("BT_TABLES", JSON.stringify(hoaDonChinh)); // ✅ đổi TABLES → hoaDonChinh
}

// ✅ Lưu và tải bộ đếm mang đi (reset mỗi ngày)
function loadDemMangDi() {
  const data = JSON.parse(localStorage.getItem("BT_DEM_MANGDI") || "{}");
  const today = new Date().toLocaleDateString("vi-VN");

  if (data.date === today) {
    demMangDi = data.count || 0;
  } else {
    demMangDi = 0;
    localStorage.setItem("BT_DEM_MANGDI", JSON.stringify({ date: today, count: 0 }));
  }
}

function saveDemMangDi() {
  const today = new Date().toLocaleDateString("vi-VN");
  localStorage.setItem("BT_DEM_MANGDI", JSON.stringify({ date: today, count: demMangDi }));
}

// ✅ Sinh tên khách theo loại
function taoTenKhach(loai, maBan = "") {
  if (loai === "Take away") {
    demMangDi++;
    saveDemMangDi();
    const soHienThi = demMangDi.toString().padStart(2, "0");
    return `Take away - ${soHienThi}`;
  }

  if (loai.startsWith("Khách tại bàn")) {
    // Lấy số bàn (số phần sau ký hiệu)
    let soBan = "";
    if (maBan.startsWith("L")) soBan = maBan.slice(1); // Lầu
    else if (maBan.startsWith("NT")) soBan = maBan.slice(2); // Ngoài trời
    else if (maBan.startsWith("T")) soBan = maBan.slice(1); // Tường
    else if (maBan.startsWith("G")) soBan = maBan.slice(1); // Giữa
    else if (maBan.startsWith("N")) soBan = maBan.slice(1); // Nệm

    // Thêm 0 đằng trước nếu cần (ví dụ "02")
    const soHienThi = soBan.toString().padStart(2, "0");

    // Ghép tên bàn đẹp mắt
    if (maBan.startsWith("L")) return `Bàn lầu - ${soHienThi}`;
    if (maBan.startsWith("NT")) return `Bàn ngoài trời - ${soHienThi}`;
    if (maBan.startsWith("T")) return `Bàn tường - ${soHienThi}`;
    if (maBan.startsWith("G")) return `Bàn giữa - ${soHienThi}`;
    if (maBan.startsWith("N")) return `Bàn nệm - ${soHienThi}`;
  }

  return loai;
}

// ================================
// 🚀 Khởi động ứng dụng
// ================================
document.addEventListener("DOMContentLoaded", () => {
  khoiTaoUngDung();
});

function khoiTaoUngDung() {
  console.log("🚀 Khởi động BlackTea POS v2.3...");
  hienThiManHinhChinh();
}


// ================================
// 🏠 Màn hình chính
// ================================
function hienThiManHinhChinh() {
  const main = document.querySelector(".main-container");
  main.innerHTML = `
    <div class="btn-group">
      <button id="btnMangDi" class="btn hieuung-noi">Take away</button>
      <button id="btnGheQuan" class="btn hieuung-noi">Khách ghé quán</button>
    </div>

    <div class="table-list"></div>
  `;

  // 🔹 Đồng bộ header + gắn nút Lịch sử
  khoiPhucHeaderMacDinh();

  // 👉 Gắn sự kiện cho nút order
  document.getElementById("btnMangDi").addEventListener("click", () => {
    khoiTaoOrder("Take away");
  });

  document.getElementById("btnGheQuan").addEventListener("click", () => {
    themKhachTaiQuan();
  });

  // 🔹 Render danh sách đơn
  renderTables();
}

// Khôi phục màn hình chính
function khoiPhucHeaderMacDinh() {
  const header = document.querySelector("header");
  if (!header) return;

  header.innerHTML = `
    <h1>BlackTea</h1>
    <div class="header-icons">
      <span id="btnLichSu" class="icon-btn" title="Lịch sử thanh toán">
        <i class="fas fa-clock-rotate-left" style="color:white;"></i>
      </span>
      <span class="icon-btn" title="Cài đặt">
        <i class="fas fa-gear" style="color:white;"></i>
      </span>
    </div>
  `;

  // Gắn lại sự kiện cho nút lịch sử
  document.getElementById("btnLichSu")?.addEventListener("click", hienThiLichSuThanhToan);
}
// ================================
// 🧾 Hiển thị danh sách đơn ngoài màn hình chính
// ================================
function renderTables() {
  const div = document.querySelector(".table-list");
  const dsDon = hoaDonChinh || [];

  if (dsDon.length === 0) {
    div.innerHTML = `<p class="empty-state">Chưa có đơn hàng nào</p>`;
    return;
  }

  // 🔄 Đảo ngược danh sách để đơn mới nhất lên đầu
  const danhSachHienThi = [...dsDon].reverse();

  div.innerHTML = danhSachHienThi
    .map((t, i) => {
      const tongTien = t.cart
        .reduce((a, m) => a + m.price * m.soluong, 0)
        .toLocaleString();
      const soMon = t.cart.length;
      const coGhiChu = t.cart.some((m) => m.note && m.note.trim() !== "");

      const trangThai = t.status || "waiting";
      const iconTrangThai = `<img src="icons/caphe.svg" class="icon-app" alt="Cà phê">`;
      const iconNote = coGhiChu
        ? `<i class="fa-solid fa-note-sticky note"></i>`
        : "";

      return `
        <div class="order-card ${trangThai}" data-index="${i}">
          <div class="order-left">
            <div class="order-name">${t.name}</div>
            <div class="order-info">${soMon} món • ${tongTien}đ</div>
            <div class="order-time">
              ${new Date(t.createdAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div class="status-box ${trangThai}">
            ${iconTrangThai}
            ${iconNote}
          </div>
        </div>
      `;
    })
    .join("");

  // 🧩 Gắn sự kiện click để mở chi tiết
  div.querySelectorAll(".order-card").forEach((card) => {
    card.addEventListener("click", () => {
      const index = parseInt(card.dataset.index);
      const don = danhSachHienThi[index]; // ✅ dùng danh sách sau khi reverse
      if (!don) return;
      moChiTietDon(don.id);
    });
  });
}


// ================================
// 🪑 Popup chọn bàn kiểu icon ghế
// ================================
function themKhachTaiQuan() {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  const popup = document.createElement("div");
  popup.className = "popup-table";

  popup.innerHTML = `
    <fieldset>
      <legend>Bàn trên lầu</legend>
      <div class="group">
        ${["L1","L2","L3","L4"].map(b => `
          <div class="icon-box" onclick="chonBanIcon(this,'${b}')">
            <i class="fas fa-couch"></i>
            <span>${b}</span>
          </div>
        `).join("")}
      </div>
    </fieldset>

    <fieldset>
      <legend>Bàn ngoài trời</legend>
      <div class="group">
        ${["NT1","NT2"].map(b => `
          <div class="icon-box" onclick="chonBanIcon(this,'${b}')">
            <i class="fas fa-couch"></i>
            <span>${b}</span>
          </div>
        `).join("")}
      </div>
    </fieldset>

    <div class="table-row">
      <fieldset class="table-col">
        <legend>Bàn tường</legend>
        <div class="group-vertical">
          ${["T1","T2","T3","T4"].map(b => `
            <div class="icon-box" onclick="chonBanIcon(this,'${b}')">
              <i class="fas fa-couch"></i>
              <span>${b}</span>
            </div>
          `).join("")}
        </div>
      </fieldset>

      <fieldset class="table-col">
        <legend>Bàn giữa</legend>
        <div class="group-vertical">
          ${["G1","G2","G3","G4"].map(b => `
            <div class="icon-box" onclick="chonBanIcon(this,'${b}')">
              <i class="fas fa-couch"></i>
              <span>${b}</span>
            </div>
          `).join("")}
        </div>
      </fieldset>

      <fieldset class="table-col">
        <legend>Bàn nệm</legend>
        <div class="group-vertical">
          ${["N1","N2","N3","N4"].map(b => `
            <div class="icon-box" onclick="chonBanIcon(this,'${b}')">
              <i class="fas fa-couch"></i>
              <span>${b}</span>
            </div>
          `).join("")}
        </div>
      </fieldset>
    </div>

    <div class="popup-actions">
      <button class="btn-cancel hieuung-nhat">Huỷ</button>
      <button class="btn-primary hieuung-noi">Chọn bàn</button>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  let banDuocChon = null;

  // Sự kiện cho các nút
  popup.querySelector(".btn-cancel").addEventListener("click", () => overlay.remove());

  popup.querySelector(".btn-primary").addEventListener("click", () => {
    if (!banDuocChon) {
      hienThongBao("Vui lòng chọn bàn");
      return;
    }
    overlay.remove();

    const tenDon = taoTenKhach("Khách tại bàn", banDuocChon);
    khoiTaoOrder(tenDon);
  });

  // Hàm chọn bàn icon
  window.chonBanIcon = function (el, maBan) {
    popup.querySelectorAll(".icon-box").forEach(e => e.classList.remove("active"));
    el.classList.add("active");
    banDuocChon = maBan;
  };
}

function moChiTietDon(id) {
  const don = hoaDonChinh.find(d => d.id === id);
  if (!don) return;

  const main = document.querySelector(".main-container");
  const header = document.querySelector("header");
  header.innerHTML = `
    <h1>${don.name}</h1>
    <div class="header-icons">
      <button id="btnCloseChiTiet" class="btn-close-order">×</button>
    </div>
  `;

  const createdAt = new Date(don.createdAt);
  const timeStr = createdAt.toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const footerHTML = don.status === "serving"
    ? `
    <div class="order-footer-ct" id="footerChiTietDon">
      <div class="order-buttons">
  <button class="btn-themmon hieuung-nhat">Thêm món</button>
  <button class="btn-primary btn-thanhtoan hieuung-noi">Thanh toán</button>
</div>
    </div>
  `
    : `
      <div class="order-footer-ct" id="footerChiTietDon">
        <div class="slider" id="sliderConfirm">
          <div class="handle">
            <img src="icon/caphe.svg" alt="icon" class="slider-icon">
          </div>
          <div class="text">Kéo để xác nhận</div>
        </div>
      </div>
    `;

  main.innerHTML = `
    <div class="order-detail-ct">
      <div class="invoice-header-ct">
        <div class="invoice-title-ct">Hóa đơn</div>
        <div class="invoice-time-ct">Thời gian tạo: ${timeStr}</div>
      </div>

      <div class="order-content-ct">
        ${don.cart.map(m => {
          let tenGoc = m.name.includes("(")
            ? m.name.split("(")[0].trim()
            : m.name;

          return `
<div class="mon-item">
  <div class="mon-left">
    <div style="display: flex; align-items: center; gap: 4px;">
      <span class="mon-name">${tenGoc}</span>
      ${m.note ? `<span class="mon-note">(${m.note})</span>` : ""}
    </div>
    <div class="mon-sub">
      ${(m.price).toLocaleString()}đ x ${m.soluong}
    </div>
  </div>
  <div class="mon-right">
    ${(m.price * m.soluong).toLocaleString()}đ
  </div>
</div>
          `;
        }).join("")}

        <div class="order-total-ct">
          Tổng cộng: <strong>${don.cart.reduce((a, m) => a + m.price * m.soluong, 0).toLocaleString()}đ</strong>
        </div>
      </div>
    </div>

    ${footerHTML}
  `;

  // 🔙 Nút đóng chi tiết đơn
  const btnClose = document.getElementById("btnCloseChiTiet");
  if (btnClose) {
    btnClose.addEventListener("click", () => {
      khoiPhucHeaderMacDinh();  // ✅ dùng chung
      hienThiManHinhChinh();
      renderTables();
    });
  }

  // ✅ Nếu chưa xác nhận -> khởi tạo slider
  if (typeof khoiTaoSliderXacNhan === 'function' && don.status !== "serving") {
    khoiTaoSliderXacNhan(don, function (donDaXacNhan) {
      donDaXacNhan.status = "serving";

      const slider = document.getElementById("sliderConfirm"); if (slider) slider.style.display = "none"; saveAll(); const footer = document.getElementById("footerChiTietDon"); if (footer) { footer.innerHTML = ` <div class="order-buttons"> <button class="btn-themmon hieuung-nhat">Thêm món</button> <button class="btn-primary btn-thanhtoan hieuung-noi">Thanh toán</button> 
  `;
      }

      // 🔹 Bấm "Thêm món"
      document.querySelector(".btn-themmon")?.addEventListener("click", () => {
        khoiTaoOrder(don.name, don);
        hoaDonTam = [...don.cart, ...hoaDonTam];
        capNhatHoaDon();
      });

      // 🔹 Bấm "Thanh toán"
      document.querySelector(".btn-thanhtoan")?.addEventListener("click", () => {
        moManHinhThanhToan(don);
      });

      renderTables();
    });
  } else if (don.status === "serving") {
    // ✅ Nếu đơn đang phục vụ thì gắn nút luôn
    document.querySelector(".btn-themmon")?.addEventListener("click", () => {
      khoiTaoOrder(don.name, don);
      hoaDonTam = [...don.cart, ...hoaDonTam];
      capNhatHoaDon();
    });

    document.querySelector(".btn-thanhtoan")?.addEventListener("click", () => {
      moManHinhThanhToan(don);
    });
  }
}


function khoiTaoSliderConfirm(don) {
  const container = document.getElementById("sliderConfirm");
  const thumb = container.querySelector(".slider-thumb");
  const bg = container.querySelector(".slider-bg");

  let isDragging = false;
  let startX = 0;

  thumb.addEventListener("mousedown", start);
  thumb.addEventListener("touchstart", start);

  document.addEventListener("mousemove", move);
  document.addEventListener("touchmove", move);

  document.addEventListener("mouseup", end);
  document.addEventListener("touchend", end);

  function start(e) {
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    container.classList.add("active");
  }

  function move(e) {
    if (!isDragging) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    let offset = currentX - startX;
    if (offset < 0) offset = 0;
    if (offset > container.offsetWidth - thumb.offsetWidth) offset = container.offsetWidth - thumb.offsetWidth;
    thumb.style.transform = `translateX(${offset}px)`;
  }

  function end() {
    if (!isDragging) return;
    isDragging = false;

    const successThreshold = container.offsetWidth - thumb.offsetWidth - 10;
    const currentOffset = parseFloat(thumb.style.transform.replace("translateX(", "").replace("px)", "")) || 0;

    if (currentOffset >= successThreshold) {
      bg.innerText = "✅ Đã xác nhận!";
      container.classList.add("confirmed");
      thumb.style.transform = `translateX(${successThreshold}px)`;

      // ✅ Đổi trạng thái đơn → đang phục vụ
      don.status = "serving";
      saveAll();
      setTimeout(() => {
        hienThongBao("Đơn đã chuyển sang 'Đang phục vụ'");
      }, 300);
    } else {
      thumb.style.transform = "translateX(0)";
      container.classList.remove("active");
    }
  }
}

function autoLoadIcons() {
  const mauChinh = getComputedStyle(document.documentElement)
    .getPropertyValue("--mauchinh").trim() || "#00AEEF";

  document.querySelectorAll(".icon-app[data-icon]").forEach(el => {
    const name = el.dataset.icon;
    if (!name) return;

    fetch(`icons/${name}.svg`)
      .then(r => r.text())
      .then(svg => {
        el.style.color = el.style.color || mauChinh;
        svg = svg.replace(/fill="[^"]*"/g, 'fill="currentColor"');
        el.innerHTML = svg;
      });
  });
}
