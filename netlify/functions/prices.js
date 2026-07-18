// =========================================================
// مزمز — وظيفة إدارة الأسعار (Netlify Function)
// ---------------------------------------------------------
// هذا الملف يعمل على سيرفر Netlify (مش على متصفح الزائر)،
// ومسؤول عن أمرين بس:
//   1) GET  → يرجّع الأسعار الحالية المخزّنة (أو الأسعار
//             الافتراضية لو ما في تعديل محفوظ لسا).
//   2) POST → يستقبل أسعار جديدة من صفحة admin.html، يتحقق
//             من كلمة المرور، وإذا صحيحة يخزّن الأسعار
//             الجديدة بحيث تظهر لكل زوار الموقع فورًا.
//
// التخزين نفسه يصير عبر Netlify Blobs (تخزين بسيط جوا حساب
// Netlify نفسه، ما يحتاج قاعدة بيانات خارجية ولا إعداد إضافي).
// =========================================================

import { getStore } from '@netlify/blobs';

// ⚠️ غيّر هالكلمة لكلمة مرور خاصة فيك قبل ما تنشر الموقع —
// هاي هي "المفتاح" اللي بيحمي صفحة الأدمن من أي حد يعدّل
// الأسعار بدون إذن. حماية بسيطة تكفي لموقع صغير، مش حماية
// بنكية — لا تشارك هالملف مع أي حد ما تثق فيه.
const ADMIN_PASSWORD = 'mazamiz2026';

// الأسعار الافتراضية (نفس القيم الموجودة بالكود الأساسي).
// إذا ما في أي تعديل محفوظ بعد، هاي القيم اللي ترجع.
const DEFAULT_PRICES = {
  'red-watermelon': 1.75,
  'yellow-watermelon': 2.00,
  'shamam': 1.38,
  'strawberry': 2.25,
  'mango': 2.50,
  'grapes': 1.95
};

export default async (req) => {
  // مخزن باسم "mazamiz-prices" — Netlify Blobs بيديره تلقائيًا
  // بدون أي إعداد إضافي طالما إحنا داخل بيئة Netlify Function.
  const store = getStore({ name: 'mazamiz-prices' });

  // ---------------- قراءة الأسعار (لأي زائر) ----------------
  if (req.method === 'GET') {
    const saved = await store.get('current', { type: 'json' });
    return new Response(JSON.stringify(saved || DEFAULT_PRICES), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // كاش قصير جدًا فقط، عشان أي تعديل من الأدمن ينعكس
        // بسرعة على الموقع بدون ما يحمّل كل زيارة من الصفر.
        'Cache-Control': 'public, max-age=30'
      }
    });
  }

  // ---------------- تحديث الأسعار (الأدمن فقط) ----------------
  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'بيانات غير صالحة' }), { status: 400 });
    }

    // تحقق من كلمة المرور قبل أي تعديل
    if (body.password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'كلمة المرور غير صحيحة' }), { status: 401 });
    }

    // نتأكد إن كل سعر أرسل رقم منطقي (أكبر من صفر) قبل الحفظ،
    // عشان ما ينحفظ شي فاضي أو خطأ بالغلط.
    const prices = body.prices || {};
    const cleaned = {};
    for (const id of Object.keys(DEFAULT_PRICES)) {
      const value = parseFloat(prices[id]);
      if (!isFinite(value) || value <= 0) {
        return new Response(JSON.stringify({ error: `سعر غير صالح لـ ${id}` }), { status: 400 });
      }
      cleaned[id] = Math.round(value * 1000) / 1000; // حتى 3 خانات عشرية (فلس)
    }

    await store.setJSON('current', cleaned);
    return new Response(JSON.stringify({ success: true, prices: cleaned }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
};
