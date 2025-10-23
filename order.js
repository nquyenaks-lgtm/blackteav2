// ===============================
// ☕ ORDER.JS - BlackTea v2.3 (có logic sao động)
// ===============================

let hoaDonTam = [];
let loaiKhachHienTai = "";
let donDangChon = null;


// -------------------------------
function khoiTaoOrder(loaiKhach, donTonTai = null) {
  loaiKhachHienTai = loaiKhach;

  if (donTonTai) {
    donDangChon = donTonTai;
    window.hoaDonGoc = JSON.parse(JSON.stringify(donTonTai.cart));
    window.hoaDonTamGoc = JSON.parse(JSON.stringify(donTonTai.cart));
  } else {
    donDangChon = { 
      id: Date.now(), 
      name: loaiKhach, 
      cart: [], 
      status: "waiting", 
      createdAt: new Date().toISOString()
    };
    window.hoaDonGoc = [];
    window.hoaDonTamGoc = [];
  }

  const header = document.querySelector("header");
  header.innerHTML = `
    <div class="header-left">
      <h1>${loaiKhach}</h1>
    </div>
    <div class="header-right">
      <button id="btnCloseHeader" class="btn-close">×</button>
    </div>
  `;

  document.getElementById("btnCloseHeader").addEventListener("click", () => {
    // ✅ Sử dụng chung khoiPhucHeaderMacDinh() thay vì gắn cứng
    khoiPhucHeaderMacDinh();
    hienThiManHinhChinh();
    renderTables();
  });

  // Phần main và footer giữ nguyên như cũ
  const main = document.querySelector(".main-container");
  main.innerHTML = `
    <div class="order-container">
      <div class="order-search">
        <input type="text" id="timMonInput" placeholder="Tìm món..." oninput="timMon()" />
      </div>

      <div class="order-categories" id="danhMucContainer"></div>

      <div class="order-content">
        <div class="order-list" id="dsMon"></div>
      </div>

      <div class="hoa-don-tam empty" id="hoaDonTam">Chưa có món nào</div>

      <div class="order-footer">
        <div class="order-total">
          <div class="icon-app" data-icon="muahang"></div>
          <span id="tongTien">0đ</span>
        </div>
        <div class="order-buttons">
          <button id="btnDatLai" class="hieuung-nhat">Đặt lại</button>
          <button id="btnLuuDon" class="btn-primary hieuung-noi">Lưu đơn</button>
        </div>
      </div>
    </div>
  `;

  autoLoadIcons();
  taoDanhMuc();
  hienThiMonTheoDanhMuc("");

  document.getElementById("btnDatLai").addEventListener("click", datLai);
  document.getElementById("btnLuuDon").addEventListener("click", luuDon);
  kichHoatTimMon();
  setTimeout(updateOrderOffsets, 100);
}
// -------------------------------
function taoDanhMuc() {
  const dsDanhMuc = [...new Set(MENU.map((m) => m.cat))];
  const container = document.getElementById("danhMucContainer");
  container.innerHTML = "";

  dsDanhMuc.forEach((ten) => {
    const btn = document.createElement("button");
    btn.className = "danh-muc-btn";
    btn.textContent = ten;
    btn.onclick = () => {
      document.querySelectorAll(".danh-muc-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      hienThiMonTheoDanhMuc(ten);
    };
    container.appendChild(btn);
  });
}

// -------------------------------
// Hiển thị danh sách món
function hienThiMonTheoDanhMuc(danhMuc) {
  const dsMon = document.getElementById("dsMon");
  dsMon.innerHTML = "";

  const loc = danhMuc === "" ? MENU : MENU.filter((m) => m.cat === danhMuc);

  loc.forEach((mon) => {
    const sl = timSoLuong(mon.id);

    // ✅ Lấy số lượng gốc (nếu có), an toàn khi hoaDonGoc chưa được khởi tạo
    const slGoc =
      (window.hoaDonGoc && Array.isArray(hoaDonGoc)
        ? hoaDonGoc.find((x) => x.id === mon.id)?.soluong
        : 0) || 0;

    const div = document.createElement("div");
    div.className = "mon-item";
    div.innerHTML = `
      <div>
        <div class="mon-ten">${mon.name}</div>
        <div class="mon-gia">${mon.price.toLocaleString()}₫</div>
      </div>
      <div class="mon-qty" id="qty-${mon.id}">
        <button class="note-btn ${sl > slGoc ? '' : 'faded'}"
                onclick="if(${sl} > ${slGoc}) toggleNotePopup(MENU.find(m => m.id === ${mon.id}), this)">
          <i class="fa-regular fa-star"></i>
        </button>

        <button class="btn-minus ${sl > slGoc ? '' : 'faded'}"
                onclick="if(${sl} > ${slGoc}) giamMon(${mon.id})">
          <i class="fa-solid fa-minus"></i>
        </button>

        <span id="sl-${mon.id}">${sl}</span>

        <button class="btn-plus" onclick="themMon(${mon.id})">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    `;
    dsMon.appendChild(div);
  });
}
// -------------------------------
// Thêm / giảm món
// Thêm / giảm món
function timSoLuong(id) {
  return hoaDonTam
    .filter((m) => m.id === id)
    .reduce((sum, m) => sum + (m.soluong || 0), 0);
}


// ================================
// THÊM MÓN
function themMon(id, note = "") {
  const mon = MENU.find((m) => m.id === id);
  if (!mon) return;

  // Kiểm tra món có cùng id + note
  const tonTai = hoaDonTam.find(
    (m) => m.id === id && (m.note || "") === (note || "")
  );

  if (tonTai) tonTai.soluong++;
  else hoaDonTam.push({ ...mon, soluong: 1, note });

  capNhatHoaDon();

  const slTong = hoaDonTam
    .filter((m) => m.id === id)
    .reduce((sum, m) => sum + m.soluong, 0);

  const slGoc =
    (window.hoaDonGoc && Array.isArray(hoaDonGoc)
      ? hoaDonGoc.find((x) => x.id === id)?.soluong
      : 0) || 0;

  const qtyBox = document.querySelector(`#qty-${id}`);
  if (qtyBox) {
    const noteBtn = qtyBox.querySelector(".note-btn");
    const giamBtn = qtyBox.querySelector(".btn-minus");
    const slEl = document.getElementById(`sl-${id}`);

    if (slEl) slEl.textContent = slTong;

    // ✅ Ẩn/hiện nút trừ và sao theo điều kiện
    if (slTong > slGoc) {
      if (noteBtn) {
        noteBtn.classList.remove("faded");
        noteBtn.setAttribute(
          "onclick",
          `toggleNotePopup(MENU.find(m => m.id === ${id}), this)`
        );
      }
      if (giamBtn) {
        giamBtn.classList.remove("faded");
        giamBtn.setAttribute("onclick", `giamMon(${id})`);
      }
    } else {
      if (noteBtn) {
        noteBtn.classList.add("faded");
        noteBtn.removeAttribute("onclick");
      }
      if (giamBtn) {
        giamBtn.classList.add("faded");
        giamBtn.removeAttribute("onclick");
      }
    }
  }
}

// ================================
// GIẢM MÓN
function giamMon(id, note = "") {
  const noteNorm = (note || "").trim();
  let idx = -1;

  // 1️⃣ Nếu có note: trừ đúng món ghi chú đó
  if (noteNorm) {
    idx = hoaDonTam.findIndex(
      (m) => m.id === id && (m.note || "").trim() === noteNorm && m.isNoteOnly
    );
  }

  // 2️⃣ Nếu không có note: trừ món thường (không ghi chú)
  if (idx === -1 && !noteNorm) {
    idx = hoaDonTam.findIndex((m) => m.id === id && !m.isNoteOnly);
  }

  // 3️⃣ Nếu món thường không còn, thử trừ món ghi chú đầu tiên (đảm bảo tổng luôn giảm)
  if (idx === -1) {
    idx = hoaDonTam.findIndex((m) => m.id === id && m.isNoteOnly);
  }

  if (idx > -1) {
    hoaDonTam[idx].soluong--;
    if (hoaDonTam[idx].soluong <= 0) hoaDonTam.splice(idx, 1);
  }

  capNhatHoaDon();

  // ✅ Tính lại sau khi trừ
  const slTong = hoaDonTam
    .filter((m) => m.id === id)
    .reduce((sum, m) => sum + m.soluong, 0);

  const slGoc =
    (window.hoaDonGoc && Array.isArray(hoaDonGoc)
      ? hoaDonGoc.find((x) => x.id === id)?.soluong
      : 0) || 0;

  const qtyBox = document.querySelector(`#qty-${id}`);
  if (qtyBox) {
    const noteBtn = qtyBox.querySelector(".note-btn");
    const giamBtn = qtyBox.querySelector(".btn-minus");
    const slEl = document.getElementById(`sl-${id}`);

    if (slEl) slEl.textContent = slTong;

    // ✅ Ẩn nút khi về lại đúng số lượng gốc
    if (slTong > slGoc) {
      if (noteBtn) {
        noteBtn.classList.remove("faded");
        noteBtn.setAttribute(
          "onclick",
          `toggleNotePopup(MENU.find(m => m.id === ${id}), this)`
        );
      }
      if (giamBtn) {
        giamBtn.classList.remove("faded");
        giamBtn.setAttribute("onclick", `giamMon(${id})`);
      }
    } else {
      if (noteBtn) {
        noteBtn.classList.add("faded");
        noteBtn.removeAttribute("onclick");
      }
      if (giamBtn) {
        giamBtn.classList.add("faded");
        giamBtn.removeAttribute("onclick");
      }
    }
  }
}
// ================================
// CẬP NHẬT HÓA ĐƠN
function capNhatHoaDon() {
  const hdDiv = document.getElementById("hoaDonTam");
  hdDiv.innerHTML = "";
  hdDiv.classList.remove("empty");

  if (hoaDonTam.length === 0) {
    hdDiv.classList.add("empty");
    hdDiv.textContent = "Chưa có món nào";
  } else {
    hoaDonTam.forEach((m) => {
      const dong = document.createElement("div");
      dong.className = "hoa-don-item";

      // ✅ Nếu tên đã có ngoặc thì không chèn note nữa
      const hienTen = m.name.includes("(")
        ? m.name
        : m.note
        ? `${m.name} (${m.note})`
        : m.name;

      dong.innerHTML = `
        <span>
          ${hienTen} x${m.soluong}
        </span>
        <span>${(m.price * m.soluong).toLocaleString()}₫</span>
      `;

      hdDiv.appendChild(dong);
    });
  }

  // ✅ Tổng tiền
  const tong = hoaDonTam.reduce((t, m) => t + m.price * m.soluong, 0);
  document.getElementById("tongTien").textContent = `${tong.toLocaleString()}₫`;

  // ✅ Cập nhật lại số lượng tổng trong menu
  MENU.forEach((mon) => {
    const slTong = hoaDonTam
      .filter((m) => m.id === mon.id)
      .reduce((sum, m) => sum + m.soluong, 0);
    const slEl = document.getElementById(`sl-${mon.id}`);
    if (slEl) slEl.textContent = slTong;
  });
}

// -------------------------------
function datLai() {
  // ✅ Reset hoaDonTam về trạng thái ban đầu khi mở popup
  if (window.hoaDonTamGoc) {
    hoaDonTam = window.hoaDonTamGoc.map(m => ({ ...m })); // deep copy
  } else {
    hoaDonTam = [];
  }

  capNhatHoaDon();
  hienThiMonTheoDanhMuc("");
}
// 🔥 Hàm lưu đơn hàng lên Firestore hoặc cache offline
async function saveToFirebase(don) {
  try {
    if (!db) throw new Error("Firestore chưa sẵn sàng");

    await db.collection("orders").doc(String(don.id)).set(don);
    console.log("✅ Đã lưu lên Firestore:", don.name);
  } catch (err) {
    console.warn("⚠️ Mất mạng, lưu tạm offline:", err);
    hoaDonTamOffline.push(don);
    localStorage.setItem("BT_OFFLINE_QUEUE", JSON.stringify(hoaDonTamOffline));
  }
}

async function luuDon() {
  if (hoaDonTam.length === 0) {
    hienThongBao("Chưa có món nào để lưu");
    return;
  }

  if (loaiKhachHienTai === "Take away") {
    loaiKhachHienTai = taoTenKhach("Take away");
  }

  let donMoi;

  if (
    typeof donDangChon !== "undefined" &&
    donDangChon &&
    hoaDonChinh.some((d) => d.id === donDangChon.id)
  ) {
    const index = hoaDonChinh.findIndex((d) => d.id === donDangChon.id);
    if (index !== -1) {
      hoaDonChinh[index].cart = [...hoaDonTam];
      hoaDonChinh[index].updatedAt = Date.now();
      donMoi = hoaDonChinh[index];
    }
  } else {
    donMoi = {
      id: Date.now(),
      name: loaiKhachHienTai,
      cart: [...hoaDonTam],
      createdAt: Date.now(),
      status: "waiting",
    };
    hoaDonChinh.push(donMoi);
  }

  // 🔥 Thay vì saveAll() → gọi Firestore hoặc lưu tạm offline
  await saveToFirebase(donMoi);

  hoaDonTam = [];
  capNhatHoaDon();

  hienThongBao(" Đã lưu đơn ");

  // 🔹 Trở về màn hình chính với header đồng bộ
  khoiPhucHeaderMacDinh();
  hienThiManHinhChinh();
  renderTables();
}


// -------------------------------
// Tìm món theo từ khóa
function timMon() {
  const input = document.getElementById("timMonInput");
  if (!input) return;

  const keyword = input.value.toLowerCase().trim();
  const items = document.querySelectorAll("#dsMon .mon-item");

  // 👉 Hàm bỏ dấu + chuẩn hóa
  const normalize = (str) => str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

  const kw = normalize(keyword);

  // 🧩 Nếu chưa gõ gì → hiện tất cả
  if (kw === "") {
    items.forEach(item => item.style.display = "");
    return;
  }

  items.forEach(item => {
    const tenMon = item.querySelector(".mon-ten")?.textContent || "";
    const text = normalize(tenMon);
    const initials = text.split(" ").map(w => w[0]).join("");
    const compactText = text.replace(/\s+/g, "");

    const match =
      compactText.includes(kw) ||
      text.includes(kw) ||
      initials.includes(kw);

    item.style.display = match ? "" : "none";
  });
}


// =============================================
// 📏 Tự tính khoảng trống hiển thị cho danh sách món
// =============================================
function updateOrderOffsets() {
  const header = document.querySelector('header');
  const search = document.querySelector('.order-search');
  const categories = document.querySelector('.order-categories');
  const hoaDon = document.querySelector('.hoa-don-tam');
  const footer = document.querySelector('.order-footer');

  const gap = 10;
  const headerH = header ? header.offsetHeight : 0;
  const searchH = search ? search.offsetHeight : 0;
  const catH = categories ? categories.offsetHeight : 0;
  const hoaDonH = hoaDon ? hoaDon.offsetHeight : 0;
  const footerH = footer ? footer.offsetHeight : 0;

  // top = header + 10 + search + 10 + categories + 10
  const topPx = headerH + gap + searchH + gap + catH + gap;
  // bottom = hoa-don + 10 + footer + 10
  const bottomPx = hoaDonH + gap + footerH + gap;

  document.documentElement.style.setProperty('--order-top', `${topPx}px`);
  document.documentElement.style.setProperty('--order-bottom', `${bottomPx}px`);
}

// Sau khi render xong popup, gọi updateOffset:
window.addEventListener('resize', updateOrderOffsets);



// === Tự động bỏ lọc danh mục khi click vào ô tìm món ===
function kichHoatTimMon() {
  const input = document.getElementById("timMonInput");
  if (!input) return;

  // Xóa listener cũ nếu có (tránh gắn trùng khi gọi lại)
  input.removeEventListener("focus", onFocusSearch);

  function onFocusSearch() {
    // Bỏ trạng thái nút danh mục đang chọn
    document.querySelectorAll(".danh-muc-btn.active").forEach(btn => {
      btn.classList.remove("active");
    });

    // Gọi lại toàn bộ danh sách món (bỏ lọc danh mục)
    if (typeof hienThiMonTheoDanhMuc === "function") {
      hienThiMonTheoDanhMuc(""); // truyền "" để hiển tất cả
    }
  }

  input.addEventListener("focus", onFocusSearch);
}

// Gọi lặp lại để đảm bảo input tồn tại (vì đôi khi DOM tạo sau load)
document.addEventListener("DOMContentLoaded", () => {
  kichHoatTimMon();
  // kiểm tra lại sau một chút
  setTimeout(kichHoatTimMon, 500);
  setTimeout(kichHoatTimMon, 1500);
});

























