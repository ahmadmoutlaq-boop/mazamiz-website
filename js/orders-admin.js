/* =========================================================
   مزمز — منطق لوحة الطلبات (orders.html)
   -----------------------------------------------------------
   نفس نمط js/admin.js تمامًا (بوابة كلمة مرور محلية بسيطة،
   والتحقق الحقيقي الملزم يصير من جديد داخل
   netlify/functions/orders.js عند أي قراءة/تعديل/حذف).
   ========================================================= */

const ENDPOINT = '/.netlify/functions/orders';

const gateView = document.getElementById('gateView');
const panelView = document.getElementById('panelView');
const passwordInput = document.getElementById('passwordInput');
const unlockBtn = document.getElementById('unlockBtn');
const gateError = document.getElementById('gateError');
const searchInput = document.getElementById('searchInput');
const sortToggle = document.getElementById('sortToggle');
const refreshBtn = document.getElementById('refreshBtn');
const ordersList = document.getElementById('ordersList');
const emptyMsg = document.getElementById('emptyMsg');

let sessionPassword = '';
let allOrders = [];      // آخر نسخة جاية من الخادم، بدون فلترة
let sortNewestFirst = true;
let autoRefreshTimer = null;

const STATUS_CLASS = {
  'قيد المراجعة': 'new',
  'تم تأكيد الطلب': 'confirmed',
  'جاري التجهيز': 'progress',
  'خرج للتوصيل': 'out',
  'تم التسليم': 'done'
};

function fmtMoney(n){
  return Number(n || 0).toLocaleString('ar-KW', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}
function fmtDate(iso){
  try {
    return new Date(iso).toLocaleString('ar-KW', { dateStyle: 'medium', timeStyle: 'short' });
  } catch { return iso; }
}
function fullAddress(c){
  const parts = [
    c.area && `منطقة ${c.area}`,
    c.block && `قطعة ${c.block}`,
    c.street && `شارع ${c.street}`,
    c.avenue && `جادة ${c.avenue}`,
    c.building && `منزل/بناية ${c.building}`,
    c.floorApt
  ].filter(Boolean);
  return parts.join('، ');
}

// -------- عرض قائمة الطلبات (بعد فلترة/ترتيب) --------
function renderOrders(){
  const query = searchInput.value.trim().toLowerCase();

  let list = allOrders.filter(o => {
    if(!query) return true;
    return o.customer.name.toLowerCase().includes(query) ||
           o.customer.phone.toLowerCase().includes(query);
  });

  list = list.slice().sort((a, b) => {
    const diff = new Date(b.createdAt) - new Date(a.createdAt);
    return sortNewestFirst ? diff : -diff;
  });

  if(list.length === 0){
    ordersList.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    return;
  }
  emptyMsg.classList.add('hidden');

  ordersList.innerHTML = list.map(o => `
    <div class="order-card" data-id="${o.id}">
      <div class="order-head">
        <div>
          <b>#${o.orderNumber || o.id}</b>
          <div class="meta">${fmtDate(o.createdAt)}</div>
        </div>
        <select class="status-select ${STATUS_CLASS[o.status] || ''}" data-id="${o.id}">
          <option ${o.status === 'قيد المراجعة' ? 'selected' : ''}>قيد المراجعة</option>
          <option ${o.status === 'تم تأكيد الطلب' ? 'selected' : ''}>تم تأكيد الطلب</option>
          <option ${o.status === 'جاري التجهيز' ? 'selected' : ''}>جاري التجهيز</option>
          <option ${o.status === 'خرج للتوصيل' ? 'selected' : ''}>خرج للتوصيل</option>
          <option ${o.status === 'تم التسليم' ? 'selected' : ''}>تم التسليم</option>
        </select>
      </div>

      <div class="order-grid">
        <div class="order-block">
          <h5>بيانات العميل</h5>
          <p><b>${o.customer.name}</b><br>
             <a href="tel:${o.customer.phone}">${o.customer.phone}</a></p>
        </div>
        <div class="order-block">
          <h5>عنوان التوصيل</h5>
          <p>${fullAddress(o.customer)}${o.customer.notes ? `<br><span style="color:var(--text-soft);">ملاحظة: ${o.customer.notes}</span>` : ''}</p>
        </div>
      </div>

      <div class="order-block">
        <h5>المنتجات</h5>
        <div class="order-items">
          ${o.items.map(it => `
            <div class="line">
              <span>${it.name} × ${it.qty}</span>
              <span>${fmtMoney(it.lineTotal)} د.ك</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="order-totals">
        <div class="line" style="display:flex; justify-content:space-between;">
          <span style="color:var(--text-soft);">المجموع الفرعي</span>
          <span>${fmtMoney(o.subtotal)} د.ك</span>
        </div>
        ${o.discount > 0 ? `
        <div class="line" style="display:flex; justify-content:space-between;">
          <span style="color:var(--text-soft);">الخصم${o.prizeLabel ? ` (${o.prizeLabel})` : ''}</span>
          <span style="color:var(--green);">-${fmtMoney(o.discount)} د.ك</span>
        </div>` : ''}
        <div class="line" style="display:flex; justify-content:space-between;">
          <span style="color:var(--text-soft);">التوصيل</span>
          <span>${o.deliveryFee === 0 ? 'مجاني' : fmtMoney(o.deliveryFee) + ' د.ك'}</span>
        </div>
        <div class="line grand" style="display:flex; justify-content:space-between;">
          <span>الإجمالي</span>
          <span>${fmtMoney(o.total)} د.ك</span>
        </div>
      </div>

      <div class="order-foot">
        <span style="font-size:12px; color:var(--text-faint);">الدفع: نقدًا عند الاستلام</span>
        <button class="del-btn" data-id="${o.id}">حذف الطلب 🗑</button>
      </div>
    </div>
  `).join('');

  // تغيير الحالة
  ordersList.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', () => updateStatus(sel.dataset.id, sel.value));
  });
  // حذف طلب
  ordersList.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteOrder(btn.dataset.id));
  });
}

// -------- جلب الطلبات من الخادم --------
async function loadOrders(){
  try {
    const res = await fetch(`${ENDPOINT}?password=${encodeURIComponent(sessionPassword)}`);
    const data = await res.json();
    if(!res.ok){
      if(res.status === 401){
        panelView.classList.add('hidden');
        gateView.classList.remove('hidden');
        gateError.textContent = 'كلمة المرور غير صحيحة';
      }
      return;
    }
    allOrders = data.orders || [];
    renderOrders();
  } catch(err){
    // فشل الاتصال — نسيب آخر نسخة معروضة كما هي بدل ما نمسحها
  }
}

async function updateStatus(id, status){
  try {
    await fetch(ENDPOINT, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: sessionPassword, id, status })
    });
    const order = allOrders.find(o => o.id === id);
    if(order) order.status = status;
  } catch(err){
    loadOrders(); // في حال فشل التحديث، نرجع نجيب آخر نسخة صحيحة
  }
}

async function deleteOrder(id){
  if(!confirm('تأكيد حذف هذا الطلب نهائيًا؟')) return;
  try {
    await fetch(ENDPOINT, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: sessionPassword, id })
    });
    allOrders = allOrders.filter(o => o.id !== id);
    renderOrders();
  } catch(err){
    loadOrders();
  }
}

// -------- بوابة الدخول --------
unlockBtn.addEventListener('click', async () => {
  const value = passwordInput.value.trim();
  if(!value){
    gateError.textContent = 'الرجاء إدخال كلمة المرور';
    return;
  }
  sessionPassword = value;
  gateError.textContent = '';
  gateView.classList.add('hidden');
  panelView.classList.remove('hidden');
  await loadOrders();

  // تحديث تلقائي خفيف كل 25 ثانية — حتى تظهر الطلبات الجديدة
  // بدون ما تحتاج تعيد نشر أي شي، وبدون ما تحتاج تضغط تحديث يدويًا كل مرة.
  clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(loadOrders, 25000);
});
passwordInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') unlockBtn.click(); });

searchInput.addEventListener('input', renderOrders);
refreshBtn.addEventListener('click', loadOrders);
sortToggle.addEventListener('click', () => {
  sortNewestFirst = !sortNewestFirst;
  sortToggle.textContent = sortNewestFirst ? 'الأحدث أولاً ↓' : 'الأقدم أولاً ↑';
  renderOrders();
});
