/* =========================================================
   مزمز — نظام الحساب (محلي بالكامل، لأغراض الشكل فقط)
   -----------------------------------------------------------
   لا يوجد أي خادم وراء هذا النظام: اسم المستخدم وكلمة المرور
   يتخزّنوا بالكامل داخل localStorage على نفس الجهاز/المتصفح.
   هذا مقصود بناءً على الطلب — لا بريد إلكتروني، لا رقم هاتف،
   لا تحقق. الهدف تجربة "حساب" كاملة الشكل، مو نظام مصادقة
   حقيقي، فلا تستخدمه لأي بيانات حساسة فعليًا.

   بنية التخزين:
   - 'mazamiz_accounts' → { username: { password, createdAt } }
   - 'mazamiz_session'  → اسم المستخدم المسجّل دخوله حاليًا، أو
                          لا شي إذا محدّش مسجّل.
   ========================================================= */

const ACCOUNTS_KEY = 'mazamiz_accounts';
const SESSION_KEY = 'mazamiz_session';
const THEME_KEY = 'mazamiz_theme';

/* -------- تخزين الحسابات -------- */
function getAccounts(){
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {}; }
  catch { return {}; }
}
function saveAccounts(accounts){
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getSession(){
  return localStorage.getItem(SESSION_KEY) || null;
}
function setSession(username){
  localStorage.setItem(SESSION_KEY, username);
}
function clearSession(){
  localStorage.removeItem(SESSION_KEY);
}

/* -------- إنشاء حساب --------
   ترجع { ok:true } أو { ok:false, error:'...' } */
function signup(username, password, confirmPassword){
  username = (username || '').trim();
  if(!username) return { ok:false, error:'الرجاء إدخال اسم مستخدم' };
  if(username.length < 3) return { ok:false, error:'اسم المستخدم قصير جدًا (3 أحرف على الأقل)' };
  if(!password || password.length < 4) return { ok:false, error:'كلمة المرور قصيرة جدًا (4 أحرف على الأقل)' };
  if(password !== confirmPassword) return { ok:false, error:'كلمتا المرور غير متطابقتين' };

  const accounts = getAccounts();
  if(accounts[username]) return { ok:false, error:'اسم المستخدم مستخدم مسبقًا' };

  accounts[username] = { password, createdAt: new Date().toISOString() };
  saveAccounts(accounts);
  setSession(username);
  return { ok:true };
}

/* -------- تسجيل الدخول -------- */
function login(username, password){
  username = (username || '').trim();
  const accounts = getAccounts();
  const account = accounts[username];
  if(!account || account.password !== password){
    return { ok:false, error:'اسم المستخدم أو كلمة المرور غير صحيحة' };
  }
  setSession(username);
  return { ok:true };
}

function logout(){
  clearSession();
  window.location.href = 'index.html';
}

/* =========================================================
   الوضع الداكن (Dark Mode)
   ========================================================= */
function getTheme(){
  return localStorage.getItem(THEME_KEY) || 'light';
}
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
}
function toggleTheme(){
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  return next;
}
// يُطبَّق فورًا (قبل حتى DOMContentLoaded) حتى ما يصير "وميض"
// من الوضع الفاتح للداكن لما تفتح صفحة وأنت مفعّل الوضع الداكن.
applyTheme(getTheme());

/* =========================================================
   قائمة الحساب المنسدلة بالـ nav — تظهر بنفس الشكل بكل صفحة
   (الرئيسية، من نحن، تواصل معنا، السلة/الدفع، الملف الشخصي...)
   ========================================================= */
function renderAccountMenu(){
  const toggleBtn = document.getElementById('accountToggle');
  const dropdown = document.getElementById('accountDropdown');
  if(!toggleBtn || !dropdown) return; // الصفحة ما فيها هالعنصر أصلاً

  const username = getSession();
  const lang = (window.MazamizI18n && window.MazamizI18n.getLang()) || 'ar';
  const t = (ar, en) => (lang === 'en' ? en : ar);

  const themeLabel = getTheme() === 'dark' ? t('☀️ الوضع الفاتح', '☀️ Light Mode') : t('🌙 الوضع الداكن', '🌙 Dark Mode');
  const langLabel = lang === 'en' ? 'العربية 🇰🇼' : 'English 🇬🇧';

  if(username){
    const initial = username.trim().charAt(0).toUpperCase();
    toggleBtn.innerHTML = `<span class="avatar-fallback">${initial}</span>`;
    dropdown.innerHTML = `
      <div class="greet">${t('مرحبًا،', 'Hello,')} <b>${username}</b></div>
      <a href="profile.html">👤 ${t('الملف الشخصي', 'Profile')}</a>
      <a href="my-orders.html">📦 ${t('طلباتي', 'My Orders')}</a>
      <div class="dd-divider"></div>
      <button type="button" class="dd-item" id="ddThemeToggle">${themeLabel}</button>
      <button type="button" class="dd-item" id="ddLangToggle">🌐 ${langLabel}</button>
      <div class="dd-divider"></div>
      <button type="button" class="dd-item danger" id="ddLogout">🚪 ${t('تسجيل خروج', 'Log out')}</button>
    `;
  } else {
    toggleBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>`;
    dropdown.innerHTML = `
      <a href="account.html?mode=login">🔑 ${t('تسجيل الدخول', 'Log in')}</a>
      <a href="account.html?mode=signup">✨ ${t('إنشاء حساب', 'Sign up')}</a>
      <div class="dd-divider"></div>
      <button type="button" class="dd-item" id="ddThemeToggle">${themeLabel}</button>
      <button type="button" class="dd-item" id="ddLangToggle">🌐 ${langLabel}</button>
    `;
  }

  const themeBtn = document.getElementById('ddThemeToggle');
  if(themeBtn) themeBtn.addEventListener('click', () => { toggleTheme(); renderAccountMenu(); });

  const langBtn = document.getElementById('ddLangToggle');
  if(langBtn) langBtn.addEventListener('click', () => {
    if(window.MazamizI18n) window.MazamizI18n.toggle();
    renderAccountMenu();
  });

  const logoutBtn = document.getElementById('ddLogout');
  if(logoutBtn) logoutBtn.addEventListener('click', logout);
}

function initAccountMenu(){
  const toggleBtn = document.getElementById('accountToggle');
  const dropdown = document.getElementById('accountDropdown');
  if(!toggleBtn || !dropdown) return;

  renderAccountMenu();

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if(!dropdown.contains(e.target) && e.target !== toggleBtn){
      dropdown.classList.remove('open');
    }
  });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') dropdown.classList.remove('open'); });
}

document.addEventListener('DOMContentLoaded', initAccountMenu);
