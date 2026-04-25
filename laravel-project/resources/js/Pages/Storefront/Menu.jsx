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
.sv-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); }
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
        if (product.addons && product.addons.length > 0) {
            setSelectedProduct(product);
            setSelectedAddons({});
        } else {
            const quantity = quantities[product.id] ?? 1;
            const total = parseFloat(product.price) * quantity;
            console.log({
                product,
                quantity,
                addons: [],
                total
            });
        }
    };

    const closeAddonModal = () => {
        setSelectedProduct(null);
        setSelectedAddons({});
    };

    const toggleAddon = (addonId) => {
        setSelectedAddons(prev => ({ ...prev, [addonId]: !prev[addonId] }));
    };

    const confirmAddons = () => {
        if (!selectedProduct) return;
        const quantity = quantities[selectedProduct.id] ?? 1;
        const chosenAddons = (selectedProduct.addons || []).filter(a => selectedAddons[a.id]);
        const addonsSum = chosenAddons.reduce((sum, a) => sum + parseFloat(a.price), 0);
        const total = (parseFloat(selectedProduct.price) + addonsSum) * quantity;
        
        console.log({
            product: selectedProduct,
            quantity,
            addons: chosenAddons,
            total
        });
        
        closeAddonModal();
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
                        <span className="sv-brand">{restaurant.name_en || 'SAVOR'}</span>
                    </div>
                    <div className="sv-header__right">
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
                        style={restaurant.logo_path
                            ? { backgroundImage: `url('${restaurant.logo_path}')` }
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
                                                    <span>{tr('addToOrder')}</span>
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
                                
                                {selectedProduct.addons && selectedProduct.addons.length > 0 && (
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
            </div>
        </>
    );
}
