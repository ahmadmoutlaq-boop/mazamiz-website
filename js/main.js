/* =========================================================
   مزمز — Main JS (no frameworks / no external libs)
   ========================================================= */

/* -------- Product catalogue (shared source of truth) -------- */
const PRODUCTS = {
  'red-watermelon': {
    name: 'بطيخ أحمر أردني',
    brand: 'مزمز',
    price: 3.50,
    unit: 'للكيلوغرام',
    color: '#c81f3f',
    thumb: 'red'
  },
  'yellow-watermelon': {
    name: 'بطيخ أصفر',
    brand: 'مزمز',
    price: 4.00,
    unit: 'للكيلوغرام',
    color: '#dd9a00',
    thumb: 'yellow'
  },
  'shamam': {
    name: 'شمام أردني',
    brand: 'وتين',
    price: 2.75,
    unit: 'للكيلوغرام',
    color: '#d67c26',
    thumb: 'cantaloupe'
  }
};

/* Small inline SVG thumbnails used inside the cart drawer */
const THUMBS = {
  red: `<svg viewBox="0 0 64 64" fill="none"><path d="M32 6C46 6 58 18 58 32C58 40 46 6 32 6Z" fill="#c81f3f"/><circle cx="32" cy="32" r="26" fill="#c81f3f"/><circle cx="32" cy="32" r="20" fill="#fff5f6"/><circle cx="32" cy="32" r="14" fill="#e8384f"/><circle cx="27" cy="27" r="1.6" fill="#2b0d12"/><circle cx="36" cy="30" r="1.6" fill="#2b0d12"/><circle cx="31" cy="37" r="1.6" fill="#2b0d12"/></svg>`,
  yellow: `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="26" fill="#dd9a00"/><circle cx="32" cy="32" r="20" fill="#fff8e6"/><circle cx="32" cy="32" r="14" fill="#f5c343"/><circle cx="27" cy="27" r="1.6" fill="#5c3d00"/><circle cx="36" cy="30" r="1.6" fill="#5c3d00"/><circle cx="31" cy="37" r="1.6" fill="#5c3d00"/></svg>`,
  cantaloupe: `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="26" fill="#d67c26"/><path d="M8 24c8-2 10 12 4 18M14 14c8 0 8 16 2 22M22 8c8 2 6 18 0 24M32 6c8 2 4 20-2 26M42 8c6 4 2 20-4 26M50 14c6 6-2 20-8 24M56 24c4 8-6 18-12 20" stroke="#b3651a" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>`
};

/* -------- State -------- */
let cart = {}; // { productId: qty }

/* -------- Helpers -------- */
const fmt = (n) => n.toLocaleString('ar-JO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

function cartCount(){
  return Object.values(cart).reduce((a,b)=>a+b,0);
}
function cartTotal(){
  return Object.entries(cart).reduce((sum,[id,qty])=> sum + PRODUCTS[id].price*qty, 0);
}

/* -------- Nav -------- */
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

/* -------- Reveal on scroll -------- */
function initReveal(){
  const items = $$('.reveal');
  if(!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
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

  const checkoutBtn = $('#checkoutBtn');
  if(checkoutBtn){
    checkoutBtn.addEventListener('click', () => {
      if(cartCount() === 0) return;
      showToast('شكرًا لطلبك! سيتواصل معك فريق مزمز قريبًا 🍉');
      cart = {};
      renderCart();
      setTimeout(closeCart, 900);
    });
  }

  renderCart();
}

function renderCart(){
  const list = $('#cartItems');
  const badge = $('#cartBadge');
  const totalEl = $('#cartTotalValue');
  const countEl = $('#cartCountLabel');
  if(!list) return;

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
    list.innerHTML = Object.entries(cart).map(([id,qty]) => {
      const p = PRODUCTS[id];
      return `
      <div class="cart-item" data-id="${id}">
        <div class="thumb product-media ${p.thumb}" style="border-radius:14px; aspect-ratio:auto;">${THUMBS[p.thumb]}</div>
        <div class="info">
          <b>${p.name} <small style="color:var(--text-faint); font-weight:500;">— ${p.brand}</small></b>
          <span>${fmt(p.price)} د.أ ${p.unit}</span>
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

  if(totalEl) totalEl.textContent = `${fmt(cartTotal())} د.أ`;
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

/* -------- Init -------- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initCart();
  initContactForm();
});
