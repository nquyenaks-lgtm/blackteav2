// BlackTea POS v8 final - full logic with payment preview, discount, history filter and expandable history items
let selectedTable = null;
const KEY_MENU = 'BT8_MENU';
const KEY_CATS = 'BT8_CATS';
const KEY_TABLES = 'BT8_TABLES';
const KEY_HISTORY = 'BT8_HISTORY';
const KEY_GUEST = 'BT8_GUEST_CNT';
const FIXED_TABLES = [
  "L1","L2","L3","L4",
  "NT1","NT2",
  "T1","G1","N1",
  "T2","G2","N2",
  "T3","G3","N3",
  "T4","G4","N4"
];

let MENU = JSON.parse(localStorage.getItem(KEY_MENU)) || [
  // --- Cà phê ---
  { id: 1, name: "Cà phê máy (nguyên chất)", price: 15000, cat: "Cà phê" },
  { id: 2, name: "Cà phê phin (đen/sữa)", price: 15000, cat: "Cà phê" },
  { id: 3, name: "Cà phê sữa gòn", price: 20000, cat: "Cà phê" },
  { id: 4, name: "Bạc xỉu", price: 20000, cat: "Cà phê" },
  { id: 5, name: "Cà phê kem trứng", price: 20000, cat: "Cà phê" },
  { id: 6, name: "Cà phê cốt dừa", price: 20000, cat: "Cà phê" },
  { id: 7, name: "Cacao nóng", price: 20000, cat: "Cà phê" },
  { id: 8, name: "Cacao đá", price: 20000, cat: "Cà phê" },

  // --- Trà sữa (M/L) ---
  { id: 9, name: "Trà sữa truyền thống (Size M)", price: 20000, cat: "Trà sữa" },
  { id: 10, name: "Trà sữa truyền thống (Size L)", price: 25000, cat: "Trà sữa" },
  { id: 11, name: "Trà sữa khoai môn (Size M)", price: 20000, cat: "Trà sữa" },
  { id: 12, name: "Trà sữa khoai môn (Size L)", price: 25000, cat: "Trà sữa" },
  { id: 13, name: "Trà sữa socola (Size M)", price: 20000, cat: "Trà sữa" },
  { id: 14, name: "Trà sữa socola (Size L)", price: 25000, cat: "Trà sữa" },
  { id: 15, name: "Chân châu đường đen (Size M)", price: 20000, cat: "Trà sữa" },
  { id: 16, name: "Chân châu đường đen (Size L)", price: 25000, cat: "Trà sữa" },
  { id: 17, name: "Trà đào (Size M)", price: 20000, cat: "Trà sữa" },
  { id: 18, name: "Trà đào (Size L)", price: 25000, cat: "Trà sữa" },
  { id: 19, name: "Trà đào cam sả (Size M)", price: 20000, cat: "Trà sữa" },
  { id: 20, name: "Trà đào cam sả (Size L)", price: 25000, cat: "Trà sữa" },
  { id: 21, name: "Trà vải (Size M)", price: 15000, cat: "Trà sữa" },
  { id: 22, name: "Trà vải (Size L)", price: 20000, cat: "Trà sữa" },
  { id: 23, name: "Trà gừng (Size M)", price: 15000, cat: "Trà sữa" },
  { id: 24, name: "Trà gừng (Size L)", price: 20000, cat: "Trà sữa" },
  { id: 25, name: "Trà lipton ngũ sắc (Size M)", price: 20000, cat: "Trà sữa" },
  { id: 26, name: "Trà lipton ngũ sắc (Size L)", price: 25000, cat: "Trà sữa" },
  { id: 27, name: "Trà thảo mộc (Size M)", price: 20000, cat: "Trà sữa" },
  { id: 28, name: "Trà thảo mộc (Size L)", price: 25000, cat: "Trà sữa" },
  { id: 29, name: "Trà tắc sỉ muối", price: 15000, cat: "Trà sữa" },

  // --- Sinh tố ---
  { id: 30, name: "Sinh tố Dứa", price: 25000, cat: "Sinh tố" },
  { id: 31, name: "Sinh tố Dâu", price: 25000, cat: "Sinh tố" },
  { id: 32, name: "Sinh tố Nho", price: 25000, cat: "Sinh tố" },
  { id: 33, name: "Sinh tố Kiwi", price: 25000, cat: "Sinh tố" },
  { id: 34, name: "Sinh tố Việt quất", price: 25000, cat: "Sinh tố" },
  { id: 35, name: "Sinh tố Xoài", price: 25000, cat: "Sinh tố" },

  // --- Sữa chua ---
  { id: 36, name: "Sữa chua thuần khiết", price: 20000, cat: "Sữa chua" },
  { id: 37, name: "Sữa chua Việt quất", price: 25000, cat: "Sữa chua" },
  { id: 38, name: "Sữa chua Nho", price: 25000, cat: "Sữa chua" },
  { id: 39, name: "Sữa chua Dâu", price: 25000, cat: "Sữa chua" },
  { id: 40, name: "Sữa chua Kiwi", price: 25000, cat: "Sữa chua" },
  { id: 41, name: "Sữa chua Xoài", price: 25000, cat: "Sữa chua" },

  // --- Giải khát ---
  { id: 42, name: "Bò húc", price: 18000, cat: "Giải khát" },
  { id: 43, name: "Nước các loại", price: 15000, cat: "Giải khát" },
  { id: 44, name: "Soda gum", price: 25000, cat: "Giải khát" },
  { id: 45, name: "Cocktail", price: 15000, cat: "Giải khát" },

  // --- Topping ---
  { id: 46, name: "Thêm topping", price: 5000, cat: "Topping" },
  { id: 47, name: "Kem cheese", price: 5000, cat: "Topping" },
  { id: 48, name: "Trứng nướng", price: 5000, cat: "Topping" },
  { id: 49, name: "Kem lăng", price: 5000, cat: "Topping" },
  { id: 50, name: "Kem lăng dừa", price: 15000, cat: "Topping" }
];

let CATEGORIES = JSON.parse(localStorage.getItem(KEY_CATS)) || ["Tất cả","Cà phê","Trà sữa","Sinh tố","Sữa chua","Giải khát","Topping"];
let TABLES = JSON.parse(localStorage.getItem(KEY_TABLES)) || [];
let HISTORY = JSON.parse(localStorage.getItem(KEY_HISTORY)) || [];
let GUEST_CNT = parseInt(localStorage.getItem(KEY_GUEST) || '0');

let currentTable = null;
let createdFromMain = false;
let activeCategory = 'Tất cả';

// helpers
function $(id){ return document.getElementById(id); }
function fmtV(n){ return n.toLocaleString('vi-VN'); }
function nowStr(){ return new Date().toLocaleString('vi-VN'); }
function isoDateKey(t){ const d = new Date(t); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return y+'-'+m+'-'+day; }
function displayDateFromISO(iso){ const parts = iso.split('-'); return parts[2] + '/' + parts[1] + '/' + parts[0]; }
function saveAll(){ localStorage.setItem(KEY_MENU, JSON.stringify(MENU)); localStorage.setItem(KEY_CATS, JSON.stringify(CATEGORIES)); localStorage.setItem(KEY_TABLES, JSON.stringify(TABLES)); localStorage.setItem(KEY_HISTORY, JSON.stringify(HISTORY)); localStorage.setItem(KEY_GUEST, String(GUEST_CNT)); }

// render tables (sắp xếp: L = 4 cột, NT = 2 cột, T/G/N = mỗi bàn 1 hàng dọc)
function renderTables(){
  const div = $('tables');
  div.innerHTML = '';
  if(!TABLES.length){
    div.innerHTML = '<div class="small">Chưa có bàn nào</div>';
    return;
  }

  // nhóm L (4 cột)
  const groupL = TABLES.filter(t => t.name.startsWith('L'))
                       .sort((a,b)=> a.name.localeCompare(b.name));
  if(groupL.length){
    const row = document.createElement('div');
    row.className = 'table-section table-section-4';
    groupL.forEach(t => row.appendChild(makeTableCard(t)));
    div.appendChild(row);
  }

  // nhóm NT (2 cột)
  const groupNT = TABLES.filter(t => t.name.startsWith('NT'))
                        .sort((a,b)=> a.name.localeCompare(b.name));
  if(groupNT.length){
    const row = document.createElement('div');
    row.className = 'table-section table-section-2';
    groupNT.forEach(t => row.appendChild(makeTableCard(t)));
    div.appendChild(row);
  }

  // nhóm T, G, N (mỗi bàn một hàng dọc)
  ['T','G','N'].forEach(prefix=>{
    const g = TABLES.filter(t => t.name.startsWith(prefix))
                    .sort((a,b)=> a.name.localeCompare(b.name));
    g.forEach(t=>{
      const row = document.createElement('div');
      row.className = 'table-section table-section-1';
      row.appendChild(makeTableCard(t));
      div.appendChild(row);
    });
  });
}

// helper tạo thẻ bàn (dùng trong renderTables)
function makeTableCard(t){
  const card = document.createElement('div');
  card.className = 'table-card';

  const info = document.createElement('div');
  info.className = 'table-info';

  const name = document.createElement('div');
  name.className = 'table-name';
  name.innerText = t.name;
  info.appendChild(name);

  if(t.cart && t.cart.length){
    let qty=0, total=0;
    t.cart.forEach(it=>{ qty += it.qty; total += it.qty * it.price; });
    const meta = document.createElement('div');
    meta.className = 'table-meta';
    meta.innerText = qty + ' món • ' + fmtV(total) + ' VND';
    info.appendChild(meta);
  }

  card.appendChild(info);

  // click: highlight + mở bàn
  card.onclick = ()=> {
    document.querySelectorAll('.table-card').forEach(c=>{
      c.classList.remove('active');
    });
    card.classList.add('active');
    openTableFromMain(t.id);
  };

  return card;
}
// add guest
function addGuest(){
  GUEST_CNT += 1;
  const name = 'Khách vãng lai ' + GUEST_CNT;
  const id = Date.now();
  TABLES.push({ id, name, cart: [] });
  saveAll();
  createdFromMain = true;
  openTable(id);
}

function addGuestVisit(){
  GUEST_CNT += 1;
  const name = 'Khách ghé quán ' + GUEST_CNT; // tên mới
  const id = Date.now();
  TABLES.push({ id, name, cart: [] });
  saveAll();
  createdFromMain = true;
  openTable(id);
}

// add named table
function addNamed(){
  const name = $('new-table-name').value.trim();
  if(!name){ return; }
  const id = Date.now();
  TABLES.push({ id, name, cart: [] });
  $('new-table-name').value = '';
  saveAll();
  createdFromMain = true;
  openTable(id);
}

// open from main
function openTableFromMain(id){ createdFromMain = false; openTable(id); }

function openTable(id){
  currentTable = TABLES.find(t=>t.id===id);
  if(!currentTable) return;
  $('table-screen').style.display = 'none';
  $('menu-screen').style.display = 'block';
  $('settings-screen').style.display = 'none';
  $('menu-settings-screen').style.display = 'none';
  $('printer-settings-screen').style.display = 'none';
  $('history-screen').style.display = 'none';
  $('payment-screen').style.display = 'none';
  $('table-title').innerText = currentTable.name;
  renderCategories();
  renderMenuList();
  renderCart();
  if(createdFromMain){
    $('primary-actions').style.display = 'flex';
    $('table-actions').style.display = 'none';
    $('menu-list').style.display = 'block';
  } else {
    $('primary-actions').style.display = 'none';
    $('table-actions').style.display = 'flex';
    $('menu-list').style.display = 'none';
  }
}

// back
function backToTables(){
  currentTable = null; createdFromMain = false;
  $('menu-screen').style.display = 'none';
  $('settings-screen').style.display = 'none';
  $('menu-settings-screen').style.display = 'none';
  $('printer-settings-screen').style.display = 'none';
  $('history-screen').style.display = 'none';
  $('payment-screen').style.display = 'none';
  $('table-screen').style.display = 'block';
  renderTables();
  saveAll();
}

// categories
function renderCategories(){
  const bar = $('category-bar'); bar.innerHTML = '';
  CATEGORIES.forEach(cat=>{
    const b = document.createElement('button'); b.className='category-btn' + (cat===activeCategory ? ' active' : '');
    b.innerText = cat;
    b.onclick = ()=>{ activeCategory = cat; renderMenuList(); renderCategories(); };
    bar.appendChild(b);
  });
}

// menu list
function renderMenuList(){
  const list = $('menu-list'); list.innerHTML = '';
  const items = MENU.filter(m=> activeCategory==='Tất cả' ? true : m.cat===activeCategory);
  items.forEach(item=>{
    const row = document.createElement('div'); row.className='menu-row';
    const left = document.createElement('div'); left.className='menu-left';
    left.innerHTML = '<div class="menu-name">'+item.name+'</div><div class="menu-price">'+fmtV(item.price)+' VND</div>';
    const controls = document.createElement('div'); controls.className='qty-controls';
    const minus = document.createElement('button'); minus.className='btn btn-secondary'; minus.innerText='-'; minus.onclick=(e)=>{ e.stopPropagation(); changeQty(item.id,-1); };
    const qty = document.createElement('span'); qty.id='qty-'+item.id; qty.innerText = getQty(item.id);
    const plus = document.createElement('button'); plus.className='btn btn-secondary'; plus.innerText='+'; plus.onclick=(e)=>{ e.stopPropagation(); changeQty(item.id,1); };
    controls.appendChild(minus); controls.appendChild(qty); controls.appendChild(plus);
    row.appendChild(left); row.appendChild(controls);
    list.appendChild(row);
  });
}

function getQty(id){ if(!currentTable) return 0; const it = currentTable.cart.find(c=>c.id===id); return it ? it.qty : 0; }

function changeQty(id,delta){ if(!currentTable) return; const item = MENU.find(m=>m.id===id); if(!item) return; let it = currentTable.cart.find(c=>c.id===id); if(it){ it.qty += delta; if(it.qty<=0) currentTable.cart = currentTable.cart.filter(c=>c.id!==id); } else if(delta>0){ currentTable.cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 }); } renderMenuList(); renderCart(); }

// cart
function renderCart(){ const ul = $('cart-list'); ul.innerHTML = ''; if(!currentTable || !currentTable.cart.length){ ul.innerHTML = '<div class="small">Chưa có món</div>'; $('total').innerText='0'; return; } let total=0; currentTable.cart.forEach(it=>{ total += it.price*it.qty; const li=document.createElement('li'); li.innerHTML = '<div><div style="font-weight:700">'+it.name+'</div><div class="small">'+fmtV(it.price)+' x '+it.qty+'</div></div><div style="font-weight:700">'+fmtV(it.price*it.qty)+'</div>'; ul.appendChild(li); }); $('total').innerText = fmtV(total); }

// primary actions (new table)
function cancelOrder(){ if(!currentTable) return; currentTable.cart=[]; renderMenuList(); renderCart(); }

function saveOrder(){ if(!currentTable) return; if(!currentTable.cart.length){ return; } TABLES = TABLES.map(t=> t.id===currentTable.id ? currentTable : t); saveAll(); backToTables(); }

// table actions
function addMore(){ if(!currentTable) return; $('menu-list').style.display='block'; createdFromMain = true; $('primary-actions').style.display='flex'; $('table-actions').style.display='none'; renderMenuList(); }

function payTable(){ if(!currentTable) return; if(!currentTable.cart.length){ return; } // open payment screen with bill preview
  $('menu-screen').style.display='none'; $('payment-screen').style.display='block';
  $('pay-table-name').innerText = currentTable.name;
  renderPaymentPreview();
}

// payment preview with discount input
function renderPaymentPreview(){
  const container = $('pay-bill'); container.innerHTML = '';
  if(!currentTable) return;
  let total = 0;
  const table = document.createElement('table'); table.className='payment-table';
  const thead = document.createElement('tr');
  thead.innerHTML = '<th>Tên</th><th style="text-align:right">SL</th><th style="text-align:right">Thành</th>';
  table.appendChild(thead);
  currentTable.cart.forEach(it=>{
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>'+it.name+'</td><td style="text-align:right">'+it.qty+'</td><td style="text-align:right">'+fmtV(it.price*it.qty)+'</td>';
    table.appendChild(tr);
    total += it.price*it.qty;
  });
  container.appendChild(table);
  // show subtotal and set final total
  const sub = document.createElement('div'); sub.style.marginTop='8px'; sub.innerText = 'Tạm tính: ' + fmtV(total) + ' VND';
  container.appendChild(sub);
  $('discount-input').value = '0';
  updateFinalTotal();
}

// compute final total based on discount input
function updateFinalTotal(){
  if(!currentTable) return;
  const subtotal = currentTable.cart.reduce((s,i)=> s + i.price*i.qty, 0);
  const raw = $('discount-input').value.trim();
  let discount = 0;
  if(!raw) discount = 0;
  else if(raw.endsWith('%')){ const pct = parseFloat(raw.slice(0,-1)); if(!isNaN(pct)) discount = subtotal * (pct/100); }
  else { const v = parseFloat(raw.replace(/[^0-9.-]/g,'')); if(!isNaN(v)) discount = v; }
  const final = Math.max(0, Math.round(subtotal - discount));
  $('pay-final-total').innerText = fmtV(final);
  return { subtotal, discount, final };
}

// close payment (back to table screen)
function closePayment(){ $('payment-screen').style.display='none'; $('menu-screen').style.display='block'; renderCart(); renderMenuList(); }

// confirm payment: save to history, print, remove table
function confirmPayment(){
  if(!currentTable) return;
  const { subtotal, discount, final } = updateFinalTotal();
  const rec = { table: currentTable.name, time: nowStr(), iso: isoDateKey(nowStr()), items: currentTable.cart.slice(), subtotal, discount, total: final };
  HISTORY.push(rec);
  saveAll();
  printFinalBill(rec);
  TABLES = TABLES.filter(t=> t.id !== currentTable.id);
  saveAll();
  $('payment-screen').style.display='none';
  backToTables();
}

// print final bill
function printFinalBill(rec){
  const paper = $('paper-size') ? $('paper-size').value : '58';
  const showName = $('print-name') ? $('print-name').checked : true;
  const win = window.open('','_blank');
  let html = '<html><head><meta charset="utf-8"><title>Hóa đơn</title></head><body>';
  html += '<div style="font-family:monospace;width:300px;">';
  if(showName) html += '<h2 style="text-align:center;margin:0">BlackTea</h2>';
  html += '<div style="border-top:1px dashed #000;margin-top:6px"></div>';
  html += '<div>Bàn: ' + rec.table + '</div>';
  html += '<div>Thời gian: ' + rec.time + '</div>';
  html += '<table style="width:100%;border-collapse:collapse;margin-top:6px">';
  rec.items.forEach(i=>{
    const name = i.name.length>20 ? i.name.substring(0,20)+'...' : i.name;
    html += '<tr><td style="padding:6px">'+name+'</td><td style="padding:6px;text-align:right">'+i.qty+'</td><td style="padding:6px;text-align:right">'+fmtV(i.price*i.qty)+'</td></tr>';
  });
  html += '</table>';
  html += '<div style="border-top:1px dashed #000;margin-top:6px"></div>';
  html += '<div>Tạm tính: ' + fmtV(rec.subtotal) + ' VND</div>';
  html += '<div>Chiết khấu: -' + fmtV(Math.round(rec.discount)) + ' VND</div>';
  html += '<div style="text-align:right;font-weight:800;margin-top:6px">TỔNG: ' + fmtV(rec.total) + ' VND</div>';
  html += '</div></body></html>';
  win.document.write(html); win.document.close();
  setTimeout(()=> win.print(), 500);
}

// Settings screens
function openSettings(){ $('table-screen').style.display='none'; $('menu-screen').style.display='none'; $('history-screen').style.display='none'; $('settings-screen').style.display='block'; }
function openMenuSettings(){ $('settings-screen').style.display='none'; $('menu-settings-screen').style.display='block'; renderCategoriesList(); renderMenuSettings(); populateCatSelect(); }
function openPrinterSettings(){ $('settings-screen').style.display='none'; $('printer-settings-screen').style.display='block'; populatePrinterSettings(); }

// menu settings
function renderCategoriesList(){ const ul=$('categories-list'); ul.innerHTML=''; CATEGORIES.forEach((c,i)=>{ const li=document.createElement('li'); li.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><div>'+c+'</div>' + (i>0? '<div><button class="btn btn-secondary" onclick="deleteCategory('+i+')">Xóa</button></div>':'') + '</div>'; ul.appendChild(li); }); }
function addCategory(){ const name = $('new-cat-name').value.trim(); if(!name) return; if(CATEGORIES.includes(name)){ return; } CATEGORIES.push(name); $('new-cat-name').value=''; saveAll(); renderCategoriesList(); renderCategories(); populateCatSelect(); }
function deleteCategory(i){ const cat=CATEGORIES[i]; MENU = MENU.map(m=> m.cat===cat? {...m,cat:'Tất cả'}:m); CATEGORIES.splice(i,1); saveAll(); renderCategoriesList(); renderMenuSettings(); renderMenuList(); renderCategories(); populateCatSelect(); }
function populateCatSelect(){ const sel=$('cat-select'); sel.innerHTML=''; CATEGORIES.forEach(c=>{ const o=document.createElement('option'); o.value=c; o.innerText=c; sel.appendChild(o); }); if(!CATEGORIES.includes(activeCategory)) activeCategory='Tất cả'; }
function renderMenuSettings(){ const ul=$('menu-settings-list'); ul.innerHTML=''; MENU.forEach((m,i)=>{ const li=document.createElement('li'); li.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><div><b>'+m.name+'</b><div class="small">'+m.cat+' • '+fmtV(m.price)+'</div></div><div><button class="btn btn-secondary" onclick="deleteMenu('+i+')">Xóa</button></div></div>'; ul.appendChild(li); }); }
function addMenuItem(){ const name=$('new-item-name').value.trim(); const price=parseInt($('new-item-price').value); const cat=$('cat-select').value||'Tất cả'; if(!name||!price){ return; } MENU.push({ id: Date.now(), name, price, cat }); $('new-item-name').value=''; $('new-item-price').value=''; saveAll(); renderMenuSettings(); renderMenuList(); }
function deleteMenu(i){ MENU.splice(i,1); saveAll(); renderMenuSettings(); renderMenuList(); }
function populatePrinterSettings(){ if($('paper-size')) $('paper-size').value = localStorage.getItem('BT8_PAPER') || '58'; if($('print-name')) $('print-name').checked = (localStorage.getItem('BT8_PRINTNAME')||'true')==='true'; }

// history with filter and expandable items
function openHistory(){ $('table-screen').style.display='none'; $('menu-screen').style.display='none'; $('settings-screen').style.display='none'; $('menu-settings-screen').style.display='none'; $('printer-settings-screen').style.display='none'; $('payment-screen').style.display='none'; $('history-screen').style.display='block'; renderHistory(); }
function clearDateFilter(){ if($('history-date')){ $('history-date').value=''; renderHistory(); } }

function renderHistory(){
  const container = $('history-container'); container.innerHTML = '';
  if(!HISTORY.length){ container.innerHTML = '<div class="small">Chưa có lịch sử</div>'; return; }
  const grouped = {};
  HISTORY.forEach(h=>{
    const key = isoDateKey(h.time || h.iso || h.time);
    if(!grouped[key]) grouped[key]=[];
    grouped[key].push(h);
  });
  const keys = Object.keys(grouped).sort((a,b)=> b.localeCompare(a));
  const filter = $('history-date') && $('history-date').value ? $('history-date').value : null;
  const showKeys = filter ? [filter] : keys;
  showKeys.forEach(k=>{
    if(!grouped[k]) return;
    const dayDiv = document.createElement('div'); dayDiv.className='history-day';
    const header = document.createElement('div'); header.innerHTML = '<b>' + displayDateFromISO(k) + '</b>';
    dayDiv.appendChild(header);
    let dailyTotal = 0;
    grouped[k].forEach(rec=>{
      const it = document.createElement('div'); it.className='history-item';
      const left = document.createElement('div');
      left.innerHTML = '<b>'+rec.table+'</b><div class="small">'+rec.time+'</div>';
      const right = document.createElement('div'); right.className='small'; right.innerText = rec.items.length + ' món • ' + fmtV(rec.total) + ' VND';
      it.appendChild(left); it.appendChild(right);
      it.style.cursor = 'pointer';
      it.addEventListener('click', ()=>{
        if(it._expanded){
          if(it._details) it.removeChild(it._details);
          it._expanded = false;
        } else {
          const details = document.createElement('div'); details.style.marginTop='6px';
          rec.items.forEach(i=>{
            const r = document.createElement('div'); r.className='small'; r.innerText = i.name + ' x' + i.qty + ' • ' + fmtV(i.price*i.qty) + ' VND';
            details.appendChild(r);
          });
          it.appendChild(details);
          it._details = details;
          it._expanded = true;
        }
      });
      dayDiv.appendChild(it);
      dailyTotal += rec.total;
    });
    const foot = document.createElement('div'); foot.className='history-total'; foot.innerText = 'Tổng doanh số: ' + fmtV(dailyTotal) + ' VND';
    dayDiv.appendChild(foot);
    container.appendChild(dayDiv);
  });
}

// hiện danh sách bàn để chọn
function openTableModal() {
  const list = document.createElement('div');
  list.style.position = 'fixed';
  list.style.top = '50%';
  list.style.left = '50%';
  list.style.transform = 'translate(-50%, -50%)';
  list.style.background = '#fff';
  list.style.padding = '20px';
  list.style.zIndex = '1000';
  list.style.border = '1px solid #ccc';
  list.style.borderRadius = '8px';
  list.style.maxWidth = '700px';
  list.style.maxHeight = '80vh';
  list.style.overflowY = 'auto';

  let selectedTable = null; // Lưu bàn đang chọn

  // Hàm tạo nút bàn
  function createTableBtn(name) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.innerText = name;
    btn.style.transition = "0.2s";

    btn.onclick = () => {
      // Bỏ highlight bàn cũ
      if (selectedTable) {
        selectedTable.className = "btn btn-secondary";
      }
      // Highlight bàn mới
      selectedTable = btn;
      btn.className = "btn btn-success";
    };

    return btn;
  }

  // Hàm render nhóm
  function renderGroup(titleText, layoutFn) {
    const group = document.createElement("fieldset");
    group.style.border = "1px solid #ddd";
    group.style.borderRadius = "8px";
    group.style.padding = "10px";
    group.style.marginBottom = "15px";
    group.style.background = "#f9f9f9";

    const legend = document.createElement("legend");
    legend.innerText = titleText;
    legend.style.fontSize = "12px";
    legend.style.padding = "0 6px";
    legend.style.textAlign = "center";
    group.appendChild(legend);

    layoutFn(group);
    list.appendChild(group);
  }

  // Nhóm Lầu
  renderGroup("Bàn trên lầu", (group) => {
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(4, 1fr)";
    grid.style.gap = "10px";
    ["L1","L2","L3","L4"].forEach(name => {
      grid.appendChild(createTableBtn(name));
    });
    group.appendChild(grid);
  });

  // Nhóm Ngoài trời
  renderGroup("Bàn ngoài trời", (group) => {
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(2, 1fr)";
    grid.style.gap = "10px";
    ["NT1","NT2"].forEach(name => {
      grid.appendChild(createTableBtn(name));
    });
    group.appendChild(grid);
  });

  
  // Nhóm T / G / N hiển thị song song
  const threeCols = document.createElement("div");
  threeCols.style.display = "flex";
  threeCols.style.gap = "15px";
  threeCols.style.marginBottom = "15px";
  threeCols.style.alignItems = "flex-start";

  // Hàm tạo group nhỏ cho từng loại bàn
  function renderMiniGroup(titleText, tables) {
    const group = document.createElement("fieldset");
    group.style.border = "1px solid #ddd";
    group.style.borderRadius = "8px";
    group.style.padding = "10px";
    group.style.background = "#f9f9f9";
    group.style.flex = "1"; // để 3 cột đều nhau

    const legend = document.createElement("legend");
    legend.innerText = titleText;
    legend.style.fontSize = "14px";
    legend.style.padding = "0 5px";
    legend.style.textAlign = "center";
    group.appendChild(legend);

    const col = document.createElement("div");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.gap = "8px";

    tables.forEach(name => col.appendChild(createTableBtn(name)));

    group.appendChild(col);
    return group;
  }

  // Thêm 3 group vào hàng ngang
  threeCols.appendChild(renderMiniGroup("Bàn tường", ["T1","T2","T3","T4"]));
  threeCols.appendChild(renderMiniGroup("Bàn giữa", ["G1","G2","G3","G4"]));
  threeCols.appendChild(renderMiniGroup("Bàn nệm", ["N1","N2","N3","N4"]));

  list.appendChild(threeCols);

  // Nút hành động
  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.justifyContent = "flex-end";
  actions.style.gap = "10px";
  actions.style.marginTop = "15px";

  const cancelBtn = document.createElement('button');
  cancelBtn.innerText = 'Huỷ';
  cancelBtn.className = 'btn btn-outline-secondary';
  cancelBtn.onclick = () => document.body.removeChild(list);

  const confirmBtn = document.createElement('button');
  confirmBtn.innerText = 'Chọn bàn';
  confirmBtn.className = 'btn btn-primary';
  confirmBtn.onclick = () => {
    if (!selectedTable) {
      alert("Vui lòng chọn một bàn trước!");
      return;
    }
    const name = selectedTable.innerText;

    if (TABLES.some(t => t.name === name)) {
      alert("Bàn " + name + " đã được mở!");
      return;
    }

    const id = Date.now();
    TABLES.push({ id, name, cart: [] });
    saveAll();
    document.body.removeChild(list);
    createdFromMain = true;
    openTable(id);
  };

  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);
  list.appendChild(actions);

  document.body.appendChild(list);
}



// init
window.addEventListener('load', ()=>{
  if($('guest-btn')) $('guest-btn').addEventListener('click', addGuest);
  if($('guest-visit-btn')) $('guest-visit-btn').addEventListener('click', openTableModal);
  if($('cancel-order-btn')) $('cancel-order-btn').addEventListener('click', cancelOrder);
  if($('save-btn')) $('save-btn').addEventListener('click', saveOrder);
  if($('addmore-btn')) $('addmore-btn').addEventListener('click', addMore);
  if($('pay-btn')) $('pay-btn').addEventListener('click', payTable);
  if($('history-date')) $('history-date').addEventListener('change', ()=> renderHistory());
  const brand = document.getElementById('brand'); if(brand) brand.addEventListener('click', ()=> backToTables());
  renderTables(); renderCategories(); populateCatSelect(); renderMenuSettings(); saveAll();
});
