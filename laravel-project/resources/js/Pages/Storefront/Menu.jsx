import { useEffect, useState, useMemo } from 'react';
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
    heroTagline: { ar: 'استكشف فن الطهي والمذاق الراقي', en: 'Experience the Art of Fine Dining' },
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
    customerName:{ ar: 'الاسم (اختياري)',                 en: 'Name (Optional)' },
    notes:       { ar: 'ملاحظات (اختياري)',               en: 'Notes (Optional)' },
    confirmOrder:{ ar: 'تأكيد الطلب',                     en: 'Confirm Order' },
    reqTable:    { ar: 'يرجى إدخال رقم الطاولة',          en: 'Please enter table number' },
    reqPhone:    { ar: 'يرجى إدخال رقم الجوال',           en: 'Please enter phone number' },
    reqCar:      { ar: 'يرجى إدخال بيانات السيارة',       en: 'Please enter car details' },
    orderSuccess:{ ar: 'تم إنشاء الطلب بنجاح. رقم الطلب: ', en: 'Order created successfully. Order number: ' },
    submitting:  { ar: 'جاري الإرسال...',                 en: 'Submitting...' },
    trackOrder:  { ar: 'تتبع الطلب',                      en: 'Track Order' },
    orderSuccessMsg: { ar: 'تم إنشاء الطلب بنجاح',        en: 'Order created successfully' },
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
.sv-header__left { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
.sv-logo-sm { width: 40px; height: 40px; background: ${GOLD}; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 800; color: #fff; box-shadow: 0 2px 10px rgba(201,168,76,0.35); flex-shrink: 0; }
.sv-brand { font-family: 'Cinzel', serif; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.1em; color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,0.3); }
.sv-header__right { display: flex; align-items: center; gap: 1rem; }
.sv-lang-btn { font-size: 0.875rem; font-weight: 600; color: #fff; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.35); padding: 0.4rem 0.9rem; border-radius: 8px; cursor: pointer; backdrop-filter: blur(8px); transition: all 0.2s; font-family: inherit; }
.sv-lang-btn:hover { background: rgba(255,255,255,0.28); }

/* HERO */
.sv-hero { position: relative; height: 72vh; min-height: 560px; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; }
.sv-hero__bg { position: absolute; inset: 0; background-size: cover; background-position: center; transform: scale(1.04); }
.sv-hero__overlay { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(26,23,20,0.55) 0%, rgba(26,23,20,0.35) 50%, rgba(247,245,240,0.9) 100%); z-index: 1; }
.sv-hero__content { position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; padding: 0 1rem; max-width: 700px; }
.sv-hero__logo { width: 76px; height: 76px; background: ${GOLD}; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-size: 2.2rem; font-weight: 800; color: #fff; box-shadow: 0 4px 24px rgba(201,168,76,0.45); margin-bottom: 1.25rem; }
.sv-hero__title { font-family: 'Cinzel', serif; font-size: clamp(2.4rem,6vw,4.2rem); font-weight: 700; letter-spacing: 0.08em; line-height: 1.1; color: #fff; margin-bottom: 0.9rem; text-shadow: 0 3px 18px rgba(0,0,0,0.5); }
.sv-hero__tagline { font-size: clamp(0.9rem,2vw,1.1rem); color: rgba(255,255,255,0.85); font-weight: 400; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 2.5rem; }
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
    const [orderForm, setOrderForm] = useState({
        type: 'dine_in',
        table_number: '',
        phone: '',
        car_number: '',
        customer_name: '',
        notes: ''
    });
    const [lang, setLang] = useState(() => {
        try { return localStorage.getItem('sv_lang') || 'ar'; } catch { return 'ar'; }
    });

    const tr = (key) => t[key]?.[lang] ?? t[key]?.ar ?? '';

    /* Persist language */
    useEffect(() => {
        try { localStorage.setItem('sv_lang', lang); } catch {}
    }, [lang]);

    /* Fetch menu */
    useEffect(() => {
        setLoading(true);
        fetch(`/api/restaurants/${slug}/menu`)
            .then(res => {
                if (!res.ok) throw new Error('not_found');
                return res.json();
            })
            .then(data => {
                setRestaurant(data.restaurant);
                setCategories(data.categories);
                setProducts(data.products);
                setActiveCategory('all');
                
                // Update currency translation dynamically
                if (data.restaurant.currency) {
                    t.sar.ar = data.restaurant.currency === 'SAR' ? 'ر.س' : data.restaurant.currency;
                    t.sar.en = data.restaurant.currency;
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [slug]);

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

    const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    const handleCheckoutSubmit = async () => {
        const { type, table_number, phone, car_number, customer_name, notes } = orderForm;
        
        if (type === 'dine_in' && !table_number.trim()) return alert(tr('reqTable'));
        if (type === 'takeaway' && !phone.trim()) return alert(tr('reqPhone'));
        if (type === 'car') {
            if (!car_number.trim()) return alert(tr('reqCar'));
            if (!phone.trim()) return alert(tr('reqPhone'));
        }
        
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
                    phone,
                    customer_name,
                    notes,
                    cart,
                    total: cartTotal
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setSuccessOrderNumber(data.order_number);
                setCart([]);
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

    const heroName = lang === 'ar' ? (restaurant.name_ar || restaurant.name_en) : (restaurant.name_en || restaurant.name_ar);
    const heroBg = restaurant.hero_image_url || restaurant.logo_url || restaurant.logo_path;
    const logoLetter = (restaurant.name_en || 'S').charAt(0);

    return (
        <>
            <Head title={heroName} />
            <style>{css}</style>

            <div className={`sv-page ${lang}`}>

                {/* ── HEADER ── */}
                <header className="sv-header">
                    <div className="sv-header__left">
                        <div className="sv-logo-sm">{logoLetter}</div>
                        <span className="sv-brand">{lang === 'ar' ? (restaurant.name_ar || restaurant.name_en) : (restaurant.name_en || restaurant.name_ar)}</span>
                        {/* is_open badge */}
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            background: restaurant.is_open ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)',
                            color: restaurant.is_open ? '#16a34a' : '#dc2626',
                            border: `1px solid ${restaurant.is_open ? '#86efac' : '#fca5a5'}`,
                            backdropFilter: 'blur(4px)',
                        }}>
                            {restaurant.is_open
                                ? (lang === 'ar' ? '🟢 مفتوح' : '🟢 Open')
                                : (lang === 'ar' ? '🔴 مغلق' : '🔴 Closed')}
                        </span>
                    </div>
                    <div className="sv-header__right">
                        <button 
                            style={{ background: '#1A1714', color: '#C9A84C', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginInlineEnd: '0.5rem' }}
                            onClick={() => window.location.href = '/track'}
                        >
                            {tr('trackOrder')}
                        </button>
                        <button className="sv-cart-btn" onClick={() => setIsCartOpen(true)}>
                            🛒
                            {cartCount > 0 && <span className="sv-cart-badge">{cartCount}</span>}
                        </button>
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
                        <div className="sv-hero__logo">{logoLetter}</div>
                        <h1 className="sv-hero__title">{heroName}</h1>
                        <p className="sv-hero__tagline">{tr('heroTagline')}</p>
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
                            <div className="sv-drawer__total-row">
                                <span>{tr('total')}</span>
                                <span>{cartTotal.toFixed(2)} {tr('sar')}</span>
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
                        <div className="sv-modal" style={{ padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 className="sv-modal__title" style={{ margin: 0 }}>{tr('checkoutTitle')}</h3>
                                <button className="sv-drawer__close" onClick={() => setIsCheckoutOpen(false)}>×</button>
                            </div>
                            
                            <div className="sv-radio-group">
                                <div className={`sv-radio-btn ${orderForm.type === 'dine_in' ? 'active' : ''}`} onClick={() => setOrderForm(p => ({...p, type: 'dine_in'}))}>
                                    🍽️ {tr('dineIn')}
                                </div>
                                <div className={`sv-radio-btn ${orderForm.type === 'takeaway' ? 'active' : ''}`} onClick={() => setOrderForm(p => ({...p, type: 'takeaway'}))}>
                                    🛍️ {tr('takeaway')}
                                </div>
                                <div className={`sv-radio-btn ${orderForm.type === 'car' ? 'active' : ''}`} onClick={() => setOrderForm(p => ({...p, type: 'car'}))}>
                                    🚗 {tr('inCar')}
                                </div>
                            </div>
                            
                            {orderForm.type === 'dine_in' && (
                                <div className="sv-form-group">
                                    <label className="sv-form-label">{tr('tableNumber')} *</label>
                                    <input className="sv-form-input" type="text" value={orderForm.table_number} onChange={e => setOrderForm(p => ({...p, table_number: e.target.value}))} />
                                </div>
                            )}
                            
                            {(orderForm.type === 'takeaway' || orderForm.type === 'car') && (
                                <div className="sv-form-group">
                                    <label className="sv-form-label">{tr('phoneNumber')} *</label>
                                    <input className="sv-form-input" type="tel" value={orderForm.phone} onChange={e => setOrderForm(p => ({...p, phone: e.target.value}))} />
                                </div>
                            )}
                            
                            {orderForm.type === 'car' && (
                                <div className="sv-form-group">
                                    <label className="sv-form-label">{tr('carNumber')} *</label>
                                    <input className="sv-form-input" type="text" value={orderForm.car_number} onChange={e => setOrderForm(p => ({...p, car_number: e.target.value}))} />
                                </div>
                            )}
                            
                            <div className="sv-form-group">
                                <label className="sv-form-label">{tr('customerName')}</label>
                                <input className="sv-form-input" type="text" value={orderForm.customer_name} onChange={e => setOrderForm(p => ({...p, customer_name: e.target.value}))} />
                            </div>
                            
                            <div className="sv-form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="sv-form-label">{tr('notes')}</label>
                                <textarea className="sv-form-input" rows="2" value={orderForm.notes} onChange={e => setOrderForm(p => ({...p, notes: e.target.value}))}></textarea>
                            </div>
                            
                            <button 
                                className="sv-modal__btn-add" 
                                style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }} 
                                onClick={handleCheckoutSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? tr('submitting') : tr('confirmOrder')}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── SUCCESS MODAL ── */}
                {successOrderNumber && (
                    <div className="sv-modal-overlay sv-z-checkout" onClick={() => setSuccessOrderNumber(null)}>
                        <div className="sv-modal" onClick={e => e.stopPropagation()}>
                            <div className="sv-modal__header" style={{ borderBottom: 'none' }}>
                                <h2 className="sv-modal__title" style={{ color: '#2ecc71', width: '100%', textAlign: 'center' }}>
                                    {tr('orderSuccessMsg')}
                                </h2>
                                <button className="sv-modal__close" onClick={() => setSuccessOrderNumber(null)} style={{ position: 'absolute', right: '1rem', top: '1rem' }}>&times;</button>
                            </div>
                            <div className="sv-modal__body" style={{ textAlign: 'center', padding: '2rem 1rem', paddingTop: '0' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', color: '#1A1714' }}>
                                    {successOrderNumber}
                                </div>
                                <button 
                                    className="sv-modal__btn-add" 
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: '#C9A84C', color: '#fff' }} 
                                    onClick={() => window.location.href = `/track/${successOrderNumber}`}
                                >
                                    {tr('trackOrder')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
