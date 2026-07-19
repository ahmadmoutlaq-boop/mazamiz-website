// =========================================================
// مزمز — وظيفة إدارة الطلبات (Netlify Function)
// ---------------------------------------------------------
// نفس فكرة netlify/functions/prices.js تمامًا، بس هون بنخزّن
// الطلبات بدل الأسعار. أربع عمليات:
//   1) POST   → أي زائر يقدر يرسل طلب جديد (checkout.html)
//   2) GET    → الأدمن بس (لوحة "الطلبات" في orders.html)
//   3) PATCH  → الأدمن بس، لتغيير حالة طلب معيّن
//   4) DELETE → الأدمن بس، لحذف طلب معيّن
//
// التخزين عبر Netlify Blobs — كل الطلبات محفوظة كمصفوفة JSON
// واحدة تحت مفتاح "all"، وهاد كافي تمامًا لحجم متجر صغير/متوسط.
// =========================================================

import { getStore } from '@netlify/blobs';

// ⚠️ نفس كلمة المرور المستخدمة بملف prices.js — لو غيّرتها هناك
// لازم تغيّرها هون كمان حتى تقدر تفتح لوحة الطلبات وتديرها.
const ADMIN_PASSWORD = 'mazamiz2026';

const VALID_STATUSES = ['قيد المراجعة', 'تم تأكيد الطلب', 'جاري التجهيز', 'خرج للتوصيل', 'تم التسليم'];

function jsonResponse(body, status = 200){
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// توليد رقم طلب مختصر وسهل القراءة، مبني على الوقت الحالي —
// كافي لتفادي التكرار بدون الحاجة لعدّاد مركزي معقّد.
function generateOrderNumber(){
  return 'MZ-' + Date.now().toString(36).toUpperCase();
}

export default async (req) => {
  const store = getStore({ name: 'mazamiz-orders' });

  // ---------------- إنشاء طلب جديد (أي زائر) ----------------
  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'بيانات غير صالحة' }, 400);
    }

    const c = body.customer || {};
    const items = Array.isArray(body.items) ? body.items : [];

    // تحقق من الحقول الإلزامية فقط (نفس الحقول المطلوبة بالنموذج) —
    // أي طلب ناقص هالمعلومات يُرفض بدل ما ينحفظ فاضي أو غير مفهوم.
    const requiredFields = ['name', 'phone', 'area', 'block', 'street', 'building'];
    for (const field of requiredFields) {
      if (!c[field] || !String(c[field]).trim()) {
        return jsonResponse({ error: `الحقل "${field}" مطلوب` }, 400);
      }
    }
    if (items.length === 0) {
      return jsonResponse({ error: 'السلة فارغة' }, 400);
    }

    const order = {
      id: generateOrderNumber(),
      orderNumber: null, // يُعبّى تحت بنفس القيمة، موجود لسهولة القراءة بالواجهة
      // اسم المستخدم (إذا كان مسجّل دخول وقت الطلب) — يُستخدم فقط
      // لعرض الطلب لاحقًا بصفحة "طلباتي" الخاصة فيه. حساب "لأغراض
      // الشكل فقط" ولا يوجد أي تحقق خادمي من هويته الحقيقية.
      username: body.username ? String(body.username).trim() : null,
      status: VALID_STATUSES[0],
      createdAt: new Date().toISOString(),
      items: items.map(it => ({
        id: String(it.id || ''),
        name: String(it.name || ''),
        brand: String(it.brand || ''),
        unitPrice: Number(it.unitPrice) || 0,
        qty: Number(it.qty) || 0,
        lineTotal: Number(it.lineTotal) || 0
      })),
      subtotal: Number(body.subtotal) || 0,
      discount: Number(body.discount) || 0,
      prizeLabel: body.prizeLabel || null,
      deliveryFee: Number(body.deliveryFee) || 0,
      total: Number(body.total) || 0,
      paymentMethod: 'cash_on_delivery',
      customer: {
        name: String(c.name).trim(),
        phone: String(c.phone).trim(),
        area: String(c.area).trim(),
        block: String(c.block).trim(),
        street: String(c.street).trim(),
        avenue: c.avenue ? String(c.avenue).trim() : '',
        building: String(c.building).trim(),
        floorApt: c.floorApt ? String(c.floorApt).trim() : '',
        notes: c.notes ? String(c.notes).trim() : ''
      }
    };
    order.orderNumber = order.id;

    const existing = (await store.get('all', { type: 'json' })) || [];
    existing.push(order);
    await store.setJSON('all', existing);

    return jsonResponse({ success: true, id: order.id, orderNumber: order.orderNumber });
  }

  // ---------------- عرض طلبات مستخدم معيّن (عام، بدون كلمة مرور) ----------------
  // تستخدمها صفحة my-orders.html — تعرض فقط الطلبات المرتبطة بنفس
  // اسم المستخدم المطابق تمامًا، وليس كل الطلبات، فهي أخف حساسية
  // من مسار الأدمن الكامل تحت. بما إن نظام الحسابات نفسه "لأغراض
  // الشكل فقط" (بدون بريد/هاتف/تحقق)، هذا المستوى من الخصوصية كافٍ.
  if (req.method === 'GET' && new URL(req.url).searchParams.get('username')) {
    const username = new URL(req.url).searchParams.get('username');
    const orders = (await store.get('all', { type: 'json' })) || [];
    const mine = orders
      .filter(o => o.username === username)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return jsonResponse({ orders: mine });
  }

  // كل العمليات الجاية (قراءة كاملة/تعديل/حذف) خاصة بالأدمن فقط —
  // نتحقق من كلمة المرور قبل أي شي.
  const password = req.method === 'GET'
    ? new URL(req.url).searchParams.get('password')
    : (await req.clone().json().catch(() => ({}))).password;

  if (password !== ADMIN_PASSWORD) {
    return jsonResponse({ error: 'كلمة المرور غير صحيحة' }, 401);
  }

  // ---------------- عرض كل الطلبات (الأدمن) ----------------
  if (req.method === 'GET') {
    const orders = (await store.get('all', { type: 'json' })) || [];
    // الأحدث أولاً افتراضيًا — لوحة الطلبات نفسها فيها زر لعكس الترتيب
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return jsonResponse({ orders });
  }

  // ---------------- تغيير حالة طلب (الأدمن) ----------------
  if (req.method === 'PATCH') {
    const body = await req.json();
    if (!VALID_STATUSES.includes(body.status)) {
      return jsonResponse({ error: 'حالة غير صالحة' }, 400);
    }
    const orders = (await store.get('all', { type: 'json' })) || [];
    const order = orders.find(o => o.id === body.id);
    if (!order) return jsonResponse({ error: 'الطلب غير موجود' }, 404);
    order.status = body.status;
    await store.setJSON('all', orders);
    return jsonResponse({ success: true });
  }

  // ---------------- حذف طلب (الأدمن) ----------------
  if (req.method === 'DELETE') {
    const body = await req.json();
    const orders = (await store.get('all', { type: 'json' })) || [];
    const filtered = orders.filter(o => o.id !== body.id);
    await store.setJSON('all', filtered);
    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: 'Method Not Allowed' }, 405);
};
