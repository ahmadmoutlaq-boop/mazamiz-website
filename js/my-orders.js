/* =========================================================
   مزمز — منطق صفحة "طلباتي" (my-orders.html)
   -----------------------------------------------------------
   يجيب فقط الطلبات المرتبطة باسم المستخدم المسجّل دخوله حاليًا
   (عبر GET /.netlify/functions/orders?username=...، بدون كلمة
   مرور — انظر التعليق بأعلى orders.js لشرح مستوى الخصوصية).
   ========================================================= */

const STATUS_BADGE_CLASS = {
  'قيد المراجعة': 'new',
  'تم تأكيد الطلب': 'confirmed',
  'جاري التجهيز': 'progress',
  'خرج للتوصيل': 'out',
  'تم التسليم': 'done'
};
const STATUS_I18N_KEY = {
  'قيد المراجعة': 'status.pending',
  'تم تأكيد الطلب': 'status.confirmed',
  'جاري التجهيز': 'status.preparing',
  'خرج للتوصيل': 'status.out',
  'تم التسليم': 'status.delivered'
};

function statusLabel(status){
  const lang = (window.MazamizI18n && window.MazamizI18n.getLang()) || 'ar';
  const key = STATUS_I18N_KEY[status];
  if(window.MazamizI18n && key) return window.MazamizI18n.dict[lang][key] || status;
  return status;
}

function fmtOrderDate(iso){
  const lang = (window.MazamizI18n && window.MazamizI18n.getLang()) || 'ar';
  try {
    return new Date(iso).toLocaleString(lang === 'en' ? 'en-US' : 'ar-KW', { dateStyle: 'medium', timeStyle: 'short' });
  } catch { return iso; }
}

let myOrdersCache = [];

function renderMyOrders(){
  const list = document.getElementById('ordersList');
  const emptyMsg = document.getElementById('emptyMsg');
  if(!list) return;

  if(myOrdersCache.length === 0){
    list.innerHTML = '';
    emptyMsg.classList.remove('hidden');
    return;
  }
  emptyMsg.classList.add('hidden');

  const lang = (window.MazamizI18n && window.MazamizI18n.getLang()) || 'ar';
  const dict = window.MazamizI18n ? window.MazamizI18n.dict[lang] : {};

  list.innerHTML = myOrdersCache.map(o => `
    <div class="mo-order">
      <div class="mo-head">
        <div>
          <b>#${o.orderNumber || o.id}</b>
          <div class="meta">${fmtOrderDate(o.createdAt)}</div>
        </div>
        <span class="mo-badge ${STATUS_BADGE_CLASS[o.status] || 'new'}">${statusLabel(o.status)}</span>
      </div>
      <div class="mo-items">
        ${o.items.map(it => `${getProductNameFallback(it)} × ${it.qty}`).join('، ')}
      </div>
      <div class="mo-total">
        <span>${dict['myorders.total'] || 'الإجمالي'}</span>
        <span>${Number(o.total).toLocaleString(lang === 'en' ? 'en-US' : 'ar-KW', { minimumFractionDigits: 3 })} ${lang === 'en' ? 'KWD' : 'د.ك'}</span>
      </div>
    </div>
  `).join('');
}

// أسماء المنتجات بالطلبات المخزّنة عربية دائمًا (هيك انحفظت وقت
// الطلب)، فبنحاول نلاقي مقابلها المترجم عبر معرّف المنتج إذا
// كانت اللغة الحالية إنجليزية ولسا المنتج موجود بالكتالوج.
function getProductNameFallback(item){
  if(typeof PRODUCTS !== 'undefined' && typeof getProductName === 'function' && PRODUCTS[item.id]){
    return getProductName(item.id);
  }
  return item.name;
}

async function loadMyOrders(){
  const username = getSession();
  const loggedOutView = document.getElementById('loggedOutView');
  const ordersView = document.getElementById('ordersView');
  if(!username){
    loggedOutView.classList.remove('hidden');
    ordersView.classList.add('hidden');
    return;
  }
  loggedOutView.classList.add('hidden');
  ordersView.classList.remove('hidden');

  try {
    const res = await fetch(`/.netlify/functions/orders?username=${encodeURIComponent(username)}`);
    const data = await res.json();
    myOrdersCache = data.orders || [];
  } catch(err){
    myOrdersCache = [];
  }
  renderMyOrders();
}

document.addEventListener('DOMContentLoaded', loadMyOrders);
