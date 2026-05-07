import { useEffect, useState, useMemo, useRef } from 'react';
import { Head } from '@inertiajs/react';

/* ======================================
   HELPERS
   ====================================== */
const getProductName = (p, lang = 'ar') => {
    if (!p) return '';
    return lang === 'ar'
        ? (p.name_ar || p.name_en || '')
        : (p.name_en || p.name_ar || '');
};

const getProductDesc = (p, lang = 'ar') => {
    if (!p) return '';
    return lang === 'ar'
        ? (p.description_ar || p.description_en || '')
        : (p.description_en || p.description_ar || '');
};

const t = {
    browseMenu:  { ar: 'تصفح القائمة',                  en: 'Browse Menu' },
    addToOrder:  { ar: 'أضف للطلب',                    en: 'Add to Order' },
    all:         { ar: 'الكل',                          en: 'ALL' },
    loading:     { ar: 'جاري تحميل قائمة الطعام...',   en: 'Loading menu...' },
    notFound:    { ar: 'المطعم غير موجود',             en: 'Restaurant not found' },
    empty:       { ar: 'لا توجد منتجات متاحة حالياً', en: 'No products available' },
    sar:         { ar: 'ر.س',                           en: 'SAR' },
    langToggle:  { ar: 'English',                       en: 'عربي' },
    addonsTitle: { ar: 'الإضافات',                        en: 'Extras / Add-ons' },
    cancel:      { ar: 'إلغاء',                           en: 'Cancel' },
    addToCart:   { ar: 'إضافة للسلة',                     en: 'Add to Cart' },
    total:       { ar: 'المجموع',                         en: 'Total' },
    customize:   { ar: 'خصص الطلب',                       en: 'Customize' },
    noAddonsMsg: { ar: 'لا توجد إضافات لهذا المنتج',      en: 'No extras available for this product' },
    cart:        { ar: 'السلة',                           en: 'Cart' },
    checkout:    { ar: 'إتمام الطلب',                     en: 'Checkout' },
    emptyCart:   { ar: 'إفراغ السلة',                     en: 'Empty Cart' },
    cartEmpty:   { ar: 'السلة فارغة',                     en: 'Your cart is empty' },
    checkoutTitle:{ ar: 'بيانات الطلب',                    en: 'Checkout Details' },
    dineIn:      { ar: 'داخل المطعم',                     en: 'Dine In' },
    takeaway:    { ar: 'استلام',                          en: 'Takeaway' },
    inCar:       { ar: 'في السيارة',                      en: 'In Car' },
    tableNumber: { ar: 'رقم الطاولة',                     en: 'Table Number' },
    phoneNumber: { ar: 'رقم الجوال',                      en: 'Phone Number' },
    carNumber:   { ar: 'رقم السيارة، لونها، أو نوعها',    en: 'Car Number / Color / Type' },
    customerName:{ ar: 'الاسم',                        en: 'Name' },
    notes:       { ar: 'ملاحظات (اختياري)',               en: 'Notes (Optional)' },
    confirmOrder:{ ar: 'تأكيد الطلب',                     en: 'Confirm Order' },
    reqTable:    { ar: 'يرجى إدخال رقم الطاولة',          en: 'Please enter table number' },
    reqPhone:    { ar: 'يرجى إدخال رقم الجوال',           en: 'Please enter phone number' },
    reqCar:      { ar: 'يرجى إدخال بيانات السيارة',       en: 'Please enter car details' },
    reqName:     { ar: 'الاسم مطلوب لإتمام الطلب',       en: 'Name is required to complete the order' },
    orderSuccess:{ ar: 'تم إنشاء الطلب بنجاح. رقم الطلب: ', en: 'Order created successfully. Order number: ' },
    submitting:  { ar: 'جاري الإرسال...',                 en: 'Submitting...' },
    trackOrder:  { ar: 'تتبع الطلب',                      en: 'Track Order' },
    orderSuccessMsg: { ar: 'تم إنشاء الطلب بنجاح',        en: 'Order created successfully' },
    selectBranch: { ar: 'اختر الفرع',                   en: 'Select Branch' },
    branchTitle: { ar: 'اختر أقرب فرع إليك',            en: 'Select Nearest Branch' },
    branchDesc: { ar: 'يرجى اختيار الفرع لتتمكن من رؤية القائمة المتاحة والطلب', en: 'Please select a branch to see available menu and start ordering' },
    choose: { ar: 'اختيار',                             en: 'Choose' },
    changeBranch: { ar: 'تغيير الفرع',                  en: 'Change Branch' },
};

/* ======================================
   STYLES (scoped CSS-in-JS)
   ====================================== */
const GOLD   = '#C9A84C';
const GOLD_H = '#B8942F';
const BG     = '#F7F5F0';
const SURF   = '#FFFFFF';
const SURF_E = '#F2EFE8';
const TEXT   = '#1A1714';
const MUTED  = '#6B6460';
const BORDER = 'rgba(0,0,0,0.07)';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Outfit:wght@300;400;500;600;700&family=Cairo:wght@400;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.sv-page { background: ${BG}; font-family: 'Outfit', sans-serif; color: ${TEXT}; min-height: 100vh; display: flex; flex-direction: column; -webkit-font-smoothing: antialiased; }
.sv-page.ar { font-family: 'Cairo', sans-serif; direction: rtl; }
.sv-page.en { direction: ltr; }

/* HEADER */
.sv-header { position: absolute; top: 0; left: 0; right: 0; z-index: 50; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; }
.sv-header__left { display: flex; align-items: center; gap: 1rem; cursor: pointer; }
.sv-logo-img { width: 250px; height: 80px; object-fit: contain; display: block; flex-shrink: 0; }
.sv-brand { font-family: 'Cinzel', serif; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.1em; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,0.3); display: flex; align-items: center; }
@media (max-width: 640px) {
    .sv-logo-img { width: 150px; height: 50px; }
    .sv-brand { font-size: 1.1rem; }
}
.sv-header__right { display: flex; align-items: center; gap: 1rem; }
.sv-lang-btn { font-size: 0.875rem; font-weight: 600; color: #fff; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.35); padding: 0.4rem 0.9rem; border-radius: 8px; cursor: pointer; backdrop-filter: blur(8px); transition: all 0.2s; font-family: inherit; }
.sv-lang-btn:hover { background: rgba(255,255,255,0.28); }

/* HERO */
.sv-hero { position: relative; height: 72vh; min-height: 560px; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; }
.sv-hero__bg { position: absolute; inset: 0; background-size: cover; background-position: center; transform: scale(1.04); }
.sv-hero__overlay { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(26,23,20,0.55) 0%, rgba(26,23,20,0.35) 50%, rgba(247,245,240,0.9) 100%); z-index: 1; }
.sv-hero__content { position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; padding: 0 1rem; max-width: 700px; }
.sv-hero__logo { width: 76px; height: 76px; background: ${GOLD}; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-size: 2.2rem; font-weight: 800; color: #fff; box-shadow: 0 4px 24px rgba(201,168,76,0.45); margin-bottom: 1.25rem; }
.sv-hero__title { font-family: 'Cairo', sans-serif; font-size: clamp(3rem, 8vw, 3.5rem); font-weight: 800; line-height: 1.1; color: #fff; margin-bottom: 0.5rem; text-shadow: 0 3px 18px rgba(0,0,0,0.5); }
.sv-hero__title-en { font-family: 'Outfit', sans-serif; font-size: 1.2rem; font-weight: 500; color: rgba(255,255,255,0.9); margin-bottom: 1.25rem; letter-spacing: 0.1em; text-transform: uppercase; }
.sv-hero__tagline { font-family: 'Cairo', sans-serif; font-size: clamp(1.1rem, 2.5vw, 1.4rem); color: rgba(255,255,255,0.85); font-weight: 400; margin-top: 10px; margin-bottom: 2.5rem; max-width: 600px; line-height: 1.6; }
.sv-page.en .sv-hero__tagline { font-family: 'Outfit', sans-serif; }
.sv-hero__actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
.sv-btn-primary { background: ${GOLD}; color: #fff; padding: 0.875rem 2rem; border-radius: 8px; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.25s; border: none; cursor: pointer; box-shadow: 0 2px 12px rgba(201,168,76,0.3); font-family: inherit; }
.sv-btn-primary:hover { background: ${GOLD_H}; box-shadow: 0 4px 20px rgba(201,168,76,0.45); transform: translateY(-2px); }

/* CATEGORY NAV */
.sv-cats-wrap { position: sticky; top: 0; z-index: 30; background: rgba(247,245,240,0.96); backdrop-filter: blur(12px); border-bottom: 1px solid ${BORDER}; padding: 0.875rem 0; margin-bottom: 2rem; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
.sv-cats { display: flex; overflow-x: auto; gap: 0.75rem; padding: 0 2rem; scrollbar-width: none; max-width: 1200px; margin: 0 auto; }
.sv-cats::-webkit-scrollbar { display: none; }
.sv-cat-btn { white-space: nowrap; padding: 0.5rem 1.35rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; color: ${MUTED}; border: 1.5px solid transparent; transition: all 0.25s; text-transform: uppercase; letter-spacing: 0.05em; background: transparent; cursor: pointer; font-family: inherit; }
.sv-cat-btn:hover { color: ${TEXT}; background: rgba(0,0,0,0.04); }
.sv-cat-btn.active { color: ${GOLD_H}; border-color: ${GOLD}; background: rgba(201,168,76,0.12); }

/* GRID */
.sv-content { flex: 1; max-width: 1200px; margin: 0 auto; width: 100%; }
.sv-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; padding: 0 1.5rem 6rem; }
@media (min-width: 640px) { .sv-grid { grid-template-columns: repeat(2,1fr); } }
@media (min-width: 1024px) { .sv-grid { grid-template-columns: repeat(3,1fr); } }

/* CARD */
.sv-card { background: ${SURF}; border-radius: 14px; border: 1px solid ${BORDER}; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 12px rgba(0,0,0,0.07),0 1px 3px rgba(0,0,0,0.04); transition: transform 0.3s ease,box-shadow 0.3s ease,border-color 0.3s ease; }
.sv-card:hover { transform: translateY(-5px); box-shadow: 0 8px 32px rgba(0,0,0,0.12),0 2px 8px rgba(0,0,0,0.06); border-color: rgba(201,168,76,0.3); }
.sv-card__img-wrap { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: ${SURF_E}; position: relative; }
.sv-card__img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.sv-card:hover .sv-card__img { transform: scale(1.04); }
.sv-card__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg,#F5F2EC,#EDE9E0); font-size: 3.5rem; color: rgba(0,0,0,0.12); }
.sv-card__body { padding: 1.4rem; display: flex; flex-direction: column; flex: 1; }
.sv-card__head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem; gap: 1rem; }
.sv-card__name { font-family: 'Cinzel', serif; font-size: 1.05rem; font-weight: 700; line-height: 1.4; color: ${TEXT}; }
.sv-page.ar .sv-card__name { font-family: 'Cairo', sans-serif; font-size: 1.0rem; }
.sv-card__price { font-size: 1.1rem; font-weight: 700; color: ${GOLD_H}; white-space: nowrap; }
.sv-card__desc { font-size: 0.875rem; color: ${MUTED}; line-height: 1.6; margin-bottom: 1.25rem; flex: 1; }
.sv-card__actions { display: flex; gap: 0.5rem; margin-top: auto; }
.sv-card__qty { display: flex; align-items: center; background: ${SURF_E}; border-radius: 8px; border: 1px solid ${BORDER}; }
.sv-card__qty button { padding: 0.5rem 0.75rem; font-weight: 700; font-size: 1rem; color: ${TEXT}; background: none; border: none; cursor: pointer; font-family: inherit; transition: color 0.15s; }
.sv-card__qty button:hover { color: ${GOLD_H}; }
.sv-card__qty span { min-width: 1.75rem; text-align: center; font-weight: 700; font-size: 0.95rem; }
.sv-card__add-btn { flex: 1; padding: 0.8rem; background: transparent; border-radius: 8px; font-weight: 700; color: ${GOLD_H}; border: 1.5px solid ${GOLD}; transition: all 0.25s; display: flex; justify-content: center; align-items: center; gap: 0.5rem; text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.85rem; cursor: pointer; font-family: inherit; }
.sv-card__add-btn:hover { background: ${GOLD}; color: #fff; box-shadow: 0 4px 16px rgba(201,168,76,0.28); }

/* LOADING */
.sv-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: ${BG}; gap: 1.25rem; }
.sv-spinner { width: 44px; height: 44px; border: 3px solid rgba(201,168,76,0.2); border-top: 3px solid ${GOLD}; border-radius: 50%; animation: sv-spin 0.75s linear infinite; }
@keyframes sv-spin { to { transform: rotate(360deg); } }
.sv-loading p { color: ${MUTED}; font-size: 1rem; font-family: 'Cairo', sans-serif; }

/* GRID EMPTY */
.sv-empty { grid-column: 1/-1; text-align: center; padding: 4rem; color: rgba(0,0,0,0.25); background: rgba(0,0,0,0.02); border-radius: 12px; }

/* MODAL */
.sv-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); }
.sv-modal { background: #FFFFFF; border-radius: 16px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
.sv-modal__header { position: relative; width: 100%; aspect-ratio: 16/9; background: #F2EFE8; }
.sv-modal__img { width: 100%; height: 100%; object-fit: cover; }
.sv-modal__close { position: absolute; top: 1rem; right: 1rem; width: 32px; height: 32px; background: rgba(255,255,255,0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; font-size: 1.2rem; font-weight: bold; }
.sv-page.ar .sv-modal__close { right: auto; left: 1rem; }
.sv-modal__body { padding: 1.5rem; }
.sv-modal__title { font-family: 'Cinzel', serif; font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem; }
.sv-page.ar .sv-modal__title { font-family: 'Cairo', sans-serif; }
.sv-modal__price { font-size: 1.1rem; color: #B8942F; font-weight: 700; margin-bottom: 1.5rem; }
.sv-modal__section-title { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; border-bottom: 1px solid rgba(0,0,0,0.07); padding-bottom: 0.5rem; }
.sv-addon-item { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; cursor: pointer; }
.sv-addon-item input { margin-right: 0.75rem; width: 1.2rem; height: 1.2rem; accent-color: #C9A84C; }
.sv-page.ar .sv-addon-item input { margin-right: 0; margin-left: 0.75rem; }
.sv-addon-item span.sv-addon-name { flex: 1; font-size: 0.95rem; }
.sv-addon-item span.sv-addon-price { font-size: 0.9rem; color: #6B6460; }
.sv-modal__footer { padding: 1.5rem; border-top: 1px solid rgba(0,0,0,0.07); display: flex; gap: 1rem; align-items: center; }
.sv-modal__total { flex: 1; font-size: 1.1rem; font-weight: 700; }
.sv-modal__total-val { color: #B8942F; }
.sv-modal__btn-cancel { padding: 0.8rem 1.5rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); background: transparent; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.sv-modal__btn-cancel:hover { background: rgba(0,0,0,0.05); }
.sv-modal__btn-add { padding: 0.8rem 1.5rem; border-radius: 8px; border: none; background: #C9A84C; color: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; box-shadow: 0 4px 12px rgba(201,168,76,0.3); }
.sv-modal__btn-add:hover { background: #B8942F; transform: translateY(-1px); }

/* CART BADGE */
.sv-cart-btn { position: relative; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: ${TEXT}; display: flex; align-items: center; justify-content: center; }
.sv-cart-badge { position: absolute; top: -5px; right: -8px; background: ${GOLD}; color: #fff; font-size: 0.75rem; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.sv-page.ar .sv-cart-badge { right: auto; left: -8px; }

/* CART DRAWER */
.sv-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; backdrop-filter: blur(4px); transition: opacity 0.3s; }
.sv-drawer { position: fixed; top: 0; bottom: 0; right: 0; width: 100%; max-width: 400px; background: #fff; z-index: 41; display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.15); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.sv-page.ar .sv-drawer { right: auto; left: 0; box-shadow: 4px 0 24px rgba(0,0,0,0.15); }
.sv-drawer.closed { transform: translateX(100%); }
.sv-page.ar .sv-drawer.closed { transform: translateX(-100%); }

.sv-drawer__header { padding: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.07); display: flex; justify-content: space-between; align-items: center; }
.sv-drawer__title { font-family: 'Cinzel', serif; font-size: 1.4rem; font-weight: 700; }
.sv-page.ar .sv-drawer__title { font-family: 'Cairo', sans-serif; }
.sv-drawer__close { font-size: 1.8rem; background: none; border: none; cursor: pointer; color: #6B6460; line-height: 1; }

.sv-drawer__body { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.sv-cart-item { display: flex; flex-direction: column; gap: 0.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(0,0,0,0.05); }
.sv-cart-item__top { display: flex; justify-content: space-between; align-items: flex-start; }
.sv-cart-item__name { font-weight: 700; font-size: 1.05rem; }
.sv-cart-item__price { font-weight: 700; color: #B8942F; }
.sv-cart-item__addons { font-size: 0.85rem; color: #6B6460; display: flex; flex-direction: column; gap: 0.25rem; }
.sv-cart-item__addon { display: flex; justify-content: space-between; }
.sv-cart-item__actions { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
.sv-cart-item__qty { display: flex; align-items: center; background: #F2EFE8; border-radius: 6px; }
.sv-cart-item__qty button { padding: 0.3rem 0.6rem; border: none; background: transparent; cursor: pointer; font-weight: bold; font-size: 1rem; }
.sv-cart-item__qty span { width: 20px; text-align: center; font-weight: 600; font-size: 0.9rem; }

.sv-drawer__footer { padding: 1.5rem; border-top: 1px solid rgba(0,0,0,0.07); background: #faf9f6; }
.sv-drawer__total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; font-size: 1.2rem; font-weight: 700; }
.sv-drawer__checkout-btn { width: 100%; padding: 1rem; background: #C9A84C; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 1.05rem; cursor: pointer; transition: all 0.2s; font-family: inherit; margin-bottom: 0.75rem; box-shadow: 0 4px 12px rgba(201,168,76,0.3); }
.sv-drawer__checkout-btn:hover { background: #B8942F; }
.sv-drawer__empty-btn { width: 100%; padding: 0.75rem; background: transparent; color: #C0392B; border: 1px solid #C0392B; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.sv-drawer__empty-btn:hover { background: rgba(192,57,43,0.05); }

/* FORM ELEMENTS */
.sv-form-group { margin-bottom: 1rem; }
.sv-form-label { display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.4rem; color: #1A1714; text-align: start; }
.sv-form-input { width: 100%; padding: 0.8rem 1rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; font-size: 1rem; font-family: inherit; transition: border-color 0.2s; background: #fff; }
.sv-form-input:focus { outline: none; border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
.sv-radio-group { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
.sv-radio-btn { flex: 1; text-align: center; padding: 0.75rem 0.5rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; color: #6B6460; transition: all 0.2s; user-select: none; }
.sv-radio-btn.active { background: rgba(201,168,76,0.1); border-color: #C9A84C; color: #B8942F; }

/* SUCCESS MODAL */
.sv-success-modal { text-align: center; padding: 3rem 2rem; }
.sv-success-icon { width: 80px; height: 80px; background: #22C55E; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1.5rem; box-shadow: 0 4px 20px rgba(34,197,94,0.3); }
.sv-success-title { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; color: #1A1714; }
.sv-success-ord-num { font-size: 2.2rem; font-weight: 900; color: #C9A84C; margin: 1rem 0; font-family: 'Outfit', sans-serif; }
.sv-success-total { font-size: 1.1rem; color: #6B6460; margin-bottom: 2rem; }
.sv-success-btn { width: 100%; padding: 1rem; background: #C9A84C; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; font-family: inherit; box-shadow: 0 4px 12px rgba(201,168,76,0.3); }
.sv-success-btn:hover { background: #B8942F; transform: translateY(-2px); }
`;

/* ======================================
   COMPONENT
   ====================================== */
export default function Menu({ slug }) {
    const [restaurant, setRestaurant] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [quantities, setQuantities] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedAddons, setSelectedAddons] = useState({});
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successOrderNumber, setSuccessOrderNumber] = useState(null);
    const [successOrderTotal, setSuccessOrderTotal] = useState(0);
    const [successPoints, setSuccessPoints] = useState(0);
    const [successCashback, setSuccessCashback] = useState(0);
    
    // Wallet States
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [walletPhone, setWalletPhone] = useState('');
    const [walletData, setWalletData] = useState(null);
    const [walletTransactions, setWalletTransactions] = useState([]);
    const [isFetchingWallet, setIsFetchingWallet] = useState(false);
    const [walletLookupError, setWalletLookupError] = useState(null);
    const [walletNotFound, setWalletNotFound] = useState(false);
    const [redeemPoints, setRedeemPoints] = useState(0);
    const [redeemCashback, setRedeemCashback] = useState(0);
    const [walletInfo, setWalletInfo] = useState(null);

    // Coupon States
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState(null);

    const walletPointsDiscount = (redeemPoints > 0 && restaurant?.min_points_to_redeem > 0) 
        ? (redeemPoints / restaurant.min_points_to_redeem) * restaurant.points_redeem_value 
        : 0;
    const walletCashbackDiscount = redeemCashback;
    const totalWalletDiscount = walletPointsDiscount + walletCashbackDiscount;

    const discountAmount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount) : 0;
    const cartSubtotal   = cart.reduce((sum, item) => sum + item.total, 0);
    const taxableAmount  = Math.max(0, cartSubtotal - discountAmount - totalWalletDiscount);
    const taxRate        = (restaurant?.tax_percentage ?? 8) / 100;
    const cartTax        = taxableAmount * taxRate;
    const cartGrandTotal = taxableAmount + cartTax;
    const cartTotal      = cartGrandTotal;  // kept for back-compat
    const cartCount      = cart.reduce((count, item) => count + item.quantity, 0);

    // Calculated Rewards for Cart
    const earnedRewards = useMemo(() => {
        if (!restaurant) return { points: 0, cashback: 0 };
        const total = cartGrandTotal;
        const minAmount = parseFloat(restaurant.min_order_amount || 0);
        
        if (total < minAmount) return { points: 0, cashback: 0 };

        let pts = 0;
        if (restaurant.points_enabled && restaurant.points_rate > 0) {
            pts = Math.floor(total / restaurant.points_rate);
        }

        let cb = 0;
        if (restaurant.cashback_enabled && restaurant.cashback_percentage > 0) {
            cb = total * (parseFloat(restaurant.cashback_percentage) / 100);
        }

        return { points: pts, cashback: cb };
    }, [cartGrandTotal, restaurant]);

    const [orderForm, setOrderForm] = useState({
        type: 'dine_in',
        table_number: '',
        phone: '',
        car_number: '',
        customer_name: '',
        notes: ''
    });
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(() => {
        try { return JSON.parse(localStorage.getItem(`sv_branch_${slug}`)) || null; } catch { return null; }
    });
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [lang, setLang] = useState(() => {
        try { return localStorage.getItem('sv_lang') || 'ar'; } catch { return 'ar'; }
    });

    const tr = (key) => t[key]?.[lang] ?? t[key]?.ar ?? '';

    /* ── Auto-fetch wallet info during checkout ── */
    useEffect(() => {
        if (isCheckoutOpen && orderForm.phone.length === 9 && orderForm.phone.startsWith('5')) {
            const p = `966${orderForm.phone}`;
            fetch(`/api/${restaurant.slug}/wallet?phone=${p}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setWalletInfo(data);
                    } else {
                        setWalletInfo(null);
                    }
                })
                .catch(() => setWalletInfo(null));
        } else if (!isCheckoutOpen) {
            setWalletInfo(null);
            setRedeemPoints(0);
            setRedeemCashback(0);
        }
    }, [orderForm.phone, isCheckoutOpen, restaurant?.slug]);

    /* ── Read QR params from URL and auto-apply ── */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const qrBranchId = params.get('branch');

        if (qrBranchId) {
            // Branch will be resolved once the API returns branch list — store id for matching
            sessionStorage.setItem(`sv_qr_branch_${slug}`, qrBranchId);
        }
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* Persist language */
    useEffect(() => {
        try { localStorage.setItem('sv_lang', lang); } catch {}
    }, [lang]);

    /* Load cart per slug */
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(`sv_cart_${slug}`);
            if (savedCart) setCart(JSON.parse(savedCart));
            else setCart([]);
        } catch {
            setCart([]);
        }
    }, [slug]);

    /* Save cart per slug */
    useEffect(() => {
        if (!loading) {
            try { localStorage.setItem(`sv_cart_${slug}`, JSON.stringify(cart)); } catch {}
        }
    }, [cart, slug, loading]);

    const didInitBranch = useRef(false);

    /* Fetch menu */
    useEffect(() => {
        // Prevent clearing state if we're just updating the branch
        // but for a clean slug change, we do want to reset.
        const isInitialLoad = !restaurant;
        
        if (isInitialLoad) {
            setLoading(true);
            setCategories([]);
            setProducts([]);
        }
        
        const branchIdParam = selectedBranch?.id ? `?branch_id=${selectedBranch.id}` : '';
        const url = `/api/restaurants/${slug}/menu${branchIdParam}`;

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('not_found');
                return res.json();
            })
            .then(data => {
                setRestaurant(data.restaurant);
                setCategories(data.categories);
                setProducts(data.products);
                
                const branchList = data.branches || [];
                setBranches(branchList);

                // ── QR/Auto-selection Logic (Run only once per mount/slug) ──
                if (!didInitBranch.current) {
                    didInitBranch.current = true;

                    // 1. QR param: auto-select branch
                    const qrBranchId = sessionStorage.getItem(`sv_qr_branch_${slug}`);
                    if (qrBranchId) {
                        const qrBranch = branchList.find(b => 
                            String(b.id) === String(qrBranchId) || 
                            (b.slug && String(b.slug) === String(qrBranchId))
                        );
                        if (qrBranch) {
                            setSelectedBranch(qrBranch);
                            localStorage.setItem(`sv_branch_${slug}`, JSON.stringify(qrBranch));
                            sessionStorage.removeItem(`sv_qr_branch_${slug}`);
                            setIsBranchModalOpen(false);
                            return; // setSelectedBranch will trigger next effect
                        }
                    }

                    // 2. Tenant Isolation Check: If stored branch doesn't belong to this restaurant, clear it.
                    if (selectedBranch && !branchList.some(b => b.id === selectedBranch.id)) {
                        setSelectedBranch(null);
                        localStorage.removeItem(`sv_branch_${slug}`);
                    }

                    // 3. Auto-select if exactly 1 branch
                    if (branchList.length === 1) {
                        const singleBranch = branchList[0];
                        if (!selectedBranch || selectedBranch.id !== singleBranch.id) {
                            setSelectedBranch(singleBranch);
                            localStorage.setItem(`sv_branch_${slug}`, JSON.stringify(singleBranch));
                        }
                        setIsBranchModalOpen(false);
                    }
                    // 4. Multiple branches but none selected -> Show branch selection modal (General QR)
                    else if (branchList.length > 1 && !selectedBranch) {
                        setIsBranchModalOpen(true);
                    }
                }

                setActiveCategory('all');

                // Update currency translation dynamically
                if (data.restaurant.currency) {
                    t.sar.ar = data.restaurant.currency === 'SAR' ? 'ر.س' : data.restaurant.currency;
                    t.sar.en = data.restaurant.currency;
                }
            })
            .catch(err => {
                console.error("Menu fetch error:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    // We depend on slug and selectedBranch.id to avoid unnecessary re-fetches if the whole object changes but ID remains same.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, selectedBranch?.id]);

    /* Filtered products */
    const filteredProducts = useMemo(() => {
        if (activeCategory === 'all') return products;
        return products.filter(p => p.category_id === activeCategory);
    }, [products, activeCategory]);

    const updateQty = (id, delta) => {
        setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }));
    };

    const scrollToMenu = (e) => {
        e.preventDefault();
        document.getElementById('sv-menu')?.scrollIntoView({ behavior: 'smooth' });
    };

    const addToOrderClick = (product) => {
        console.log("Clicked product:", product);
        console.log("Product addons:", product.addons);
        setSelectedProduct(product);
        setSelectedAddons({});
    };

    const closeAddonModal = () => {
        setSelectedProduct(null);
        setSelectedAddons({});
    };

    const toggleAddon = (addonId) => {
        setSelectedAddons(prev => ({ ...prev, [addonId]: !prev[addonId] }));
    };

    const handleBranchSelect = (branch) => {
        setSelectedBranch(branch);
        localStorage.setItem(`sv_branch_${slug}`, JSON.stringify(branch));
        setIsBranchModalOpen(false);
        // Note: cart is already scoped by slug, so we don't necessarily need to clear it here 
        // unless we want branch-specific carts too.
    };

    const getCartItemKey = (product, addons) => {
        const addonIds = addons.map(a => a.id).sort().join('-');
        return `${product.id}-${addonIds}`;
    };

    const confirmAddons = () => {
        if (!selectedProduct) return;
        const quantity = quantities[selectedProduct.id] ?? 1;
        const chosenAddons = (selectedProduct.addons || []).filter(a => selectedAddons[a.id]);
        const addonsSum = chosenAddons.reduce((sum, a) => sum + parseFloat(a.price), 0);
        const itemTotal = (parseFloat(selectedProduct.price) + addonsSum) * quantity;
        
        console.log({
            product: selectedProduct,
            quantity,
            addons: chosenAddons,
            total: itemTotal
        });
        
        const cartKey = getCartItemKey(selectedProduct, chosenAddons);
        
        setCart(prev => {
            const existingIdx = prev.findIndex(item => item.key === cartKey);
            if (existingIdx >= 0) {
                const newCart = [...prev];
                const existing = newCart[existingIdx];
                existing.quantity += quantity;
                existing.total = (parseFloat(existing.product.price) + addonsSum) * existing.quantity;
                return newCart;
            } else {
                return [...prev, {
                    key: cartKey,
                    product: selectedProduct,
                    name: getProductName(selectedProduct, lang),
                    price: parseFloat(selectedProduct.price),
                    quantity,
                    addons: chosenAddons,
                    total: itemTotal
                }];
            }
        });
        
        closeAddonModal();
        setQuantities(prev => ({ ...prev, [selectedProduct.id]: 1 }));
    };

    const updateCartQty = (key, delta) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.key === key) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return null;
                    const addonsSum = item.addons.reduce((sum, a) => sum + parseFloat(a.price), 0);
                    item.quantity = newQty;
                    item.total = (item.price + addonsSum) * newQty;
                    return item;
                }
                return item;
            }).filter(Boolean);
        });
    };



    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        
        setIsValidatingCoupon(true);
        setCouponError(null);
        
        try {
            const response = await fetch(`/api/storefront/${slug}/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: couponCode,
                    order_type: orderForm.type,
                    subtotal: cartSubtotal,
                    phone: orderForm.phone ? `966${orderForm.phone}` : null
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setAppliedCoupon(data);
                setCouponCode('');
            } else {
                setCouponError(data.message);
            }
        } catch (error) {
            setCouponError(lang === 'ar' ? 'خطأ في التحقق من الكوبون' : 'Error validating coupon');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponError(null);
    };

    const handleCheckoutSubmit = async () => {
        const { type, table_number, phone, car_number, customer_name, notes } = orderForm;
        
        if (!phone.trim()) return alert(tr('reqPhone'));

        if (!/^5\d{8}$/.test(phone)) {
            return alert(lang === 'ar' ? 'رقم الجوال يجب أن يبدأ بـ 5 ويتكون من 9 أرقام' : 'Phone number must start with 5 and have 9 digits');
        }

        const normalizedPhone = `966${phone}`;

        if (!customer_name.trim() || customer_name.trim().length < 2) {
            return alert(tr('reqName'));
        }

        if (type === 'dine_in' && !table_number.trim()) return alert(tr('reqTable'));
        if (type === 'car' && !car_number.trim()) return alert(tr('reqCar'));
        
        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    restaurant_slug: slug,
                    order_type: type,
                    table_number,
                    car_number,
                    phone: normalizedPhone,
                    customer_name,
                    notes,
                    cart,
                    branch_id: selectedBranch?.id,
                    coupon_code: appliedCoupon?.code,
                    points_to_redeem: redeemPoints,
                    cashback_to_redeem: redeemCashback
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setSuccessOrderNumber(data.order_number);
                setSuccessOrderTotal(data.total ?? data.order?.total ?? data.order?.data?.total ?? 0);
                setSuccessPoints(data.earned_points ?? 0);
                setSuccessCashback(data.earned_cashback ?? 0);
                setCart([]);
                setAppliedCoupon(null);
                setIsCheckoutOpen(false);
                setIsCartOpen(false);
                setOrderForm({
                    type: 'dine_in',
                    table_number: '',
                    phone: '',
                    car_number: '',
                    customer_name: '',
                    notes: ''
                });
            } else {
                alert(data.message || 'Error occurred while creating the order.');
            }
        } catch (error) {
            console.error(error);
            alert('A network error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchWallet = async (e) => {
        e.preventDefault();
        if (!walletPhone) return;

        setWalletLookupError(null);
        setWalletNotFound(false);
        setWalletData(null);

        let normalized = walletPhone.replace(/\D/g, '');
        if (normalized.startsWith('966')) normalized = normalized.substring(3);
        if (normalized.startsWith('0')) normalized = normalized.substring(1);
        
        // Validation: must be exactly 9 digits starting with 5
        if (!/^5\d{8}$/.test(normalized)) {
            setWalletLookupError(lang === 'ar' 
                ? "رقم الجوال غير صحيح. أدخل رقم سعودي يبدأ بـ 5 ويتكون من 9 أرقام." 
                : "Invalid phone number. Enter a Saudi number starting with 5 and having 9 digits.");
            return;
        }

        normalized = `966${normalized}`;

        setIsFetchingWallet(true);
        try {
            const res = await fetch(`/api/${restaurant.slug}/wallet?phone=${normalized}`);
            const data = await res.json();
            
            if (res.status === 404) {
                setWalletNotFound(true);
                setIsFetchingWallet(false);
                return;
            }

            if (data.success) {
                setWalletData(data);
                if (data.transactions) {
                    setWalletTransactions(data.transactions);
                }
            } else {
                setWalletLookupError(data.message || (lang === 'ar' ? 'فشل في جلب بيانات المحفظة.' : 'Error fetching wallet.'));
            }
        } catch (error) {
            console.error('Wallet fetch error:', error);
            setWalletLookupError(lang === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم.' : 'Connection error.');
        } finally {
            setIsFetchingWallet(false);
        }
    };

    /* ---- Loading ---- */
    if (loading) return (
        <>
            <style>{css}</style>
            <div className="sv-loading">
                <div className="sv-spinner" />
                <p>{tr('loading')}</p>
            </div>
        </>
    );

    /* ---- Error ---- */
    if (error || !restaurant) return (
        <>
            <style>{css}</style>
            <div className="sv-loading">
                <div style={{ fontSize: '3rem' }}>🍽️</div>
                <p style={{ color: '#C0392B', fontFamily: 'Cairo, sans-serif', fontSize: '1.1rem' }}>
                    {tr('notFound')}
                </p>
            </div>
        </>
    );

    const heroName  = lang === 'ar' ? (restaurant.name_ar || restaurant.name_en) : (restaurant.name_en || restaurant.name_ar);
    // logo_url → header logo only; hero_image_url → hero section background only
    const logoUrl   = restaurant.logo_url || restaurant.logo_path;
    const heroBg    = restaurant.hero_image_url || null; // no fallback to logo
    const logoLetter = (restaurant.name_en || 'S').charAt(0);

    return (
        <>
            <Head title={heroName} />
            <style>{css}</style>

            <div className={`sv-page ${lang}`}>

                {/* ── HEADER ── */}
                <header className="sv-header">
                    <div className="sv-header__left" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        {logoUrl ? (
                            <img 
                                src={logoUrl} 
                                alt="logo" 
                                className="sv-logo-img" 
                                onError={e => e.target.style.display='none'} 
                            />
                        ) : (
                            <span className="sv-brand">
                                {lang === 'ar' ? (restaurant.name_ar || restaurant.name_en) : (restaurant.name_en || restaurant.name_ar)}
                            </span>
                        )}
                    </div>
                    <div className="sv-header__right">
                        {selectedBranch ? (
                            <button 
                                className="sv-lang-btn" 
                                style={{ background: 'rgba(201,168,76,0.15)', borderColor: GOLD, color: GOLD_H }}
                                onClick={() => setIsBranchModalOpen(true)}
                            >
                                📍 {lang === 'ar' ? selectedBranch.name_ar : selectedBranch.name_en}
                            </button>
                        ) : branches.length > 1 && (
                            <button 
                                className="sv-lang-btn" 
                                style={{ background: 'rgba(201,168,76,0.15)', borderColor: GOLD, color: GOLD_H }}
                                onClick={() => setIsBranchModalOpen(true)}
                            >
                                📍 {tr('selectBranch')}
                            </button>
                        )}
                        <button 
                            style={{ background: '#1A1714', color: '#C9A84C', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginInlineEnd: '0.5rem' }}
                            onClick={() => window.location.href = '/track'}
                        >
                            {tr('trackOrder')}
                        </button>
                        <button 
                            className="sv-lang-btn" 
                            style={{ marginInlineEnd: '0.5rem', background: '#fef3c7', borderColor: '#f59e0b', color: '#b45309', fontWeight: 700 }}
                            onClick={() => {
                                setIsWalletOpen(true);
                                setWalletLookupError(null);
                                setWalletNotFound(false);
                                setWalletData(null);
                                // Auto-use last phone if available in order form
                                if (!walletPhone && orderForm.phone) {
                                    // Strip 966 if it was normalized for order
                                    const p = orderForm.phone.startsWith('966') ? orderForm.phone.substring(3) : orderForm.phone;
                                    setWalletPhone(p);
                                }
                            }}
                            title={lang === 'ar' ? 'رصيدي' : 'My Balance'}
                        >
                            💰 {lang === 'ar' ? 'رصيدي' : 'Balance'}
                        </button>
                        <button className="sv-cart-btn" onClick={() => setIsCartOpen(true)}>
                            🛒
                            {cartCount > 0 && <span className="sv-cart-badge">{cartCount}</span>}
                        </button>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: restaurant.is_open ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)', color: restaurant.is_open ? '#16a34a' : '#dc2626', border: `1px solid ${restaurant.is_open ? '#86efac' : '#fca5a5'}`, backdropFilter: 'blur(4px)', flexShrink: 0, marginInlineEnd: '0.5rem' }}>
                            {restaurant.is_open ? (lang === 'ar' ? '🟢 مفتوح' : '🟢 Open') : (lang === 'ar' ? '🔴 مغلق' : '🔴 Closed')}
                        </span>
                        <button
                            className="sv-lang-btn"
                            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
                        >
                            {tr('langToggle')}
                        </button>
                    </div>
                </header>

                {/* ── HERO ── */}
                <section className="sv-hero">
                    <div
                        className="sv-hero__bg"
                        style={heroBg
                            ? { backgroundImage: `url('${heroBg}')` }
                            : { background: 'linear-gradient(135deg, #1a1209 0%, #3b2c0d 40%, #5c4219 100%)' }
                        }
                    />
                    <div className="sv-hero__overlay" />
                    <div className="sv-hero__content">
                        {/* No Logo Letter - Uber Eats Style uses Hero background and text only */}
                        <h1 className="sv-hero__title">{restaurant.name_ar}</h1>
                        {restaurant.name_en && (
                            <div className="sv-hero__title-en">{restaurant.name_en}</div>
                        )}
                        <p className="sv-hero__tagline">
                            {lang === 'ar' 
                                ? (restaurant.subtitle_ar || restaurant.subtitle_en || '') 
                                : (restaurant.subtitle_en || restaurant.subtitle_ar || '')}
                        </p>
                        <div className="sv-hero__actions">
                            <button className="sv-btn-primary" onClick={scrollToMenu}>
                                {tr('browseMenu')}
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── MAIN CONTENT ── */}
                <div id="sv-menu" className="sv-content">

                    {/* Category tabs */}
                    <div className="sv-cats-wrap">
                        <nav className="sv-cats">
                            <button
                                className={`sv-cat-btn ${activeCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('all')}
                            >
                                {tr('all')}
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`sv-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    {lang === 'ar' ? cat.name_ar : cat.name_en}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Products grid */}
                    <main className="sv-grid">
                        {filteredProducts.length === 0 ? (
                            <div className="sv-empty">
                                <p>{tr('empty')}</p>
                            </div>
                        ) : (
                            filteredProducts.map(product => {
                                const pName = getProductName(product, lang);
                                const pDesc = getProductDesc(product, lang);
                                const qty = quantities[product.id] ?? 1;

                                return (
                                    <div key={product.id} className="sv-card">
                                        {/* Image */}
                                        <div className="sv-card__img-wrap">
                                            {product.image_path ? (
                                                <>
                                                    <img
                                                        className="sv-card__img"
                                                        src={product.image_path}
                                                        alt={pName}
                                                        onError={e => {
                                                            e.currentTarget.style.display = 'none';
                                                            if (e.currentTarget.nextElementSibling) {
                                                                e.currentTarget.nextElementSibling.style.display = 'flex';
                                                            }
                                                        }}
                                                    />
                                                    <div className="sv-card__placeholder" style={{ display: 'none' }}>
                                                        🍽️
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="sv-card__placeholder">
                                                    🍽️
                                                </div>
                                            )}
                                        </div>

                                        {/* Body */}
                                        <div className="sv-card__body">
                                            <div className="sv-card__head">
                                                <h3 className="sv-card__name">{pName}</h3>
                                                <span className="sv-card__price">
                                                    {parseFloat(product.price).toFixed(2)} {tr('sar')}
                                                </span>
                                            </div>

                                            {pDesc && (
                                                <p className="sv-card__desc">{pDesc}</p>
                                            )}

                                            {/* Actions: qty + add button (visual only) */}
                                            <div className="sv-card__actions">
                                                <div className="sv-card__qty">
                                                    <button
                                                        aria-label="decrease"
                                                        onClick={() => updateQty(product.id, -1)}
                                                    >−</button>
                                                    <span>{qty}</span>
                                                    <button
                                                        aria-label="increase"
                                                        onClick={() => updateQty(product.id, 1)}
                                                    >+</button>
                                                </div>
                                                <button className="sv-card__add-btn" onClick={() => addToOrderClick(product)}>
                                                    <span>{product.addons && product.addons.length > 0 ? tr('customize') : tr('addToOrder')}</span>
                                                    <span style={{ fontSize: '1rem' }}>+</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </main>
                </div>

                {/* ── ADDONS MODAL ── */}
                {selectedProduct && (
                    <div className="sv-modal-overlay" onClick={closeAddonModal}>
                        <div className="sv-modal" onClick={e => e.stopPropagation()}>
                            <div className="sv-modal__header">
                                {selectedProduct.image_path ? (
                                    <img src={selectedProduct.image_path} alt={getProductName(selectedProduct, lang)} className="sv-modal__img" />
                                ) : (
                                    <div className="sv-card__placeholder" style={{ display: 'flex' }}>🍽️</div>
                                )}
                                <button className="sv-modal__close" onClick={closeAddonModal}>×</button>
                            </div>
                            <div className="sv-modal__body">
                                <h3 className="sv-modal__title">{getProductName(selectedProduct, lang)}</h3>
                                <div className="sv-modal__price" style={{ marginBottom: '1rem' }}>
                                    {parseFloat(selectedProduct.price).toFixed(2)} {tr('sar')}
                                </div>
                                
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div className="sv-card__qty" style={{ display: 'inline-flex' }}>
                                        <button aria-label="decrease" onClick={() => updateQty(selectedProduct.id, -1)}>−</button>
                                        <span>{quantities[selectedProduct.id] ?? 1}</span>
                                        <button aria-label="increase" onClick={() => updateQty(selectedProduct.id, 1)}>+</button>
                                    </div>
                                </div>
                                
                                {selectedProduct.addons && selectedProduct.addons.length > 0 ? (
                                    <>
                                        <div className="sv-modal__section-title">{tr('addonsTitle')}</div>
                                        <div>
                                            {selectedProduct.addons.map(addon => (
                                                <label key={addon.id} className="sv-addon-item">
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={!!selectedAddons[addon.id]}
                                                            onChange={() => toggleAddon(addon.id)}
                                                        />
                                                        <span className="sv-addon-name">
                                                            {lang === 'ar' ? (addon.name_ar || addon.name_en) : (addon.name_en || addon.name_ar)}
                                                        </span>
                                                    </div>
                                                    <span className="sv-addon-price">
                                                        +{parseFloat(addon.price).toFixed(2)} {tr('sar')}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ color: '#6B6460', fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                        {tr('noAddonsMsg')}
                                    </p>
                                )}
                            </div>
                            <div className="sv-modal__footer">
                                <div className="sv-modal__total">
                                    {tr('total')}: <span className="sv-modal__total-val">
                                        {((parseFloat(selectedProduct.price) + 
                                        (selectedProduct.addons || [])
                                            .filter(a => selectedAddons[a.id])
                                            .reduce((sum, a) => sum + parseFloat(a.price), 0)) * (quantities[selectedProduct.id] ?? 1)).toFixed(2)} {tr('sar')}
                                    </span>
                                </div>
                                <button className="sv-modal__btn-cancel" onClick={closeAddonModal}>{tr('cancel')}</button>
                                <button className="sv-modal__btn-add" onClick={confirmAddons}>{tr('addToCart')}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── CART DRAWER ── */}
                {isCartOpen && (
                    <div className="sv-drawer-overlay" onClick={() => setIsCartOpen(false)} />
                )}
                <div className={`sv-drawer ${isCartOpen ? '' : 'closed'}`}>
                    <div className="sv-drawer__header">
                        <h2 className="sv-drawer__title">{tr('cart')}</h2>
                        <button className="sv-drawer__close" onClick={() => setIsCartOpen(false)}>×</button>
                    </div>
                    
                    <div className="sv-drawer__body">
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', color: MUTED, marginTop: '2rem' }}>
                                🛒 {tr('cartEmpty')}
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.key} className="sv-cart-item">
                                    <div className="sv-cart-item__top">
                                        <div className="sv-cart-item__name">{item.name}</div>
                                        <div className="sv-cart-item__price">{item.total.toFixed(2)} {tr('sar')}</div>
                                    </div>
                                    
                                    {item.addons.length > 0 && (
                                        <div className="sv-cart-item__addons">
                                            {item.addons.map(a => (
                                                <div key={a.id} className="sv-cart-item__addon">
                                                    <span>+ {lang === 'ar' ? (a.name_ar || a.name_en) : (a.name_en || a.name_ar)}</span>
                                                    <span>{parseFloat(a.price).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="sv-cart-item__actions">
                                        <div className="sv-cart-item__qty">
                                            <button onClick={() => updateCartQty(item.key, -1)}>−</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateCartQty(item.key, 1)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {cart.length > 0 && (
                        <div className="sv-drawer__footer">
                            {/* Tax breakdown */}
                            <div style={{ marginBottom: '0.75rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B6460' }}>
                                    <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                                    <span>{cartSubtotal.toFixed(2)} {tr('sar')}</span>
                                </div>
                                {appliedCoupon && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 700 }}>
                                        <span>{lang === 'ar' ? `الخصم (${appliedCoupon.code})` : `Discount (${appliedCoupon.code})`}</span>
                                        <span>-{discountAmount.toFixed(2)} {tr('sar')}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B6460' }}>
                                    <span>{lang === 'ar' ? `ضريبة القيمة المضافة (${restaurant.tax_percentage ?? 8}%)` : `VAT (${restaurant.tax_percentage ?? 8}%)`}</span>
                                    <span>{cartTax.toFixed(2)} {tr('sar')}</span>
                                </div>
                                <div className="sv-drawer__total-row" style={{ margin: 0, paddingTop: '0.4rem', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                                    <span>{tr('total')}</span>
                                    <span>{cartGrandTotal.toFixed(2)} {tr('sar')}</span>
                                </div>
                                
                                {earnedRewards.points > 0 || earnedRewards.cashback > 0 ? (
                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fefce8', border: '1px dashed #facc15', borderRadius: '8px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#854d0e', marginBottom: '0.2rem' }}>
                                            {lang === 'ar' ? '✨ ستحصل على:' : '✨ You will earn:'}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {earnedRewards.points > 0 && (
                                                <span style={{ color: '#166534' }}>⭐ {earnedRewards.points} {lang === 'ar' ? 'نقطة' : 'Points'}</span>
                                            )}
                                            {earnedRewards.cashback > 0 && (
                                                <span style={{ color: '#166534' }}>💰 {earnedRewards.cashback.toFixed(2)} {lang === 'ar' ? 'ريال كاش باك' : 'SAR Cashback'}</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    restaurant?.min_order_amount > 0 && cartGrandTotal < restaurant.min_order_amount && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                                            {lang === 'ar' ? `أضف بقيمة ${(restaurant.min_order_amount - cartGrandTotal).toFixed(2)} ${tr('sar')} للحصول على مكافآت` : `Add ${(restaurant.min_order_amount - cartGrandTotal).toFixed(2)} more to get rewards`}
                                        </div>
                                    )
                                )}
                            </div>
                            <button className="sv-drawer__checkout-btn" onClick={() => {
                                setIsCartOpen(false);
                                setTimeout(() => setIsCheckoutOpen(true), 150);
                            }}>
                                {tr('checkout')}
                            </button>
                            <button className="sv-drawer__empty-btn" onClick={() => setCart([])}>
                                {tr('emptyCart')}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── CHECKOUT MODAL ── */}
                {isCheckoutOpen && (
                    <div className="sv-modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
                        <div className="sv-modal" style={{ padding: '0' }} onClick={e => e.stopPropagation()}>
                            <div className="sv-modal__body" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 className="sv-drawer__title" style={{ margin: 0 }}>{tr('checkoutTitle')}</h2>
                                    <button className="sv-drawer__close" onClick={() => setIsCheckoutOpen(false)}>×</button>
                                </div>

                                <div className="sv-radio-group">
                                    <div className={`sv-radio-btn ${orderForm.type === 'dine_in' ? 'active' : ''}`} onClick={() => setOrderForm(prev => ({...prev, type: 'dine_in'}))}>
                                        {tr('dineIn')}
                                    </div>
                                    <div className={`sv-radio-btn ${orderForm.type === 'takeaway' ? 'active' : ''}`} onClick={() => setOrderForm(prev => ({...prev, type: 'takeaway'}))}>
                                        {tr('takeaway')}
                                    </div>
                                    <div className={`sv-radio-btn ${orderForm.type === 'car' ? 'active' : ''}`} onClick={() => setOrderForm(prev => ({...prev, type: 'car'}))}>
                                        {tr('inCar')}
                                    </div>
                                </div>

                                {orderForm.type === 'dine_in' && (
                                    <div className="sv-form-group">
                                        <label className="sv-form-label">{tr('tableNumber')}</label>
                                        <input type="text" className="sv-form-input" value={orderForm.table_number} onChange={e => setOrderForm(prev => ({...prev, table_number: e.target.value}))} />
                                    </div>
                                )}

                                <div className="sv-form-group">
                                    <label className="sv-form-label">{tr('phoneNumber')}</label>
                                    <div style={{ display: 'flex', direction: 'ltr' }}>
                                        <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRight: 'none', padding: '0.75rem 1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: '#6B7280', display: 'flex', alignItems: 'center', fontWeight: 600 }}>+966</div>
                                        <input 
                                            type="tel" 
                                            className="sv-form-input" 
                                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                            placeholder="5xxxxxxxx" 
                                            value={orderForm.phone} 
                                            onChange={e => {
                                                let val = e.target.value.replace(/\D/g, '');
                                                if (val.startsWith('0')) {
                                                    val = val.substring(1);
                                                }
                                                setOrderForm(prev => ({...prev, phone: val}));
                                            }} 
                                        />
                                    </div>
                                </div>

                                {orderForm.type === 'car' && (
                                    <div className="sv-form-group">
                                        <label className="sv-form-label">{tr('carNumber')}</label>
                                        <input type="text" className="sv-form-input" value={orderForm.car_number} onChange={e => setOrderForm(prev => ({...prev, car_number: e.target.value}))} />
                                    </div>
                                )}

                                <div className="sv-form-group">
                                    <label className="sv-form-label">
                                        {tr('customerName')} <span style={{ color: '#E74C3C' }}>*</span>
                                    </label>
                                    <input type="text" className="sv-form-input" placeholder={lang === 'ar' ? 'أدخل اسمك' : 'Enter your name'} value={orderForm.customer_name} onChange={e => setOrderForm(prev => ({...prev, customer_name: e.target.value}))} />
                                </div>

                                <div className="sv-form-group">
                                    <label className="sv-form-label">{tr('notes')}</label>
                                    <textarea className="sv-form-input" style={{ minHeight: '80px' }} value={orderForm.notes} onChange={e => setOrderForm(prev => ({...prev, notes: e.target.value}))} />
                                </div>

                                {/* Totals Breakdown in Checkout */}
                                <div style={{ marginTop: '1.5rem', background: '#F2EFE8', padding: '1rem', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#6B6460' }}>
                                        <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                                        <span>{cartSubtotal.toFixed(2)} {tr('sar')}</span>
                                    </div>
                                    
                                    {/* Coupon Section */}
                                    <div style={{ marginBottom: '0.8rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                        {!appliedCoupon ? (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input 
                                                    type="text" 
                                                    placeholder={lang === 'ar' ? 'كود الخصم' : 'Coupon Code'} 
                                                    className="sv-form-input" 
                                                    style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                                                    value={couponCode}
                                                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                />
                                                <button 
                                                    className="sv-btn-primary" 
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                                    onClick={handleApplyCoupon}
                                                    disabled={isValidatingCoupon}
                                                >
                                                    {isValidatingCoupon ? '...' : (lang === 'ar' ? 'تطبيق' : 'Apply')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', padding: '0.5rem', borderRadius: '6px', border: '1px solid #10b981' }}>
                                                <div style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 700 }}>
                                                    ✅ {appliedCoupon.code} (-{discountAmount.toFixed(2)} {tr('sar')})
                                                </div>
                                                <button 
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
                                                    onClick={removeCoupon}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                        {couponError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>{couponError}</div>}
                                    </div>

                                    {/* Wallet Redemption Section */}
                                    {walletInfo && (walletInfo.points > 0 || walletInfo.cashback_balance > 0) && (
                                        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fff', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1A1714' }}>
                                                {lang === 'ar' ? 'استخدام المحفظة والمكافآت' : 'Use Wallet & Rewards'}
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {/* Points Redemption */}
                                                {restaurant.points_enabled && walletInfo.points > 0 && (
                                                    <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.8rem', color: '#6B6460' }}>
                                                                ⭐ {lang === 'ar' ? `رصيدك: ${walletInfo.points} نقطة` : `Balance: ${walletInfo.points} pts`}
                                                            </span>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
                                                                {redeemPoints > 0 ? `-${walletPointsDiscount.toFixed(2)} ${tr('sar')}` : ''}
                                                            </span>
                                                        </div>
                                                        {walletInfo.points < restaurant.min_points_to_redeem ? (
                                                            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                                                {lang === 'ar' ? `لا يمكنك استخدام النقاط قبل الوصول إلى ${restaurant.min_points_to_redeem} نقطة` : `Min ${restaurant.min_points_to_redeem} points required`}
                                                            </div>
                                                        ) : cartSubtotal < restaurant.min_order_amount_for_wallet_redeem ? (
                                                            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                                                {lang === 'ar' ? `الحد الأدنى للطلب لاستخدام المحفظة هو ${restaurant.min_order_amount_for_wallet_redeem} ر.س` : `Min order for wallet use is ${restaurant.min_order_amount_for_wallet_redeem} SAR`}
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <select 
                                                                    className="sv-form-input" 
                                                                    style={{ padding: '0.3rem', fontSize: '0.8rem', width: 'auto' }}
                                                                    value={redeemPoints}
                                                                    onChange={e => {
                                                                        const val = parseInt(e.target.value);
                                                                        // Check max discount percentage
                                                                        const potentialDiscount = (val / restaurant.min_points_to_redeem) * restaurant.points_redeem_value + walletCashbackDiscount;
                                                                        const maxDiscount = cartSubtotal * (restaurant.max_wallet_discount_percentage / 100);
                                                                        if (potentialDiscount > maxDiscount) {
                                                                            alert(lang === 'ar' ? `لا يمكن أن يتجاوز خصم المحفظة ${restaurant.max_wallet_discount_percentage}% من الطلب` : `Wallet discount cannot exceed ${restaurant.max_wallet_discount_percentage}%`);
                                                                            return;
                                                                        }
                                                                        setRedeemPoints(val);
                                                                    }}
                                                                >
                                                                    <option value="0">{lang === 'ar' ? 'عدم استخدام نقاط' : 'Don\'t use points'}</option>
                                                                    {Array.from({ length: Math.floor(walletInfo.points / restaurant.min_points_to_redeem) }, (_, i) => (i + 1) * restaurant.min_points_to_redeem).map(p => (
                                                                        <option key={p} value={p}>{p} {lang === 'ar' ? 'نقطة' : 'pts'}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Cashback Redemption */}
                                                {restaurant.cashback_enabled && walletInfo.cashback_balance > 0 && (
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontSize: '0.8rem', color: '#6B6460' }}>
                                                                💰 {lang === 'ar' ? `رصيدك: ${parseFloat(walletInfo.cashback_balance).toFixed(2)} ر.س` : `Balance: ${parseFloat(walletInfo.cashback_balance).toFixed(2)} SAR`}
                                                            </span>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
                                                                {redeemCashback > 0 ? `-${redeemCashback.toFixed(2)} ${tr('sar')}` : ''}
                                                            </span>
                                                        </div>
                                                        {walletInfo.cashback_balance < restaurant.min_cashback_to_redeem ? (
                                                            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                                                {lang === 'ar' ? `لا يمكنك استخدام الكاش باك قبل الوصول إلى ${restaurant.min_cashback_to_redeem} ر.س` : `Min ${restaurant.min_cashback_to_redeem} SAR required`}
                                                            </div>
                                                        ) : cartSubtotal < restaurant.min_order_amount_for_wallet_redeem ? (
                                                            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                                                {/* Already shown in points section if points are enabled, but good to have here too */}
                                                                {lang === 'ar' ? `الحد الأدنى للطلب لاستخدام المحفظة هو ${restaurant.min_order_amount_for_wallet_redeem} ر.س` : `Min order for wallet use is ${restaurant.min_order_amount_for_wallet_redeem} SAR`}
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <input 
                                                                    type="range" 
                                                                    min="0" 
                                                                    max={Math.min(walletInfo.cashback_balance, cartSubtotal * (restaurant.max_wallet_discount_percentage / 100) - walletPointsDiscount)} 
                                                                    step="1"
                                                                    value={redeemCashback}
                                                                    onChange={e => setRedeemCashback(parseFloat(e.target.value))}
                                                                    style={{ flex: 1, accentColor: GOLD }}
                                                                />
                                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '40px' }}>{redeemCashback}</span>
                                                                <button 
                                                                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                                                    onClick={() => {
                                                                        const maxAvailable = Math.min(walletInfo.cashback_balance, cartSubtotal * (restaurant.max_wallet_discount_percentage / 100) - walletPointsDiscount);
                                                                        setRedeemCashback(maxAvailable);
                                                                    }}
                                                                >
                                                                    {lang === 'ar' ? 'الأقصى' : 'Max'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {appliedCoupon && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#16a34a', fontWeight: 700 }}>
                                            <span>{lang === 'ar' ? 'الخصم' : 'Discount'}</span>
                                            <span>-{discountAmount.toFixed(2)} {tr('sar')}</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem', color: '#6B6460' }}>
                                        <span>{lang === 'ar' ? `الضريبة (${restaurant.tax_percentage ?? 8}%)` : `VAT (${restaurant.tax_percentage ?? 8}%)`}</span>
                                        <span>{cartTax.toFixed(2)} {tr('sar')}</span>
                                    </div>

                                    {totalWalletDiscount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#16a34a', fontWeight: 700 }}>
                                            <span>{lang === 'ar' ? 'خصم المحفظة' : 'Wallet Discount'}</span>
                                            <span>-{totalWalletDiscount.toFixed(2)} {tr('sar')}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: '#1A1714', paddingTop: '0.6rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                        <span>{tr('total')}</span>
                                        <span>{cartGrandTotal.toFixed(2)} {tr('sar')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="sv-modal__footer" style={{ borderTop: 'none', paddingTop: '0' }}>
                                <button className="sv-drawer__checkout-btn" style={{ margin: 0 }} disabled={isSubmitting} onClick={handleCheckoutSubmit}>
                                    {isSubmitting ? tr('submitting') : tr('confirmOrder')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SUCCESS MODAL ── */}
                {successOrderNumber && (
                    <div className="sv-modal-overlay">
                        <div className="sv-modal" onClick={e => e.stopPropagation()}>
                            <div className="sv-success-modal">
                                <div className="sv-success-icon">✓</div>
                                <h2 className="sv-success-title">{tr('orderSuccessMsg')}</h2>
                                <p style={{ color: '#6B6460' }}>{lang === 'ar' ? 'رقم طلبك هو' : 'Your order number is'}</p>
                                <div className="sv-success-ord-num">{successOrderNumber}</div>
                                <div className="sv-success-total">
                                    {tr('total')}: <span style={{ fontWeight: 800, color: '#1A1714' }}>{parseFloat(successOrderTotal).toFixed(2)} {tr('sar')}</span>
                                </div>
                                {(successPoints > 0 || successCashback > 0) && (
                                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>
                                            {lang === 'ar' ? '✨ حصلت على:' : '✨ You earned:'}
                                        </div>
                                        {successPoints > 0 && <div style={{ color: '#15803d', fontWeight: 700, marginBottom: '0.25rem' }}>⭐ {successPoints} {lang === 'ar' ? 'نقطة' : 'Points'}</div>}
                                        {successCashback > 0 && <div style={{ color: '#15803d', fontWeight: 700 }}>💰 {parseFloat(successCashback).toFixed(2)} {lang === 'ar' ? 'ريال كاش باك' : 'SAR Cashback'}</div>}
                                    </div>
                                )}
                                <button 
                                    className="sv-success-btn"
                                    onClick={() => window.location.href = `/track/${successOrderNumber}`}
                                >
                                    {tr('trackOrder')}
                                </button>
                                <button 
                                    style={{ background: 'transparent', border: 'none', marginTop: '1.5rem', color: MUTED, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                                    onClick={() => setSuccessOrderNumber(null)}
                                >
                                    {lang === 'ar' ? 'إغلاق' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── WALLET MODAL ── */}
                {isWalletOpen && (
                    <div className="sv-modal-overlay" onClick={() => setIsWalletOpen(false)}>
                        <div className="sv-modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                            <div className="sv-modal__header" style={{ padding: '1.25rem 1.5rem' }}>
                                <button className="sv-modal__close" onClick={() => setIsWalletOpen(false)}>&times;</button>
                                <h2 className="sv-modal__title">{lang === 'ar' ? 'المحفظة والمكافآت 💳' : 'Wallet & Rewards 💳'}</h2>
                            </div>
                            <div className="sv-modal__body" style={{ padding: '1.5rem' }}>
                                {!walletData ? (
                                    <form onSubmit={fetchWallet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <p style={{ color: '#6B6460' }}>
                                            {lang === 'ar' ? 'أدخل رقم هاتفك للتحقق من رصيد محفظتك ونقاط الولاء.' : 'Enter your phone number to check your wallet balance and loyalty points.'}
                                        </p>
                                        
                                        <div className="sv-form-group" style={{ marginBottom: 0 }}>
                                            <div style={{ display: 'flex', direction: 'ltr' }}>
                                                <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRight: 'none', padding: '0.75rem 1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: '#6B7280', display: 'flex', alignItems: 'center', fontWeight: 600 }}>+966</div>
                                                <input 
                                                    type="tel" 
                                                    className="sv-form-input" 
                                                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                                    placeholder="5xxxxxxxx" 
                                                    value={walletPhone} 
                                                    onChange={e => {
                                                        let val = e.target.value.replace(/\D/g, '');
                                                        if (val.startsWith('0')) {
                                                            val = val.substring(1);
                                                        }
                                                        setWalletPhone(val);
                                                    }} 
                                                />
                                            </div>
                                            {walletLookupError && (
                                                <div style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'start' }}>
                                                    {walletLookupError}
                                                </div>
                                            )}
                                        </div>

                                        {walletNotFound && (
                                            <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.5rem' }}>
                                                    {lang === 'ar' ? 'لا توجد محفظة أو مكافآت لهذا الرقم حتى الآن.' : 'No wallet or rewards found for this number yet.'}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#B91C1C' }}>
                                                    {lang === 'ar' ? 'اطلب من المطعم أولاً لتبدأ في جمع النقاط والكاش باك.' : 'Order from the restaurant first to start collecting points and cashback.'}
                                                </div>
                                            </div>
                                        )}

                                        <button 
                                            type="submit" 
                                            disabled={isFetchingWallet || !walletPhone}
                                            style={{ background: '#1A1714', color: '#fff', padding: '0.8rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: (isFetchingWallet || !walletPhone) ? 0.7 : 1 }}
                                        >
                                            {isFetchingWallet ? (lang === 'ar' ? 'جاري التحقق...' : 'Checking...') : (lang === 'ar' ? 'عرض المحفظة' : 'View Wallet')}
                                        </button>
                                    </form>
                                ) : (
                                    <div>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ flex: 1, background: '#f3f4f6', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: 700 }}>{lang === 'ar' ? '💰 الكاش باك' : '💰 Cashback'}</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A1714' }}>{parseFloat(walletData.cashback_balance).toFixed(2)} {tr('sar')}</div>
                                            </div>
                                            <div style={{ flex: 1, background: '#f0fdf4', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '0.25rem', fontWeight: 700 }}>{lang === 'ar' ? '⭐ النقاط' : '⭐ Points'}</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534' }}>{walletData.points}</div>
                                            </div>
                                        </div>
                                        
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>{lang === 'ar' ? 'سجل العمليات' : 'Transaction History'}</h3>
                                        {walletTransactions.length === 0 ? (
                                            <p style={{ color: '#6B6460', textAlign: 'center', padding: '1rem' }}>{lang === 'ar' ? 'لا توجد عمليات سابقة' : 'No past transactions'}</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                                                {walletTransactions.map(tx => (
                                                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>{tx.description}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{new Date(tx.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</div>
                                                        </div>
                                                        <div style={{ fontWeight: 700, color: tx.type.includes('earned') ? '#16A34A' : '#EF4444' }}>
                                                            {tx.type.includes('earned') ? '+' : '-'}
                                                            {tx.type.includes('points') 
                                                                ? `${Math.floor(tx.amount)} ${lang === 'ar' ? 'نقطة' : 'pts'}` 
                                                                : `${parseFloat(tx.amount).toFixed(2)} ${tr('sar')}`}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => setWalletData(null)}
                                            style={{ width: '100%', marginTop: '1.5rem', background: '#F3F4F6', color: '#374151', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            {lang === 'ar' ? 'بحث برقم آخر' : 'Search Another Number'}
                                        </button>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── BRANCH MODAL ── */}
                {isBranchModalOpen && (
                    <div className="sv-modal-overlay">
                        <div className="sv-modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                            <div className="sv-modal__body" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                                <h2 className="sv-modal__title">{tr('branchTitle')}</h2>
                                <p style={{ color: MUTED, fontSize: '0.9rem', marginBottom: '1.5rem' }}>{tr('branchDesc')}</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {branches.map(branch => (
                                        <div 
                                            key={branch.id} 
                                            onClick={() => handleBranchSelect(branch)}
                                            style={{ 
                                                padding: '1rem', 
                                                border: '1.5px solid #eee', 
                                                borderRadius: '12px', 
                                                cursor: 'pointer', 
                                                textAlign: 'start',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.borderColor = GOLD}
                                            onMouseOut={e => e.currentTarget.style.borderColor = '#eee'}
                                        >
                                            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                                                {lang === 'ar' ? branch.name_ar : branch.name_en}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: MUTED }}>
                                                {branch.address || branch.phone}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {selectedBranch && (
                                <div className="sv-modal__footer" style={{ borderTop: '1px solid #eee', justifyContent: 'center' }}>
                                    <button 
                                        className="sv-modal__btn-cancel" 
                                        style={{ width: '100%' }}
                                        onClick={() => setIsBranchModalOpen(false)}
                                    >
                                        {tr('cancel')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
