/* =========================================================
   مزمز — منطق صفحة إتمام الطلب (checkout.html)
   -----------------------------------------------------------
   يعتمد هذا الملف على أشياء معرّفة مسبقًا في js/main.js (نفس
   الصفحة تحمّل الملفين بالترتيب: main.js أولاً ثم checkout.js)
   وتحديدًا: المتغيّر العام `cart`، الكائن `PRODUCTS`، ودوال
   fmt / cartTotal / computePrizeDiscount / getActivePrize /
   markPrizeUsed / saveCartToStorage / renderCart.
   ========================================================= */

// رسوم توصيل ثابتة كمثال — غيّرها هون إذا بدك رقم مختلف.
// تُلغى تلقائيًا إذا كانت جائزة العميل النشطة "توصيل مجاني".
const DELIVERY_FEE = 1.000;

function getDeliveryFee(){
  const prize = getActivePrize();
  return (prize && prize.type === 'free_shipping') ? 0 : DELIVERY_FEE;
}

function renderOrderSummary(){
  const itemsBox = document.getElementById('orderItems');
  if(!itemsBox) return;

  itemsBox.innerHTML = Object.entries(cart).map(([id, qty]) => {
    const p = PRODUCTS[id];
    const lineTotal = p.price * qty;
    return `
      <div style="display:flex; justify-content:space-between; gap:10px; font-size:13.5px;">
        <span>${p.name} <span style="color:var(--text-faint);">× ${qty}</span></span>
        <span>${fmt(lineTotal)} د.ك</span>
      </div>`;
  }).join('');

  const subtotal = cartTotal();
  const discount = computePrizeDiscount(subtotal);
  const delivery = getDeliveryFee();
  const total = Math.max(0, subtotal - discount + delivery);

  document.getElementById('sumSubtotal').textContent = `${fmt(subtotal)} د.ك`;
  document.getElementById('sumDelivery').textContent = delivery === 0 ? 'مجاني 🎉' : `${fmt(delivery)} د.ك`;
  document.getElementById('sumTotal').textContent = `${fmt(total)} د.ك`;

  const discountRow = document.getElementById('sumDiscountRow');
  if(discount > 0){
    discountRow.style.display = 'flex';
    document.getElementById('sumDiscount').textContent = `-${fmt(discount)} د.ك`;
  } else {
    discountRow.style.display = 'none';
  }

  const prize = getActivePrize();
  const banner = document.getElementById('prizeSummaryBanner');
  if(prize && (prize.type === 'percent' || prize.type === 'free_shipping')){
    banner.classList.remove('hidden');
    document.getElementById('prizeSummaryLabel').textContent = `جائزتك مطبّقة: ${prize.label}`;
    document.getElementById('prizeSummaryNote').textContent =
      prize.type === 'percent' ? `تم خصم ${fmt(discount)} د.ك من الإجمالي` : 'تم إلغاء رسوم التوصيل';
  } else {
    banner.classList.add('hidden');
  }
}

function buildOrderPayload(){
  const subtotal = cartTotal();
  const discount = computePrizeDiscount(subtotal);
  const delivery = getDeliveryFee();
  const prize = getActivePrize();

  return {
    items: Object.entries(cart).map(([id, qty]) => ({
      id,
      name: PRODUCTS[id].name,
      brand: PRODUCTS[id].brand,
      unitPrice: PRODUCTS[id].price,
      qty,
      lineTotal: Math.round(PRODUCTS[id].price * qty * 1000) / 1000
    })),
    subtotal: Math.round(subtotal * 1000) / 1000,
    discount: Math.round(discount * 1000) / 1000,
    prizeLabel: prize ? prize.label : null,
    deliveryFee: delivery,
    total: Math.round(Math.max(0, subtotal - discount + delivery) * 1000) / 1000,
    customer: {
      name: document.getElementById('custName').value.trim(),
      phone: document.getElementById('custPhone').value.trim(),
      area: document.getElementById('area').value.trim(),
      block: document.getElementById('block').value.trim(),
      street: document.getElementById('street').value.trim(),
      avenue: document.getElementById('avenue').value.trim(),
      building: document.getElementById('building').value.trim(),
      floorApt: document.getElementById('floorApt').value.trim(),
      notes: document.getElementById('notes').value.trim()
    },
    paymentMethod: 'cash_on_delivery'
  };
}

function initCheckoutPage(){
  const emptyState = document.getElementById('emptyState');
  const checkoutSection = document.getElementById('checkoutSection');
  const form = document.getElementById('checkoutForm');
  const successPanel = document.getElementById('successPanel');
  const submitBtn = document.getElementById('confirmOrderBtn');
  if(!form) return; // not on this page

  // سلة فارغة؟ أعرض حالة فارغة بدل النموذج بالكامل.
  if(cartCount() === 0){
    emptyState.style.display = 'block';
    checkoutSection.style.display = 'none';
    return;
  }

  renderOrderSummary();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // تحقق أساسي إضافي (بجانب required الأصلية بالمتصفح) —
    // يمنع إرسال الطلب لو أي حقل إلزامي لسا فاضي.
    if(!form.reportValidity()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'جارٍ إرسال الطلب...';

    const payload = buildOrderPayload();

    try {
      const res = await fetch('/.netlify/functions/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if(!res.ok){
        throw new Error(data.error || 'تعذّر إرسال الطلب');
      }

      // نجاح: نظّف السلة، علّم الجائزة كمستخدمة (إذا كانت مطبّقة
      // فعليًا على هذا الطلب)، وأظهر شاشة التأكيد بدل النموذج.
      if(payload.discount > 0 || payload.deliveryFee === 0){
        markPrizeUsed();
      }
      cart = {};
      saveCartToStorage();
      if(document.getElementById('cartItems')) renderCart();

      form.classList.add('hidden');
      successPanel.classList.remove('hidden');
      document.getElementById('successOrderNumber').textContent = data.orderNumber || data.id || '—';

    } catch(err){
      showToast('تعذّر إرسال الطلب، حاول مرة أخرى');
      submitBtn.disabled = false;
      submitBtn.textContent = 'تأكيد الطلب';
    }
  });
}

document.addEventListener('DOMContentLoaded', initCheckoutPage);
