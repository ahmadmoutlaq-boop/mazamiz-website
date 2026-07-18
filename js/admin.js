/* =========================================================
   مزمز — منطق صفحة الأدمن (admin.html)
   -----------------------------------------------------------
   هذا الملف مسؤول فقط عن:
   1) التحقق من كلمة المرور محليًا بشكل مبدئي (تجربة أسهل
      للمستخدم)، مع العلم أن التحقق "الحقيقي" والملزم يصير
      من جديد داخل netlify/functions/prices.js عند الحفظ —
      حتى لو حد عدّل هالملف بالمتصفح، ما رح يقدر يحفظ سعر
      بدون كلمة المرور الصحيحة لأن السيرفر هو اللي يتحقق.
   2) جلب الأسعار الحالية من الخادم عند فتح اللوحة.
   3) إرسال الأسعار الجديدة للخادم عند الضغط على "حفظ".
   ========================================================= */

const ENDPOINT = '/.netlify/functions/prices';

// خرائط عناصر الإدخال ↔ معرّف المنتج (نفس المعرّفات
// المستخدمة بكل الموقع في js/main.js → PRODUCTS)
const FIELD_MAP = {
  'priceRed': 'red-watermelon',
  'priceYellow': 'yellow-watermelon',
  'priceShamam': 'shamam'
};

const gateView = document.getElementById('gateView');
const panelView = document.getElementById('panelView');
const passwordInput = document.getElementById('passwordInput');
const unlockBtn = document.getElementById('unlockBtn');
const gateError = document.getElementById('gateError');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');

// كلمة المرور تُحفظ هون فقط لمدة الجلسة الحالية بالمتصفح
// (تختفي إذا سكرت التاب) — تُستخدم لاحقًا مع كل طلب حفظ.
let sessionPassword = '';

// -------- تحميل الأسعار الحالية من الخادم --------
async function loadCurrentPrices(){
  try {
    const res = await fetch(ENDPOINT);
    const prices = await res.json();
    for (const [inputId, productId] of Object.entries(FIELD_MAP)) {
      const el = document.getElementById(inputId);
      if (el && prices[productId] !== undefined) {
        el.value = prices[productId];
      }
    }
  } catch (err) {
    saveStatus.textContent = 'تعذّر تحميل الأسعار الحالية — تحقق من الاتصال';
    saveStatus.className = 'admin-status err';
  }
}

// -------- فتح اللوحة بعد كلمة مرور --------
unlockBtn.addEventListener('click', async () => {
  const value = passwordInput.value.trim();
  if (!value) {
    gateError.textContent = 'الرجاء إدخال كلمة المرور';
    return;
  }
  sessionPassword = value;
  gateError.textContent = '';
  gateView.classList.add('hidden');
  panelView.classList.remove('hidden');
  await loadCurrentPrices();
});

// السماح بالضغط على Enter بدل الضغط على الزر
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') unlockBtn.click();
});

// -------- حفظ الأسعار الجديدة --------
saveBtn.addEventListener('click', async () => {
  const prices = {};
  for (const [inputId, productId] of Object.entries(FIELD_MAP)) {
    prices[productId] = document.getElementById(inputId).value;
  }

  saveBtn.disabled = true;
  saveStatus.textContent = 'جارٍ الحفظ...';
  saveStatus.className = 'admin-status';

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: sessionPassword, prices })
    });
    const data = await res.json();

    if (res.ok) {
      saveStatus.textContent = '✅ تم الحفظ والنشر بنجاح';
      saveStatus.className = 'admin-status ok';
    } else {
      // كلمة مرور غلط أو قيمة سعر غير صالحة — نرجّع المستخدم
      // لبوابة كلمة المرور إذا كانت هي المشكلة تحديدًا.
      saveStatus.textContent = '❌ ' + (data.error || 'حدث خطأ غير متوقع');
      saveStatus.className = 'admin-status err';
      if (res.status === 401) {
        panelView.classList.add('hidden');
        gateView.classList.remove('hidden');
        gateError.textContent = 'كلمة المرور غير صحيحة، حاول مرة أخرى';
      }
    }
  } catch (err) {
    saveStatus.textContent = '❌ تعذّر الاتصال بالخادم';
    saveStatus.className = 'admin-status err';
  }

  saveBtn.disabled = false;
});
