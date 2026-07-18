/* =========================================================
   مزمز — Main JS (no frameworks / no external libs)
   ========================================================= */

/* -------- Product catalogue (shared source of truth) -------- */
const PRODUCTS = {
  'red-watermelon': {
    name: 'بطيخ أحمر كويتي',
    brand: 'مزمز',
    price: 1.75,
    unit: 'للكيلوغرام',
    color: '#c81f3f',
    thumb: 'red'
  },
  'yellow-watermelon': {
    name: 'بطيخ أصفر',
    brand: 'مزمز',
    price: 2.00,
    unit: 'للكيلوغرام',
    color: '#dd9a00',
    thumb: 'yellow'
  },
  'shamam': {
    name: 'شمام كويتي',
    brand: 'وتين',
    price: 1.38,
    unit: 'للكيلوغرام',
    color: '#d67c26',
    thumb: 'cantaloupe'
  },
  'strawberry': {
    name: 'فراولة',
    brand: 'مزمز',
    price: 2.25,
    unit: 'للكيلوغرام',
    color: '#c81f3f',
    thumb: 'strawberry'
  },
  'mango': {
    name: 'مانجو',
    brand: 'مزمز',
    price: 2.50,
    unit: 'للكيلوغرام',
    color: '#e8a400',
    thumb: 'mango'
  },
  'grapes': {
    name: 'عنب',
    brand: 'مزمز',
    price: 1.95,
    unit: 'للكيلوغرام',
    color: '#6b3fa0',
    thumb: 'grapes'
  }
};

/* Small inline SVG thumbnails used inside the cart drawer */
const THUMBS = {
  red: `<svg viewBox="0 0 64 64" fill="none"><path d="M32 6C46 6 58 18 58 32C58 40 46 6 32 6Z" fill="#c81f3f"/><circle cx="32" cy="32" r="26" fill="#c81f3f"/><circle cx="32" cy="32" r="20" fill="#fff5f6"/><circle cx="32" cy="32" r="14" fill="#e8384f"/><circle cx="27" cy="27" r="1.6" fill="#2b0d12"/><circle cx="36" cy="30" r="1.6" fill="#2b0d12"/><circle cx="31" cy="37" r="1.6" fill="#2b0d12"/></svg>`,
  yellow: `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="26" fill="#dd9a00"/><circle cx="32" cy="32" r="20" fill="#fff8e6"/><circle cx="32" cy="32" r="14" fill="#f5c343"/><circle cx="27" cy="27" r="1.6" fill="#5c3d00"/><circle cx="36" cy="30" r="1.6" fill="#5c3d00"/><circle cx="31" cy="37" r="1.6" fill="#5c3d00"/></svg>`,
  cantaloupe: `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="26" fill="#d67c26"/><path d="M8 24c8-2 10 12 4 18M14 14c8 0 8 16 2 22M22 8c8 2 6 18 0 24M32 6c8 2 4 20-2 26M42 8c6 4 2 20-4 26M50 14c6 6-2 20-8 24M56 24c4 8-6 18-12 20" stroke="#b3651a" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>`,
  strawberry: `<svg viewBox="0 0 64 64" fill="none"><path d="M32 18c-12 0-20 10-20 22 0 10 10 18 20 18s20-8 20-18c0-12-8-22-20-22Z" fill="#e8384f"/><path d="M24 12l4 8 4-8 4 8 4-8" stroke="#1f7a4d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="26" cy="30" r="1.4" fill="#fff8e6"/><circle cx="36" cy="28" r="1.4" fill="#fff8e6"/><circle cx="30" cy="38" r="1.4" fill="#fff8e6"/><circle cx="38" cy="40" r="1.4" fill="#fff8e6"/></svg>`,
  mango: `<svg viewBox="0 0 64 64" fill="none"><path d="M14 30c0-14 12-18 22-14 10 4 16 14 12 24-4 10-16 16-24 12-10-5-12-14-10-22Z" fill="#f5c343"/><path d="M30 16c4-6 10-8 14-6" stroke="#1f7a4d" stroke-width="3" stroke-linecap="round"/></svg>`,
  grapes: `<svg viewBox="0 0 64 64" fill="none"><g fill="#6b3fa0"><circle cx="24" cy="26" r="8"/><circle cx="36" cy="26" r="8"/><circle cx="18" cy="38" r="8"/><circle cx="30" cy="38" r="8"/><circle cx="42" cy="38" r="8"/><circle cx="24" cy="50" r="8"/><circle cx="36" cy="50" r="8"/></g><path d="M30 12c2-4 6-6 10-5" stroke="#1f7a4d" stroke-width="3" stroke-linecap="round"/></svg>`
};

/* -------- State -------- */
let cart = {}; // { productId: qty }

const CART_STORAGE_KEY = 'mazamiz_cart';
const PRIZE_STORAGE_KEY = 'mazamiz_prize';

// Cart is persisted to localStorage so it survives a page reload
// AND survives navigating from the site to checkout.html (a
// separate page load, which otherwise would lose the in-memory
// `cart` variable entirely). This is a real deployed website, not
// a sandboxed preview, so localStorage is the right tool here.
function loadCartFromStorage(){
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // keep only ids that still exist in the catalogue, and only
    // positive integer quantities — protects against a stale cart
    // referencing a product that was since removed from PRODUCTS.
    const clean = {};
    Object.entries(parsed || {}).forEach(([id, qty]) => {
      if(PRODUCTS[id] && Number.isFinite(qty) && qty > 0) clean[id] = qty;
    });
    return clean;
  } catch(err){
    return {};
  }
}
function saveCartToStorage(){
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch(err){
    // storage unavailable (private browsing, quota, etc.) — the
    // site still works, it just won't remember the cart on reload
  }
}

/* -------- Lucky-wheel prize state --------
   A won prize is stored once in localStorage so it survives the
   trip from the homepage (where the wheel lives) to checkout.html
   (a separate page). Each prize can only ever be marked "used"
   once — after a successful order, markPrizeUsed() stamps it, and
   getActivePrize() will then stop returning it for any future cart.

   type meanings:
   - 'percent'       → knock a % off the cart subtotal right now
   - 'free_shipping' → waives the delivery fee at checkout
   - 'next_order'    → not applicable to the CURRENT cart at all;
                        kept only so admins/customers know it was won
   - 'none'          → "better luck next time" — nothing to store */
function getActivePrize(){
  try {
    const raw = localStorage.getItem(PRIZE_STORAGE_KEY);
    if(!raw) return null;
    const prize = JSON.parse(raw);
    if(!prize || prize.used || prize.type === 'none') return null;
    return prize;
  } catch(err){
    return null;
  }
}
function savePrize(prize){
  try {
    localStorage.setItem(PRIZE_STORAGE_KEY, JSON.stringify(prize));
  } catch(err){ /* ignore — wheel still shows the result visually */ }
}
function markPrizeUsed(){
  const prize = getActivePrize();
  if(!prize) return;
  prize.used = true;
  savePrize(prize);
}
// Given the current subtotal, returns how much the active prize
// (if any) discounts it — used by both the cart drawer preview
// and the real checkout total.
function computePrizeDiscount(subtotal){
  const prize = getActivePrize();
  if(!prize || prize.type !== 'percent') return 0;
  return Math.round(subtotal * (prize.value / 100) * 1000) / 1000;
}

/* -------- Helpers -------- */
/* -------- Small helpers --------
   fmt()   → formats a number as Kuwaiti-Dinar-style currency text
             (the د.ك symbol itself is added separately in the
             markup/templates, this only formats the digits).
   $/$$    → tiny querySelector/querySelectorAll shortcuts used
             everywhere below instead of the long DOM API names,
             purely to keep the rest of this file readable. */
const fmt = (n) => n.toLocaleString('ar-KW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// Total number of items in the cart (sum of quantities, not
// distinct products) — shown in the nav badge and drawer header.
function cartCount(){
  return Object.values(cart).reduce((a,b)=>a+b,0);
}
// Cart subtotal in KWD, recalculated fresh every time from the
// PRODUCTS price list rather than being cached anywhere, so it
// can never drift out of sync with a quantity change.
function cartTotal(){
  return Object.entries(cart).reduce((sum,[id,qty])=> sum + PRODUCTS[id].price*qty, 0);
}

/* -------- Nav --------
   Two independent jobs:
   1) toggle a `.scrolled` class once the page scrolls past the
      very top, so the header can pick up a border/background
      via CSS (see .nav.scrolled in style.css) instead of always
      looking the same as the transparent hero underneath it.
   2) wire up the mobile hamburger menu open/close, and make sure
      tapping any link inside that menu closes it again — without
      this, the menu would stay open after navigating on mobile. */
function initNav(){
  const nav = $('.nav');
  if(!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  const burger = $('.nav-burger');
  const menu = $('.mobile-menu');
  if(burger && menu){
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      menu.classList.remove('open');
    }));
  }
}

/* -------- Reveal on scroll --------
   Generic fade-up-on-scroll used all over the site (product
   cards, section headers, testimonials, the stats section...).
   Any element with class="reveal" starts hidden/offset via CSS;
   this just adds the "in" class the first time it enters the
   viewport, which triggers the actual CSS transition. Using one
   shared IntersectionObserver for every .reveal element (rather
   than one observer per element) keeps this cheap even on pages
   with many animated sections. */
function initReveal(){
  const items = $$('.reveal');
  if(!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target); // fade in once, then stop watching
      }
    });
  }, { threshold:.12, rootMargin:'0px 0px -60px 0px' });
  items.forEach(el => io.observe(el));
}

/* -------- Toast -------- */
let toastTimer;
function showToast(message){
  let toast = $('.toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span></span>`;
    document.body.appendChild(toast);
  }
  $('span', toast).textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* -------- Cart drawer -------- */
function initCart(){
  const drawer = $('#cartDrawer');
  const overlay = $('#cartOverlay');
  if(!drawer || !overlay) return;

  const openCart = () => { drawer.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow='hidden'; };
  const closeCart = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow=''; };

  $$('.js-open-cart').forEach(btn => btn.addEventListener('click', openCart));
  $$('.js-close-cart').forEach(btn => btn.addEventListener('click', closeCart));
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeCart(); });

  $$('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if(!PRODUCTS[id]) return;
      cart[id] = (cart[id] || 0) + 1;
      renderCart();
      showToast(`تمت إضافة ${PRODUCTS[id].name} إلى السلة`);
      btn.classList.add('added');
      const original = btn.innerHTML;
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> أُضيف`;
      setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = original; }, 1300);
    });
  });

  // "إتمام الشراء" now hands off to the real checkout page instead
  // of faking a purchase inline. The cart itself is already saved
  // to localStorage (see renderCart → saveCartToStorage), so
  // checkout.html — a separate page load — can read the exact same
  // cart the moment it opens.
  const checkoutBtn = $('#checkoutBtn');
  if(checkoutBtn){
    checkoutBtn.addEventListener('click', () => {
      if(cartCount() === 0) return;
      window.location.href = 'checkout.html';
    });
  }

  cart = loadCartFromStorage();
  renderCart();
}

function renderCart(){
  const list = $('#cartItems');
  const badge = $('#cartBadge');
  const totalEl = $('#cartTotalValue');
  const countEl = $('#cartCountLabel');
  if(!list) return;

  saveCartToStorage(); // keep localStorage in sync on every render

  const count = cartCount();
  if(badge){
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
  }
  if(countEl) countEl.textContent = count;

  if(count === 0){
    list.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.5L21 8H6"/></svg>
        <p>سلتك فارغة حاليًا.<br>أضف بعضًا من ثمار مزمز الطازجة.</p>
      </div>`;
  } else {
    // Active lucky-wheel prize banner (percent discount or free
    // shipping only — "next order" / "no prize" outcomes have
    // nothing meaningful to show inside the CURRENT cart).
    const prize = getActivePrize();
    let prizeBannerHtml = '';
    if(prize && prize.type === 'percent'){
      const discount = computePrizeDiscount(cartTotal());
      prizeBannerHtml = `
        <div class="prize-banner">
          <span>🎉</span>
          <div>
            <b>جائزتك مطبّقة: ${prize.label}</b>
            <span>خصم ${fmt(discount)} د.ك على هذا الطلب</span>
          </div>
        </div>`;
    } else if(prize && prize.type === 'free_shipping'){
      prizeBannerHtml = `
        <div class="prize-banner">
          <span>🎉</span>
          <div>
            <b>جائزتك مطبّقة: ${prize.label}</b>
            <span>سيتم إلغاء رسوم التوصيل عند إتمام الطلب</span>
          </div>
        </div>`;
    }

    list.innerHTML = prizeBannerHtml + Object.entries(cart).map(([id,qty]) => {
      const p = PRODUCTS[id];
      return `
      <div class="cart-item" data-id="${id}">
        <div class="thumb product-media ${p.thumb}" style="border-radius:14px; aspect-ratio:auto;">${THUMBS[p.thumb]}</div>
        <div class="info">
          <b>${p.name} <small style="color:var(--text-faint); font-weight:500;">— ${p.brand}</small></b>
          <span>${fmt(p.price)} د.ك ${p.unit}</span>
          <div class="qty-control">
            <button class="js-dec" aria-label="إنقاص الكمية">−</button>
            <span>${qty}</span>
            <button class="js-inc" aria-label="زيادة الكمية">+</button>
            <a href="#" class="remove js-remove">إزالة</a>
          </div>
        </div>
      </div>`;
    }).join('');

    list.querySelectorAll('.cart-item').forEach(row => {
      const id = row.dataset.id;
      row.querySelector('.js-inc').addEventListener('click', () => { cart[id]++; renderCart(); });
      row.querySelector('.js-dec').addEventListener('click', () => {
        cart[id]--;
        if(cart[id] <= 0) delete cart[id];
        renderCart();
      });
      row.querySelector('.js-remove').addEventListener('click', (e) => {
        e.preventDefault();
        delete cart[id];
        renderCart();
      });
    });
  }

  const subtotal = cartTotal();
  const discount = computePrizeDiscount(subtotal);
  if(totalEl) totalEl.textContent = `${fmt(subtotal - discount)} د.ك`;
}

/* -------- Product search filter (home page) -------- */
function initProductSearch(){
  const input = $('#productSearch');
  const grid = $('#productGrid');
  const empty = $('#productEmpty');
  if(!input || !grid) return;

  const cards = $$('.product-card', grid);

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let visibleCount = 0;
    cards.forEach(card => {
      const name = (card.dataset.name || card.querySelector('h3')?.textContent || '').toLowerCase();
      const match = name.includes(q);
      card.style.display = match ? '' : 'none';
      if(match) visibleCount++;
    });
    if(empty) empty.classList.toggle('show', visibleCount === 0);
  });
}

/* -------- Contact form (demo only, no backend) -------- */
function initContactForm(){
  const form = $('#contactForm');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('تم إرسال رسالتك بنجاح، سنرد عليك قريبًا 🌿');
    form.reset();
  });
}

/* =========================================================
   Animated Statistics (home page only)
   -----------------------------------------------------------
   Each <span class="stat-count" data-target="1200"> starts its
   life showing "0". The moment the section becomes visible on
   screen (via IntersectionObserver — the same lightweight
   technique used by initReveal() above, so we're not adding a
   second/heavier scroll-listener just for this feature), we
   animate the number from 0 up to data-target using
   requestAnimationFrame. Animating with rAF (rather than
   setInterval) keeps it synced to the browser's paint cycle,
   which is both smoother and cheaper on battery than a timer.

   data-decimal="1" is used for the "4.9" rating stat so the
   counter formats with one decimal place instead of a whole
   number — every other stat is a plain integer count.

   The whole section only animates ONCE per page load: once a
   card has counted up, we stop observing it so scrolling past
   it again doesn't restart the animation.
   ========================================================= */
function initStatsCounter(){
  const counters = $$('.stat-count');
  if(!counters.length) return;

  // Animates a single <span> from 0 to its data-target over
  // roughly 1.6s. duration is intentionally short — long counting
  // animations feel sluggish rather than impressive.
  function animateCount(el){
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const duration = 1600; // ms
    const start = performance.now();

    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic: fast at the start, gently settles at the end
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-US');
      if(progress < 1){
        requestAnimationFrame(tick);
      } else {
        // snap to the exact final value to avoid any rounding drift
        el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString('en-US');
      }
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animateCount(entry.target);
        io.unobserve(entry.target); // only ever animate once
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
}

/* =========================================================
   Lucky Wheel (عجلة الحظ) — home page only, entertainment only
   -----------------------------------------------------------
   Important: this feature is PURELY visual. It does not talk to
   any server, does not store or apply a real discount anywhere,
   and does not touch the shopping cart — it exists only to be a
   fun, on-brand moment for the visitor, as requested.

   How the spin math works:
   - The wheel has 6 equal 60° slices (see .wheel's conic-gradient
     in css/style.css). Slice index 0 is the one starting at the
     top (0°) going clockwise, matching PRIZES[0] below.
   - The pointer is fixed at the top (0°) and never moves — only
     the wheel itself rotates.
   - To make a given slice end up under the pointer, we rotate the
     wheel so that slice's *center* angle lands at 0°. Since CSS
     rotation is clockwise-positive, rotating the wheel by R moves
     the content that was at angle (360 - R) to the top. So for a
     target slice with center angle `centerAngle`, the rotation
     that lands it at the top is `360 - centerAngle` (mod 360).
   - We then add several full spins (360 * N) purely for visual
     effect — it doesn't change *which* slice ends up on top, only
     how many times the wheel visibly spins before stopping there.
   - A random prize is picked with Math.random() BEFORE the spin
     starts, so the animation is just visually "catching up" to an
     already-decided outcome — this keeps the result logic simple
     and easy to audit (no reverse-engineering the final CSS angle
     to figure out what "won").
   ========================================================= */
function initLuckyWheel(){
  const trigger  = $('#luckTrigger');
  const overlay  = $('#luckOverlay');
  const modal    = $('#luckModal');
  const closeBtn = $('#luckClose');
  const wheel    = $('#luckWheel');
  const spinBtn  = $('#luckSpin');
  const resultBox   = $('#luckResult');
  const resultText  = $('#luckPrizeText');
  if(!trigger || !wheel) return;

  // Order MUST match the 6 conic-gradient slices in CSS and the
  // 6 .wheel-segment-label elements in the HTML (both go in the
  // same clockwise order starting from the top).
  const PRIZES = [
    'خصم 5%',
    'توصيل مجاني',
    'خصم 10%',
    'كوبون للطلب القادم',
    'خصم 15%',
    'حظ أوفر في المرة القادمة'
  ];
  // Machine-readable meaning of each prize above (same order) —
  // this is what actually gets saved and later applied at
  // checkout; PRIZES itself is only ever used for display text.
  const PRIZE_META = [
    { type: 'percent',       value: 5  },
    { type: 'free_shipping', value: 0  },
    { type: 'percent',       value: 10 },
    { type: 'next_order',    value: 0  },
    { type: 'percent',       value: 15 },
    { type: 'none',          value: 0  }
  ];
  const SLICE_ANGLE = 360 / PRIZES.length; // 60°

  let spinning = false;
  let currentRotation = 0; // keeps growing across spins so it always spins forward

  function openModal(){
    overlay.classList.add('open');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    overlay.classList.remove('open');
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });

  spinBtn.addEventListener('click', () => {
    if(spinning) return; // ignore extra clicks mid-spin
    spinning = true;
    spinBtn.disabled = true;
    resultBox.classList.remove('show');

    // 1) Decide the outcome first (see comment block above).
    const winningIndex = Math.floor(Math.random() * PRIZES.length);
    const centerAngle = winningIndex * SLICE_ANGLE + SLICE_ANGLE / 2;

    // 2) Work out how many degrees to add so the wheel always
    //    spins forward (never backward, which would look broken)
    //    even though currentRotation keeps accumulating spin after spin.
    const fullSpins = 5; // purely cosmetic — how many full turns before landing
    const targetWithinCircle = (360 - centerAngle) % 360;
    const previousWithinCircle = currentRotation % 360;
    let delta = targetWithinCircle - previousWithinCircle;
    if(delta <= 0) delta += 360;
    currentRotation += fullSpins * 360 + delta;

    wheel.style.transform = `rotate(${currentRotation}deg)`;

    // 3) Reveal the result only once the CSS transition has
    //    actually finished, so the text never appears before the
    //    wheel visually stops.
    const onSpinEnd = () => {
      wheel.removeEventListener('transitionend', onSpinEnd);
      resultText.textContent = '🎉 ' + PRIZES[winningIndex];
      resultBox.classList.add('show');
      spinning = false;
      spinBtn.disabled = false;

      // Persist the prize (see the big comment above initLuckyWheel
      // and the "Lucky-wheel prize state" helpers near the top of
      // this file). A "no prize" outcome is intentionally NOT
      // saved — there's nothing to apply or reuse-block for it.
      const meta = PRIZE_META[winningIndex];
      if(meta.type !== 'none'){
        savePrize({
          label: PRIZES[winningIndex],
          type: meta.type,
          value: meta.value,
          used: false,
          wonAt: new Date().toISOString()
        });
        // reflect the win immediately if the cart drawer happens
        // to already be open behind this modal
        if(typeof renderCart === 'function' && $('#cartItems')) renderCart();
      }
    };
    wheel.addEventListener('transitionend', onSpinEnd);
  });
}

/* =========================================================
   Live prices (loaded from netlify/functions/prices.js)
   -----------------------------------------------------------
   The admin can change prices from admin.html at any time.
   On every page load, we ask the serverless function for the
   current prices and, if it answers successfully, override the
   hardcoded PRODUCTS values above + update the visible price
   text on the page (the <span class="price-value"> elements
   added specifically for this in index.html).

   This call is intentionally "fire and forget" from the page's
   perspective: if the function isn't deployed yet, is briefly
   unreachable, or returns bad data, we simply keep showing the
   hardcoded prices already baked into the HTML/PRODUCTS above —
   the site must never look broken just because this optional
   feature is unavailable. */
async function applyLivePrices(){
  try {
    const res = await fetch('/.netlify/functions/prices', { cache: 'no-store' });
    if (!res.ok) return; // function not deployed / not reachable → keep defaults
    const livePrices = await res.json();

    Object.entries(livePrices).forEach(([id, price]) => {
      const value = parseFloat(price);
      if (!PRODUCTS[id] || !isFinite(value) || value <= 0) return;
      PRODUCTS[id].price = value;
    });

    // reflect the new numbers in any visible price tags on this page
    $$('.price-value').forEach(el => {
      const id = el.dataset.productId;
      if (PRODUCTS[id]) {
        el.textContent = PRODUCTS[id].price.toFixed(2);
      }
    });

    // if the cart drawer already has items rendered, refresh its
    // total too so it matches the newly-loaded prices
    if (typeof renderCart === 'function' && $('#cartItems')) {
      renderCart();
    }
    // checkout.html renders its own summary independently of the
    // cart drawer — refresh it too if that function is loaded
    // (it only exists on checkout.html, via js/checkout.js)
    if (typeof renderOrderSummary === 'function' && $('#orderItems')) {
      renderOrderSummary();
    }
  } catch (err) {
    // network error, offline, etc. — fall back silently to defaults
  }
}

/* -------- Init -------- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initCart();
  initProductSearch();
  initContactForm();
  initStatsCounter();
  initLuckyWheel();
  applyLivePrices();
});
