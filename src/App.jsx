import React, { useState, useMemo, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import { 
  ShoppingBag, 
  CheckCircle, 
  Plus,
  X,
  Eye,
  BarChart3,
  Package,
  LogOut,
  Clock,
  Truck,
  ChevronRight,
  Edit,
  Trash2,
  Download,
  Upload,
  PlusCircle
} from 'lucide-react'

/* =======================================
   RESTAURANT DATA & TRANSLATIONS
   (Shared or specific to Customer)
   ======================================= */
const MENU_DATA = [
  {
    id: 1,
    name: { en: "Classic Triple Cheeseburger", ar: "تريبل تشيز برجر كلاسيكي" },
    desc: { 
      en: "100% Angus beef patties, aged cheddar, caramelized onions, house truffle sauce on a toasted brioche bun.", 
      ar: "فطائر لحم أنجوس 100%، جبن شيدر معتق، بصل مكرمل، مع صلصة الكمأة المحضرة في مطبخنا بخبز البريوش المحمص." 
    },
    price: 18.50,
    category: "Burgers",
    image: "/burger.png",
    is_available: true
  },
  {
    id: 2,
    name: { en: "Truffle Mushroom Burger", ar: "برجر الكمأة والمشروم" },
    desc: { 
      en: "Angus beef, wild mushrooms, swiss cheese, truffle mayo, baby arugula.", 
      ar: "لحم أنجوس الفاخر، تشكيلة فطر بري، جبنة سويسرية، مايونيز الكمأة، مع أوراق الجرجير الصغيرة." 
    },
    price: 21.00,
    category: "Burgers",
    image: "/burger.png",
    is_available: true
  },
  {
    id: 3,
    name: { en: "Wood-Fired Margherita", ar: "مارجريتا على الحطب" },
    desc: { 
      en: "San Marzano tomato sauce, fresh mozzarella di bufala, basil, extra virgin olive oil.", 
      ar: "صلصة طماطم سان مارزانو الفاخرة، جبنة موزاريلا دي بوفالا الطازجة، ريحان، وزيت زيتون بكر ممتاز." 
    },
    price: 22.00,
    category: "Pizzas",
    image: "/pizza.png",
    is_available: true
  },
  {
    id: 4,
    name: { en: "Spicy Diavola", ar: "ديافولا الحارة" },
    desc: { 
      en: "Tomato sauce, mozzarella, spicy calabrese salami, chili flakes, hot honey drizzle.", 
      ar: "صلصة الطماطم، جبن الموزاريلا، سلامي كالابريزي الحار، رقائق الفلفل المجفف، ورشة من العسل الحار." 
    },
    price: 24.50,
    category: "Pizzas",
    image: "/pizza.png",
    is_available: true
  },
  {
    id: 5,
    name: { en: "Caesar Cardini", ar: "سيزر كارديني" },
    desc: { 
      en: "Crisp romaine, shaved parmigiano-reggiano, house croutons, creamy garlic dressing.", 
      ar: "خس رومين مقرمش، شرائح جبن بارميجيانو ريجيانو، خبز محمص بالأعشاب، تتبيلة الثوم بالكريمة الفاخرة." 
    },
    price: 14.00,
    category: "Salads",
    image: null,
    is_available: true
  },
  {
    id: 6,
    name: { en: "Signature Dark Mojito", ar: "دارك موهيتو التوقيعي" },
    desc: { 
      en: "Aged dark rum, fresh mint, lime, artisan brown sugar syrup.", 
      ar: "مزيج منعش من النعناع الطازج، الليمون، وشراب السكر البني الحرفي المعتق." 
    },
    price: 12.00,
    category: "Drinks",
    image: null,
    is_available: true
  }
];

const CATEGORIES = [
  { id: "All", en: "ALL", ar: "الكل" },
  { id: "Burgers", en: "Burgers", ar: "البرجر" },
  { id: "Pizzas", en: "Pizzas", ar: "البيتزا" },
  { id: "Salads", en: "Salads", ar: "السلطات" },
  { id: "Drinks", en: "Drinks", ar: "المشروبات" }
];



const AVAILABLE_ADDONS = {
  en: [
    { id: 'extra_cheese', name: 'Extra Cheese', price: 3.00 },
    { id: 'pepsi', name: 'Pepsi', price: 6.00 },
    { id: '7up', name: '7up', price: 6.00 },
    { id: 'water', name: 'Water', price: 3.00 }
  ],
  ar: [
    { id: 'extra_cheese', name: 'إضافة جبن', price: 3.00 },
    { id: 'pepsi', name: 'بيبسي', price: 6.00 },
    { id: '7up', name: 'سفن أب', price: 6.00 },
    { id: 'water', name: 'ماء', price: 3.00 }
  ]
};

const t = {
  heroTitle: { en: "SAVOR", ar: "منصة المطعم الذكي" },
  tagline: { en: "Experience the Art of Fine Dining", ar: "استكشف فن الطهي والمذاق الراقي" },
  trackOrder: { en: "Track Order", ar: "تتبع الطلب" },
  backToMenu: { en: "Back to Menu", ar: "العودة للقائمة" },
  cart: { en: "Cart", ar: "السلة" },
  browseMenu: { en: "Browse Menu", ar: "تصفح القائمة" },
  addToOrder: { en: "Add to Order", ar: "أضف للطلب" },
  trackTitle: { en: "Track Your Order", ar: "تتبع الطلب" },
  trackDesc: { en: "Enter your order number to check the current status of your order.", ar: "أدخل رقم طلبك للتحقق من الحالة الحالية لطلبك." },
  trackPlaceholder: { en: "e.g. ORD1234", ar: "مثال: ORD1234" },
  trackBtn: { en: "Track", ar: "تتبع" },
  trackingLoading: { en: "Tracking...", ar: "جاري التتبع..." },
  orderDetails: { en: "Order Details", ar: "تفاصيل الطلب" },
  orderNumber: { en: "Order Number", ar: "رقم الطلب" },
  restaurant: { en: "Restaurant", ar: "المطعم" },
  itemsLabel: { en: "Items", ar: "العناصر" },
  totalLabel: { en: "Total", ar: "المجموع الكلي" },
  statusLabel: { en: "Status", ar: "الحالة" },
  placedOn: { en: "Placed on:", ar: "وقت الطلب:" },
  orderNotFound: { en: "Order not found. Please check your order number.", ar: "لم يتم العثور على الطلب. يرجى التحقق من الرقم." },
  yourOrder: { en: "Your Order", ar: "طلبك" },
  subtotal: { en: "Subtotal", ar: "المجموع الفرعي" },
  tax: { en: "Tax (8%)", ar: "الضريبة (8%)" },
  orderTotal: { en: "Total", ar: "المجموع" },
  checkout: { en: "Proceed to Checkout", ar: "إتمام الطلب" },
  placingOrder: { en: "Placing Order...", ar: "جاري تأكيد الطلب..." },
  emptyCart: { en: "Your cart is empty.", ar: "سلة المشتريات فارغة." },
  successTitle: { en: "Order Placed Successfully!", ar: "تم تأكيد طلبك بنجاح!" },
  successOrderNo: { en: "Your Order Number:", ar: "رقم طلبك هو:" },
  redirecting: { en: "Redirecting to tracking...", ar: "جاري التحويل لصفحة التتبع..." },
  networkError: { en: "Could not place order. Please try again.", ar: "تعذر إتمام الطلب، يرجى المحاولة مرة أخرى." },
  remove: { en: "Remove", ar: "إزالة" },
  viewOrder: { en: "View Order", ar: "عرض الطلب" },
  dineIn: { en: "Dine-in", ar: "داخل المطعم" },
  carService: { en: "In Car", ar: "في السيارة" },
  takeawayType: { en: "Takeaway", ar: "استلام" },
  tableNumber: { en: "Table Number", ar: "رقم الطاولة" },
  carNumber: { en: "Car Plate", ar: "رقم اللوحة" },
  phoneNumber: { en: "Phone Number", ar: "رقم الجوال" },
  requiredField: { en: "Required", ar: "مطلوب" },
  checkoutTypeLabel: { en: "Order Type", ar: "نوع الطلب" },
};

const STATUS_STEPS = {
  en: ["Order Placed", "Preparing", "Out for Delivery", "Delivered"],
  ar: ["تم الاستلام", "قيد التحضير", "في الطريق إليك", "تم التوصيل"]
};

const getTrackingTotal = (data) => {
  if (!data) return 0;
  const t = data.total_price || data.total || data.total_amount;
  if (t !== undefined && Number(t) > 0) return Number(t);

  try {
    let parsed = data.items;
    if (typeof parsed === 'string') {
      const trimmed = parsed.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        parsed = JSON.parse(trimmed);
      }
    }
    if (Array.isArray(parsed)) {
      const calc = parsed.reduce((sum, i) => sum + ((Number(i.price) || 0) * (Number(i.qty || i.quantity) || 1)), 0);
      if (calc > 0) return calc;
    }
  } catch (e) {}
  return 0;
};

const parseOrderItems = (items) => {
  if (!items) return "";
  try {
    let parsed = items;
    if (typeof items === 'string') {
      const trimmed = items.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        parsed = JSON.parse(trimmed);
      } else {
        return items;
      }
    }
    if (Array.isArray(parsed)) {
      return parsed.map(item => {
        const name = item.name || 'Item';
        const qty = item.qty || item.quantity || 1;
        const addonsStr = (item.addons && item.addons.length > 0) ? ` (+ ${item.addons.join(', ')})` : '';
        return `${name}${addonsStr} x${qty}`;
      }).join(', ');
    }
    return String(items);
  } catch (e) {
    return String(items);
  }
};

/* =======================================
   CUSTOMER APP (STABLE STOREFRONT)
   ======================================= */

class CustomerErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("CustomerApp Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#fff', background: '#111', minHeight: '100vh' }}>
          <h2>حدث خطأ في تحميل المنيو، يرجى تحديث الصفحة</h2>
          <p style={{ color: '#ff4444', marginTop: '1rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const getProductName = (p, lang = 'en') => {
  if (!p) return "Unnamed Product";
  if (lang === 'ar') {
    return p.name_ar || p.name_en || (p.name && typeof p.name === 'object' ? (p.name.ar || p.name.en) : p.name) || "Unnamed Product";
  }
  return p.name_en || p.name_ar || (p.name && typeof p.name === 'object' ? (p.name.en || p.name.ar) : p.name) || "Unnamed Product";
};

const getProductDesc = (p, lang = 'en') => {
  if (!p) return "";
  if (lang === 'ar') {
    return p.description_ar || p.description_en || p.description || (typeof p.desc === 'object' ? (p.desc.ar || p.desc.en) : p.desc) || "";
  }
  return p.description_en || p.description_ar || p.description || (typeof p.desc === 'object' ? (p.desc.en || p.desc.ar) : p.desc) || "";
};

const getProductCategory = (p, lang = 'en') => {
  if (!p) return "";
  if (lang === 'ar') {
    return p.category_ar || p.category_en || p.category || "";
  }
  return p.category_en || p.category_ar || p.category || "";
};



function CustomerApp() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('savor_lang') || 'ar';
  });

  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [trackOrderData, setTrackOrderData] = useState(null);
  const [trackOrderError, setTrackOrderError] = useState(null);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [restaurantNotFound, setRestaurantNotFound] = useState(false);

  const [orderType, setOrderType] = useState('dine_in'); // dine_in, car, takeaway
  const [checkoutFields, setCheckoutFields] = useState({
    table_number: '',
    car_number: '',
    phone: ''
  });

  const [selectedQtys, setSelectedQtys] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});

  const handleUpdateSelectedQty = (id, delta) => {
    setSelectedQtys(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const handleToggleAddon = (productId, addonId) => {
    setSelectedAddons(prev => {
      const current = prev[productId] || [];
      if (current.includes(addonId)) {
        return { ...prev, [productId]: current.filter(id => id !== addonId) };
      } else {
        return { ...prev, [productId]: [...current, addonId] };
      }
    });
  };

  // Clear checkout error when order type changes
  useEffect(() => {
    setCheckoutError(null);
  }, [orderType]);

  // Fetch Restaurant ID then its Menu
  useEffect(() => {
    const fetchRestaurantData = async () => {
      setIsMenuLoading(true);
      setRestaurantNotFound(false);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('r') || 'savor';

        // 1. Resolve Restaurant ID
        const { data: resData, error: resErr } = await supabase
          .from('restaurants')
          .select('id')
          .eq('slug', slug)
          .single();
        
        if (resErr || !resData) {
          console.error(`Restaurant '${slug}' not found`);
          setRestaurantNotFound(true);
          setIsMenuLoading(false);
          return;
        }

        const rid = resData.id;
        setRestaurantId(rid);

        // 2. Fetch Menu Items
        const { data: menuData } = await supabase
          .from('menu_items')
          .select('*');
        
        console.log("Fetched menu_items:", menuData);

        if (menuData) {
          // Filter locally to avoid query syntax issues and ensure robustness
          const availableProducts = menuData.filter(p => p.is_available !== false);
          console.log("Visible products:", availableProducts);

          const normalized = availableProducts.map(p => {
            const rawName = p.name_ar || p.name_en || p.name || p.title || '';
            const rawDesc = p.description_ar || p.description_en || p.desc || p.description || '';
            // Resolve image: prefer image_url, then image, then first item of images array
            let resolvedImage = null;
            if (p.image_url && typeof p.image_url === 'string') {
              resolvedImage = p.image_url;
            } else if (p.image && typeof p.image === 'string') {
              resolvedImage = p.image;
            } else if (Array.isArray(p.images) && p.images.length > 0) {
              resolvedImage = typeof p.images[0] === 'string' ? p.images[0] : (p.images[0]?.url || null);
            } else if (Array.isArray(p.image_url)) {
              resolvedImage = p.image_url[0] || null;
            }
            return {
              ...p,
              name: typeof rawName === 'object' && rawName !== null ? rawName : { en: rawName || "", ar: rawName || "" },
              desc: typeof rawDesc === 'object' && rawDesc !== null ? rawDesc : { en: rawDesc || "", ar: rawDesc || "" },
              _resolvedImage: resolvedImage
            };
          });
          setProducts(normalized);
        }
      } catch (err) {
        console.error('Migration Fetch Error:', err);
      } finally {
        setIsMenuLoading(false);
      }
    };

    fetchRestaurantData();
  }, []);

  useEffect(() => {
    localStorage.setItem('savor_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    if (lang === 'ar') {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
    // Reset category when language changes to avoid filter mismatch
    setActiveCategory("All");
  }, [lang]);

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const getText = (key) => t[key][lang] || t[key].en;

  const getStatusStepIndex = (status) => {
    if (!status) return 0;
    const s = status.toLowerCase();
    if (s.includes("placed") || s.includes("received")) return 0;
    if (s.includes("prep") || s.includes("cook")) return 1;
    if (s.includes("out") || s.includes("way")) return 2;
    if (s.includes("deliver") || s.includes("complet")) return 3;
    return 0;
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    if (activeCategory === "All") return products;
    return products.filter(p => {
      if (!p) return false;
      const pCat = lang === 'ar' ? (p.category_ar || p.category_en || p.category) : (p.category_en || p.category_ar || p.category);
      return pCat === activeCategory;
    });
  }, [activeCategory, products, lang]);

  const addToCart = (product, customQty, customAddons) => {
    const qtyToAdd = customQty !== undefined ? customQty : (selectedQtys[product.id] || 1);
    const addonsForProduct = customAddons !== undefined ? customAddons : (selectedAddons[product.id] || []);
    
    let addonsTotal = 0;
    addonsForProduct.forEach(addonId => {
      const addonDef = AVAILABLE_ADDONS.en.find(a => a.id === addonId);
      if (addonDef) addonsTotal += addonDef.price;
    });

    const finalPrice = Number(product.price || 0) + addonsTotal;
    const cartItemId = `${product.id}-${addonsForProduct.slice().sort().join(',')}`;

    setCart(prev => {
      const existing = prev.find(item => (item.cartItemId || item.id) === cartItemId);
      if (existing) {
        return prev.map(item => 
          (item.cartItemId || item.id) === cartItemId ? { ...item, qty: item.qty + qtyToAdd } : item
        );
      }
      return [...prev, { 
        ...product, 
        cartItemId, 
        qty: qtyToAdd, 
        selectedAddons: addonsForProduct,
        basePrice: Number(product.price || 0),
        price: finalPrice 
      }];
    });
    setSelectedQtys(prev => ({ ...prev, [product.id]: 1 }));
    setSelectedAddons(prev => ({ ...prev, [product.id]: [] }));
    setCheckoutError(null);
    setOrderSuccess(null);
  };

  const updateQty = (cartItemId, delta) => {
    setCart(prev => prev.map(item => {
      if ((item.cartItemId || item.id) === cartItemId) {
        return { ...item, qty: item.qty + delta };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const removeItem = (cartItemId) => {
    setCart(prev => prev.filter(item => (item.cartItemId || item.id) !== cartItemId));
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = cartSubtotal * 0.08; 
  const total = cartSubtotal + tax;

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setCheckoutError(null);
    setOrderSuccess(null);

    // Validation
    if (orderType === 'dine_in' && !checkoutFields.table_number) {
      setCheckoutError(`${getText('tableNumber')} ${getText('requiredField')}`);
      setIsSubmitting(false);
      return;
    }
    if (orderType === 'car' && (!checkoutFields.car_number || !checkoutFields.phone)) {
      setCheckoutError(getText('requiredField'));
      setIsSubmitting(false);
      return;
    }
    if (orderType === 'takeaway' && !checkoutFields.phone) {
      setCheckoutError(`${getText('phoneNumber')} ${getText('requiredField')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        restaurant_id: restaurantId,
        restaurant: "SAVOR",
        order_type: orderType,
        table_number: checkoutFields.table_number || "",
        car_number: checkoutFields.car_number || "",
        phone: checkoutFields.phone || "",
        customer_name: "",
        notes: "",
        total_price: Number(total.toFixed(2)),
        items: (cart || []).map(item => {
          const baseName = getProductName(item, 'en');
          const addonNames = (item?.addons || []).map(a => a.name_en || a.name || String(a.id));
          return {
            id: item.id,
            name: baseName,
            price: Number(item.price || 0),
            quantity: item.qty,
            addons: addonNames
          };
        })
      };

      const response = await fetch("https://citysoftech.app.n8n.cloud/webhook/create-order-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getText('networkError'));
      }

      if (data && (data.success === "true" || data.success === true)) {
        setOrderSuccess(data.order_number);
        setCart([]);
        
        setTimeout(() => {
          setIsCartOpen(false);
          setShowTracking(true);
          setTrackOrderData(null); // Clear previous data immediately
          if (data.order_number) {
            handleTrackOrder(data.order_number);
          }
          setOrderSuccess(null); 
        }, 2500);

      } else {
        throw new Error(data.message || getText('networkError'));
      }
    } catch (err) {
      setCheckoutError(getText('networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackOrder = async (overrideOrderNum) => {
    const targetOrderNum = typeof overrideOrderNum === 'string' ? overrideOrderNum : trackingInput;
    if (!targetOrderNum.trim()) return;
    
    setIsTrackLoading(true);
    setTrackOrderError(null);
    setTrackOrderData(null);
    if (typeof overrideOrderNum === 'string') {
      setTrackingInput(targetOrderNum);
    }

    try {
      const response = await fetch("https://citysoftech.app.n8n.cloud/webhook/track-order-clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: targetOrderNum })
      });

      const data = await response.json();

      if (data && (data.success === true || data.success === "true")) {
        setTrackOrderData(data);
      } else {
        setTrackOrderError(getText('orderNotFound'));
      }
    } catch (err) {
      setTrackOrderError(getText('orderNotFound'));
    } finally {
      setIsTrackLoading(false);
    }
  };

  const browseMenu = (e) => {
    e.preventDefault();
    document.getElementById('menu-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`app-container ${lang}`}>

      <header className="main-header">
        <div className="header-left" onClick={() => setShowTracking(false)}>
          <div className="logo-small">S</div>
          <span className="brand-name">SAVOR</span>
        </div>
        <div className="header-right">
          <button className="lang-toggle-btn" onClick={toggleLang}>
            {lang === 'ar' ? 'English' : 'عربي'}
          </button>
          
          <button className="header-link" onClick={() => setShowTracking(!showTracking)}>
            {showTracking ? getText('backToMenu') : getText('trackOrder')}
          </button>
          
          {!showTracking && (
            <button className="header-cart-btn" onClick={() => setIsCartOpen(true)}>
              {getText('cart')} {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
            </button>
          )}
        </div>
      </header>

      {!showTracking && (
        <section className="hero-section">
          <div className="hero-bg" style={{ backgroundImage: "url('/savor_hero_cover.png')" }}></div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-logo-large">S</div>
            <h1 className="hero-title">{getText('heroTitle')}</h1>
            <p className="hero-tagline">{getText('tagline')}</p>
            <div className="hero-actions">
              <button onClick={browseMenu} className="btn-primary">{getText('browseMenu')}</button>
              <button onClick={() => setShowTracking(true)} className="btn-secondary">{getText('trackOrder')}</button>
            </div>
          </div>
        </section>
      )}

      <div id="menu-section" className="main-content">
        {!showTracking ? (
          <>
            <div className="category-wrapper">
              <nav className="category-nav">
                {(() => {
                  const categoriesSet = new Set();
                  const dynamicCats = [{ id: "All", label: lang === 'ar' ? "الكل" : "ALL" }];
                  
                  if (Array.isArray(products)) {
                    products.forEach(p => {
                      const catLabel = lang === 'ar' 
                        ? (p.category_ar || p.category_en || p.category)
                        : (p.category_en || p.category_ar || p.category);
                        
                      if (catLabel && !categoriesSet.has(catLabel)) {
                        categoriesSet.add(catLabel);
                        dynamicCats.push({ id: catLabel, label: catLabel });
                      }
                    });
                  }
                  
                  return dynamicCats.map(cat => (
                    <button 
                      key={cat.id}
                      className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ));
                })()}
              </nav>
            </div>

            <main className="menu-grid">
              {isMenuLoading ? (
                <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)'}}>
                  {lang === 'ar' ? 'جاري تحميل قائمة الطعام...' : 'Loading menu...'}
                </div>
              ) : restaurantNotFound ? (
                <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px'}}>
                  <p>{lang === 'ar' ? 'المطعم غير موجود' : 'Restaurant not found'}</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px'}}>
                  <p>{lang === 'ar' ? 'لا توجد منتجات متاحة حالياً' : 'Menu currently unavailable'}</p>
                </div>
              ) : (
                (filteredProducts || []).map(product => {
                  if (!product) return null;
                  const pName = getProductName(product, lang);
                  const pDesc = getProductDesc(product, lang);
                  return (
                    <div key={product.id} className="product-card">
                      <div className="product-card__image-wrap">
                        {product._resolvedImage ? (
                          <img
                            src={product._resolvedImage}
                            alt={pName}
                            className="product-card__image"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = 'flex'); }}
                          />
                        ) : null}
                        <div
                          className="product-card__placeholder"
                          style={{ display: product._resolvedImage ? 'none' : 'flex' }}
                        >
                          <Eye size={40} strokeWidth={1} />
                        </div>
                      </div>
                      <div className="product-card__content">
                        <div className="product-card__header">
                          <h3 className="product-card__name">{pName}</h3>
                          <span className="product-card__price">${product.price?.toFixed(2)}</span>
                        </div>
                        <p className="product-card__desc">{pDesc}</p>



                        <div className="product-card__action-group" style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                          <div className="product-card__qty-selector" style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: '0 0.5rem', border: '1px solid var(--color-border)' }}>
                            <button style={{ padding: '0.5rem', fontWeight: 'bold' }} onClick={() => handleUpdateSelectedQty(product.id, -1)}>-</button>
                            <span style={{ minWidth: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>{selectedQtys[product.id] || 1}</span>
                            <button style={{ padding: '0.5rem', fontWeight: 'bold' }} onClick={() => handleUpdateSelectedQty(product.id, 1)}>+</button>
                          </div>
                          <button 
                            className="product-card__btn"
                            onClick={() => addToCart(product)}
                            style={{ flex: 1 }}
                          >
                            <span>{getText('addToOrder')}</span>
                            <Plus size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </main>
          </>
        ) : (
          <main className="tracking-wrapper">
            <div className="tracking-box">
              <h2 className="tracking-title">{getText('trackTitle')}</h2>
              <p className="tracking-desc">{getText('trackDesc')}</p>
              <div className="tracking-input-group">
                <input 
                  type="text" 
                  placeholder={getText('trackPlaceholder')} 
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="tracking-input"
                />
                <button 
                  className="btn-primary tracking-btn"
                  onClick={handleTrackOrder}
                  disabled={isTrackLoading}
                >
                  {isTrackLoading ? getText('trackingLoading') : getText('trackBtn')}
                </button>
              </div>

              {trackOrderError && (
                <div className="tracking-error">
                  {trackOrderError}
                </div>
              )}

              {trackOrderData && (
                <div className="tracking-details">
                  <div className="tracking-details-header">
                    <h3 className="tracking-details-title">{getText('orderDetails')}</h3>
                    <span className="tracking-details-ordernum">{trackOrderData.order_number}</span>
                  </div>
                  
                  <div className="tracking-timeline">
                    {STATUS_STEPS[lang].map((step, idx) => {
                      const currentStatus = trackOrderData.current_status || trackOrderData.status;
                      const currentIdx = getStatusStepIndex(currentStatus);
                      const isCompleted = idx <= currentIdx;
                      const isActive = idx === currentIdx;
                      return (
                        <div key={idx} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                          <div className="timeline-icon">
                            {isCompleted ? (
                              <CheckCircle size={14} strokeWidth={3} />
                            ) : null}
                          </div>
                          <span className="timeline-label">{step}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="tracking-info-grid">
                    <div className="tracking-info-row">
                      <span className="tracking-info-label">{getText('statusLabel')}</span>
                      <span className="tracking-info-value status-highlight">
                        {STATUS_STEPS[lang][getStatusStepIndex(trackOrderData.current_status || trackOrderData.status)] || (trackOrderData.current_status || trackOrderData.status)}
                      </span>
                    </div>
                    <div className="tracking-info-row">
                      <span className="tracking-info-label">{getText('restaurant')}</span>
                      <span className="tracking-info-value" dir="ltr">{trackOrderData.restaurant}</span>
                    </div>
                    <div className="tracking-info-row items-row">
                      <span className="tracking-info-label">{getText('itemsLabel')}</span>
                      <span className="tracking-info-value" dir="ltr">{parseOrderItems(trackOrderData.items)}</span>
                    </div>
                    <div className="tracking-info-row total-row">
                      <span className="tracking-info-label">{getText('totalLabel')}</span>
                      <span className="tracking-info-value">
                        ${getTrackingTotal(trackOrderData).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {trackOrderData.created_at && (
                    <div className="tracking-footer">
                      {getText('placedOn')} <span dir="ltr">{new Date(trackOrderData.created_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        )}
      </div>

      {!showTracking && cartItemCount > 0 && (
        <button className="cart-fab" onClick={() => setIsCartOpen(true)}>
          <ShoppingBag size={22} strokeWidth={2} />
          {getText('viewOrder')}
          <span className="cart-fab__badge">{cartItemCount}</span>
        </button>
      )}

      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">{getText('yourOrder')} ({cartItemCount})</h2>
          <button className="cart-drawer__close" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="cart-drawer__body">
          {orderSuccess ? (
            <div className="cart-empty success-state">
              <div className="success-icon">
                <CheckCircle size={48} />
              </div>
              <h3 className="tracking-details-title" style={{marginTop:"1rem", marginBottom:"0.5rem"}}>{getText('successTitle')}</h3>
              <p>{getText('successOrderNo')} <strong style={{fontFamily:"var(--font-sans)", letterSpacing:"1px"}}>{orderSuccess}</strong></p>
              <span className="redirect-text" style={{marginTop:"0.5rem", display:"block"}}>{getText('redirecting')}</span>
            </div>
          ) : cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={60} strokeWidth={1} />
              <p>{getText('emptyCart')}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item__image-wrap">
                  {item._resolvedImage ? (
                    <img
                      src={item._resolvedImage}
                      alt={typeof getProductName(item, lang) === 'string' ? getProductName(item, lang) : "Product"}
                      className="cart-item__image"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = 'flex'); }}
                    />
                  ) : null}
                  <div
                    className="cart-item__placeholder"
                    style={{ display: item._resolvedImage ? 'none' : 'flex' }}
                  >
                    <Eye size={24} strokeWidth={1.5} />
                  </div>
                </div>
                <div className="cart-item__info">
                  <div>
                    <h4 className="cart-item__name">
                      {getProductName(item, lang)}
                    </h4>
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>
                        + {item.selectedAddons.map(aId => AVAILABLE_ADDONS[lang].find(a => a.id === aId)?.name || aId).join(', ')}
                      </div>
                    )}
                    <div className="cart-item__price">${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                  <div className="cart-item__controls">
                    <button className="cart-item__btn" onClick={() => updateQty(item.cartItemId || item.id, -1)}>-</button>
                    <span className="cart-item__qty">{item.qty}</span>
                    <button className="cart-item__btn" onClick={() => updateQty(item.cartItemId || item.id, 1)}>+</button>
                    <button className="cart-item__remove" onClick={() => removeItem(item.cartItemId || item.id)}>{getText('remove')}</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!orderSuccess && cart.length > 0 && (
          <div className="cart-drawer__footer">
          {checkoutError && <div className="checkout-error">{checkoutError}</div>}
          
          <div className="checkout-type-selection">
            <span className="checkout-label">{getText('checkoutTypeLabel')}</span>
            <div className="checkout-type-toggles">
              <button 
                className={`type-toggle-btn ${orderType === 'dine_in' ? 'active' : ''}`}
                onClick={() => setOrderType('dine_in')}
              >
                {getText('dineIn')}
              </button>
              <button 
                className={`type-toggle-btn ${orderType === 'car' ? 'active' : ''}`}
                onClick={() => setOrderType('car')}
              >
                {getText('carService')}
              </button>
              <button 
                className={`type-toggle-btn ${orderType === 'takeaway' ? 'active' : ''}`}
                onClick={() => setOrderType('takeaway')}
              >
                {getText('takeawayType')}
              </button>
            </div>
          </div>

          <div className="checkout-fields-group">
            {orderType === 'dine_in' && (
              <div className="checkout-field">
                <span className="checkout-label">{getText('tableNumber')}</span>
                <input 
                  className="checkout-input"
                  placeholder="e.g. 5"
                  value={checkoutFields.table_number}
                  onChange={(e) => setCheckoutFields({...checkoutFields, table_number: e.target.value})}
                />
              </div>
            )}

            {orderType === 'car' && (
              <>
                <div className="checkout-field">
                  <span className="checkout-label">{getText('carNumber')}</span>
                  <input 
                    className="checkout-input"
                    placeholder="ABC 123"
                    value={checkoutFields.car_number}
                    onChange={(e) => setCheckoutFields({...checkoutFields, car_number: e.target.value})}
                  />
                </div>
                <div className="checkout-field">
                  <span className="checkout-label">{getText('phoneNumber')}</span>
                  <input 
                    className="checkout-input"
                    placeholder="5XXXXXXXX"
                    type="tel"
                    value={checkoutFields.phone}
                    onChange={(e) => setCheckoutFields({...checkoutFields, phone: e.target.value})}
                  />
                </div>
              </>
            )}

            {orderType === 'takeaway' && (
              <div className="checkout-field">
                <span className="checkout-label">{getText('phoneNumber')}</span>
                <input 
                  className="checkout-input"
                  placeholder="5XXXXXXXX"
                  type="tel"
                  value={checkoutFields.phone}
                  onChange={(e) => setCheckoutFields({...checkoutFields, phone: e.target.value})}
                />
              </div>
            )}
          </div>

          <div style={{marginTop: '2rem'}}>
            <div className="cart-summary">
              <div className="cart-summary__row">
                <span>{getText('subtotal')}</span>
                <span dir="ltr">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary__row">
                <span>{getText('tax')}</span>
                <span dir="ltr">${tax.toFixed(2)}</span>
              </div>
              <div className="cart-summary__row total">
                <span>{getText('orderTotal')}</span>
                <span dir="ltr">${total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              className="checkout-btn" 
              onClick={handleCheckout} 
              disabled={isSubmitting}
            >
              {isSubmitting ? getText('placingOrder') : getText('checkout')}
            </button>
          </div>
        </div>
      )}

    </div>
  </div>
);
}

/* =======================================
   ADMIN DASHBOARD (ISOLATED)
   ======================================= */

function AdminLogin({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  return (
    <div className="admin-root admin-login-screen">
      <div className="login-card">
        <h2 className="login-title">SAVOR</h2>
        <p className="login-subtitle">Admin Dashboard</p>
        <div style={{textAlign: 'left'}}>
          <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', display: 'block'}}>Username</label>
          <input className="admin-input" placeholder="Enter username" value={user} onChange={e => setUser(e.target.value)} />
          <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', display: 'block'}}>Password</label>
          <input className="admin-input" type="password" placeholder="Enter password" value={pass} onChange={e => setPass(e.target.value)} />
        </div>
        <button className="admin-btn" onClick={onLogin}>Sign In</button>
      </div>
    </div>
  );
}

function AdminSidebar({ active, setSection, onLogout }) {
  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="logo-small" style={{width: '32px', height: '32px', fontSize: '1rem'}}>S</div>
        <span className="brand-name" style={{fontWeight: 800, letterSpacing: '0.05em'}}>SAVOR</span>
      </div>
      <div className="admin-nav-group">
        <button className={`admin-nav-item ${active === 'home' ? 'active' : ''}`} onClick={() => setSection('home')}>
          <BarChart3 size={18} /> Dashboard
        </button>
        <button className={`admin-nav-item ${active === 'products' ? 'active' : ''}`} onClick={() => setSection('products')}>
          <Package size={18} /> Products
        </button>
        <button className={`admin-nav-item ${active === 'orders' ? 'active' : ''}`} onClick={() => setSection('orders')}>
          <ShoppingBag size={18} /> Orders
        </button>
        <button className={`admin-nav-item ${active === 'addons' ? 'active' : ''}`} onClick={() => setSection('addons')}>
          <PlusCircle size={18} /> Extras
        </button>

      </div>
      <div style={{padding: '1.5rem', borderTop: '1px solid var(--admin-border)'}}>
        <button className="admin-nav-item" onClick={onLogout} style={{marginBottom: 0}}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

function AdminHome({ stats }) {
  return (
    <div>
      <div className="admin-title-row">
        <h2 className="admin-section-title">Overview</h2>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">New Orders</div>
          <div className="stat-value">{stats.newOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>
      </div>
    </div>
  );
}

function AdminProducts({ products, allAddons, addonLinks, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name_en: '', name_ar: '', price: '', category: 'Burgers', desc_en: '', desc_ar: '', selectedAddons: [] });
  const fileInputRef = useRef(null);

  const handleDownloadTemplate = () => {
    const csvContent = '\uFEFF' + "category_ar,category_en,name_ar,name_en,description_ar,description_en,price,image_url,is_available\nبرجر,Burgers,برجر كلاسيك,Classic Burger,وصف البرجر,Delicious burger description,10.99,,true\nبيتزا,Pizzas,بيتزا مارجريتا,Margherita Pizza,وصف البيتزا,Fresh pizza description,12.99,,true";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
      
      const newProducts = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',');
        const row = {};
        headers.forEach((h, index) => {
          row[h] = values[index] ? values[index].trim().replace(/"/g, '') : '';
        });

        if (!row.name_ar && !row.name_en && !row.name) continue;
        const price = parseFloat(row.price);
        if (isNaN(price)) continue;

        const isAvailStr = row.is_available ? row.is_available.toLowerCase() : '';
        const isAvailable = ['true', '1', 'yes'].includes(isAvailStr);

        // Normalize data for DB - Strictly insert the requested fields
        newProducts.push({
          category_ar: row.category_ar || '',
          category_en: row.category_en || '',
          name_ar: row.name_ar || row.name || '',
          name_en: row.name_en || row.name || '',
          description_ar: row.description_ar || row.description || row.desc || '',
          description_en: row.description_en || row.description || row.desc || '',
          price: price,
          image_url: row.image_url || null,
          is_available: isAvailable
        });
      }

      if (newProducts.length > 0) {
        console.log('Parsed CSV rows to insert:', newProducts);
        try {
          const { data, error } = await supabase.from('menu_items').insert(newProducts).select();
          console.log('Supabase insert result:', { data, error });
          
          if (error) {
            alert(`Failed to import products: ${error.message || error.details || 'Unknown error'}`);
          } else if (!data || data.length === 0) {
            alert('No products were inserted');
          } else {
            onRefresh();
            alert('Products imported successfully');
          }
        } catch (err) {
          console.error('Import error:', err);
          alert(`Failed to import products: ${err.message || 'Unknown error'}`);
        }
      } else {
        alert('No valid products found in the file.');
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name_ar: formData.name_ar,
      name_en: formData.name_en,
      description_ar: formData.desc_ar,
      description_en: formData.desc_en,
      price: parseFloat(formData.price),
      category: formData.category,
      is_available: true
    };
    try {
      let productId = editing?.id;
      if (editing) {
        const { error } = await supabase.from('menu_items').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('menu_items').insert([payload]).select().single();
        if (error) throw error;
        productId = data?.id;
      }
      
      if (productId) {
        // Update Addon Relations
        const { error: delError } = await supabase.from('product_addons').delete().eq('product_id', productId);
        if (delError) throw delError;

        if (formData.selectedAddons.length > 0) {
          const links = formData.selectedAddons.map(aId => ({ product_id: productId, addon_id: aId }));
          const { error: insError } = await supabase.from('product_addons').insert(links);
          if (insError) throw insError;
        }
      }
      
      setShowModal(false);
      onRefresh();
    } catch (err) { 
      console.error(err);
      alert(err.message || "An error occurred while saving the product.");
    }
  };

  return (
    <div>
      <div className="admin-title-row">
        <h2 className="admin-section-title">Products</h2>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button className="admin-btn" style={{width:'auto', background: '#F3F4F6', color: '#374151', boxShadow: 'none'}} onClick={handleDownloadTemplate}>
            <Download size={16} style={{marginRight: '0.5rem', verticalAlign: 'middle'}} /> Download Template
          </button>
          <button className="admin-btn" style={{width:'auto', background: '#F3F4F6', color: '#374151', boxShadow: 'none'}} onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} style={{marginRight: '0.5rem', verticalAlign: 'middle'}} /> Upload Excel
          </button>
          <input type="file" accept=".csv" style={{display: 'none'}} ref={fileInputRef} onChange={handleFileUpload} />
          <button className="admin-btn" style={{width:'auto'}} onClick={() => { setEditing(null); setFormData({name_en:'', name_ar:'', price:'', category:'Burgers', desc_en:'', desc_ar:'', selectedAddons: []}); setShowModal(true); }}>
            <Plus size={16} style={{marginRight: '0.5rem', verticalAlign: 'middle'}} /> Add Product
          </button>
        </div>
      </div>
      <div className="admin-card-content">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Name (EN/AR)</th><th>Category</th><th>Price</th><th style={{textAlign: 'right'}}>Actions</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{fontWeight: 600, color: '#111827'}}>{p.name_ar || p.name_en || p.name || "Unnamed Product"}</div>
                  </td>
                  <td><span style={{fontSize: '0.85rem', background: '#F3F4F6', padding: '0.25rem 0.6rem', borderRadius: '6px'}}>{p.category}</span></td>
                  <td style={{fontWeight: 700, color: '#111827'}}>${p.price.toFixed(2)}</td>
                  <td style={{textAlign: 'right'}}>
                    <div style={{display: 'inline-flex', gap: '0.5rem'}}>
                      <button onClick={() => { 
                        setEditing(p); 
                        setFormData({
                          name_en: p.name_en || (typeof p.name === 'object' ? p.name?.en : p.name) || '', 
                          name_ar: p.name_ar || (typeof p.name === 'object' ? p.name?.ar : p.name) || '', 
                          price: p.price, 
                          category: p.category, 
                          desc_en: p.description_en || (typeof p.desc === 'object' ? p.desc?.en : p.desc) || '', 
                          desc_ar: p.description_ar || (typeof p.desc === 'object' ? p.desc?.ar : p.desc) || '',
                          selectedAddons: (addonLinks || []).filter(l => l.product_id === p.id).map(l => l.addon_id)
                        }); 
                        setShowModal(true); 
                      }} style={{color: '#6B7280', padding: '0.5rem'}}><Edit size={16}/></button>
                      <button onClick={async () => { if(confirm('Are you sure you want to delete this product?')) { await supabase.from('menu_items').delete().eq('id', p.id); onRefresh(); }}} style={{color: '#EF4444', padding: '0.5rem'}}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding: '1rem'}}>
          <form style={{background:'#FFF', padding:'2.5rem', borderRadius:'24px', width:'100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'}} onSubmit={handleSave}>
            <h3 style={{fontFamily: 'Cinzel, serif', fontSize: '1.5rem', marginBottom: '1.5rem'}}>{editing ? 'Edit' : 'Add'} Product</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div style={{gridColumn: 'span 1'}}>
                <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block'}}>Name (EN)</label>
                <input className="admin-input" placeholder="e.g. Classic Burger" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} required />
              </div>
              <div style={{gridColumn: 'span 1'}}>
                <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block'}}>Name (AR)</label>
                <input className="admin-input" placeholder="مثال: برجر كلاسيك" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} required />
              </div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div>
                <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block'}}>Price ($)</label>
                <input className="admin-input" placeholder="0.00" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              </div>
              <div>
                <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block'}}>Category</label>
                <select className="admin-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {CATEGORIES.filter(c => c.id !== 'All').map(c => <option key={c.id} value={c.id}>{c.en}</option>)}
                </select>
              </div>
            </div>
            <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block'}}>Description (EN)</label>
            <textarea className="admin-input" style={{minHeight: '80px', resize: 'vertical'}} placeholder="Brief product description..." value={formData.desc_en} onChange={e => setFormData({...formData, desc_en: e.target.value})} />
            
            <div style={{marginTop: '1rem'}}>
              <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.6rem', display: 'block'}}>Available Extras</label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '8px'}}>
                {(allAddons || []).filter(a => a.is_active).map(a => (
                  <label key={a.id} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.25rem'}}>
                    <input 
                      type="checkbox" 
                      style={{width: '16px', height: '16px'}}
                      checked={formData.selectedAddons.includes(a.id)}
                      onChange={(e) => {
                        const newAddons = e.target.checked 
                          ? [...formData.selectedAddons, a.id]
                          : formData.selectedAddons.filter(id => id !== a.id);
                        setFormData({...formData, selectedAddons: newAddons});
                      }}
                    />
                    <span>
                      <span style={{fontWeight: 600}}>{a.name_ar}</span>
                      <span style={{margin: '0 0.25rem', opacity: 0.6}}>({a.name_en})</span>
                      <span style={{color: 'var(--color-primary)', fontWeight: 700}}>${Number(a.price).toFixed(2)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div style={{display:'flex', gap:'1rem', marginTop: '1rem'}}>
              <button type="submit" className="admin-btn" style={{flex: 1}}>Save Changes</button>
              <button type="button" className="admin-btn" style={{flex: 1, background:'#F3F4F6', color:'#374151', boxShadow: 'none'}} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function AdminOrders({ orders, onUpdate }) {
  return (
    <div>
      <div className="admin-title-row">
        <h2 className="admin-section-title">Orders</h2>
      </div>
      <div className="admin-card-content">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Order Details</th><th>Items Count</th><th>Total Amount</th><th>Current Status</th><th style={{textAlign: 'right'}}>Management</th></tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const currentStatus = o.current_status || o.status || '';
                return (
                <tr key={o.id}>
                  <td>
                    <div style={{fontWeight: 700, color: '#111827'}}>{o.order_number}</div>
                    <div style={{fontSize: '0.8rem', color: '#6B7280'}}>{o.restaurant} • {new Date(o.created_at).toLocaleDateString()}</div>
                  </td>
                  <td style={{color: '#6B7280'}}>{parseOrderItems(o.items).split(',').filter(Boolean).length} Items</td>
                  <td style={{fontWeight: 700, color: '#111827'}}>${Number(o.total_price || o.total || 0).toFixed(2)}</td>
                  <td><span className={`status-chip ${currentStatus.toLowerCase().split(' ')[0]}`}>{currentStatus}</span></td>
                  <td style={{textAlign: 'right'}}>
                    <select className="admin-input" value={currentStatus} onChange={(e) => onUpdate(o.id, e.target.value)} style={{marginBottom:0, padding:'0.45rem', width: '160px', fontSize: '0.85rem'}}>
                      {STATUS_STEPS.en.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminExtras({ onRefresh }) {
  const [addons, setAddons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name_en: '', name_ar: '', price: '', is_active: true });

  const fetchAddons = async () => {
    try {
      const { data, error } = await supabase.from('addons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAddons(data || []);
    } catch (err) {
      console.error("Fetch Extras Error:", err);
    }
  };

  useEffect(() => { fetchAddons(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name_en: formData.name_en,
      name_ar: formData.name_ar,
      price: Number(formData.price || 0),
      is_active: formData.is_active === true || formData.is_active === 'true'
    };

    try {
      if (editing) {
        const { error } = await supabase.from('addons').update(payload).eq('id', editing.id);
        if (error) throw error;
        alert("Extra updated successfully");
      } else {
        const { error } = await supabase.from('addons').insert([payload]);
        if (error) throw error;
        alert("Extra added successfully");
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ name_en: '', name_ar: '', price: '', is_active: true });
      fetchAddons();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this extra?')) return;
    try {
      const { error } = await supabase.from('addons').delete().eq('id', id);
      if (error) throw error;
      fetchAddons();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="admin-title-row">
        <h2 className="admin-section-title">Extras (الإضافات)</h2>
        <button className="admin-btn" style={{width:'auto'}} onClick={() => { setEditing(null); setFormData({name_en:'', name_ar:'', price:'', is_active:true}); setShowModal(true); }}>
          <PlusCircle size={16} style={{marginRight: '0.5rem', verticalAlign: 'middle'}} /> Add Extra
        </button>
      </div>
      <div className="admin-card-content">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Name (EN/AR)</th><th>Price</th><th>Status</th><th style={{textAlign: 'right'}}>Actions</th></tr>
            </thead>
            <tbody>
              {addons.map(a => (
                <tr key={a.id}>
                  <td>
                    <div style={{fontWeight: 600, color: '#111827'}}>{a.name_en}</div>
                    <div style={{fontSize: '0.8rem', color: '#6B7280'}}>{a.name_ar}</div>
                  </td>
                  <td style={{fontWeight: 700, color: '#111827'}}>${Number(a.price).toFixed(2)}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem', 
                      background: a.is_active ? '#D1FAE5' : '#F3F4F6', 
                      color: a.is_active ? '#065F46' : '#374151',
                      padding: '0.25rem 0.6rem', 
                      borderRadius: '6px'
                    }}>
                      {a.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <div style={{display: 'inline-flex', gap: '0.5rem'}}>
                      <button onClick={() => { 
                        setEditing(a); 
                        setFormData({ name_en: a.name_en, name_ar: a.name_ar, price: a.price, is_active: a.is_active }); 
                        setShowModal(true); 
                      }} style={{color: '#6B7280', padding: '0.5rem'}}><Edit size={16}/></button>
                      <button onClick={() => handleDelete(a.id)} style={{color: '#EF4444', padding: '0.5rem'}}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding: '1rem'}}>
          <form style={{background:'#FFF', padding:'2.5rem', borderRadius:'24px', width:'100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'}} onSubmit={handleSave}>
            <h3 style={{fontFamily: 'Cinzel, serif', fontSize: '1.5rem', marginBottom: '1.5rem'}}>{editing ? 'Edit' : 'Add'} Extra</h3>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block'}}>Name (English)</label>
              <input className="admin-input" placeholder="e.g. Extra Cheese" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} required />
            </div>

            <div style={{marginBottom: '1rem'}}>
              <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block'}}>Name (Arabic)</label>
              <input className="admin-input" placeholder="مثال: جبنة إضافية" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} required />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
              <div>
                <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block'}}>Price ($)</label>
                <input className="admin-input" placeholder="0.00" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              </div>
              <div>
                <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block'}}>Status</label>
                <select className="admin-input" value={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            
            <div style={{display:'flex', gap:'1rem'}}>
              <button type="submit" className="admin-btn" style={{flex: 1}}>Save</button>
              <button type="button" className="admin-btn" style={{flex: 1, background:'#F3F4F6', color:'#374151', boxShadow: 'none'}} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* =======================================
   KITCHEN DASHBOARD (REAL-TIME)
   ======================================= */
function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('orders')
        .select('*')
        .neq('current_status', 'completed')
        .order('created_at', { ascending: false });
      
      if (data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', { event: '*', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [{ ...payload.new, isNew: true }, ...prev]);
          setTimeout(() => {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, isNew: false } : o));
          }, 8000);
        } else if (payload.eventType === 'UPDATE') {
          if (payload.new.current_status === 'completed') {
            setOrders(prev => prev.filter(o => o.id !== payload.new.id));
          } else {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
          }
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('orders').update({ current_status: newStatus }).eq('id', id);
    if (!error) {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === id ? { ...order, current_status: newStatus } : order
        )
      );
      console.log(`Successfully updated order ${id} to ${newStatus}`);
    } else {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return <div className="kitchen-root" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>Loading kitchen dashboard...</div>;

  return (
    <div className="kitchen-root">
      <header className="kitchen-header">
        <h1 className="kitchen-title">KITCHEN DASHBOARD</h1>
        <div style={{fontSize: '0.9rem', opacity: 0.6}}>{orders.length} Active Orders</div>
      </header>

      <div className="kitchen-grid">
        {orders.length === 0 ? (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '6rem', opacity: 0.4}}>
            No pending orders.
          </div>
        ) : (
          orders.map(order => {
            const currentStatus = order.current_status || order.status || '';
            return (
            <div key={order.id} className={`kitchen-card ${order.isNew ? 'new-order' : ''}`}>
              <div className="kitchen-card__header">
                <div>
                  <div className="kitchen-card__id">{order.order_number}</div>
                  <div className="kitchen-card__time">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
                <span className={`kitchen-card__badge ${currentStatus.toLowerCase().split(' ')[0]}`}>
                  {currentStatus}
                </span>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'1rem'}}>
                <div className="kitchen-card__context">
                  <span className="kitchen-context__label">Customer</span>
                  <div className="kitchen-context__value">{order.customer_name || 'Guest'}</div>
                </div>
                <div className="kitchen-card__context">
                  <span className="kitchen-context__label">Context</span>
                  <div className="kitchen-context__value">
                    {order.order_type === 'dine_in' ? `Table ${order.table_number || '?'}` :
                     order.order_type === 'car' ? `Car ${order.car_number || '?'}` :
                     'Takeaway'}
                  </div>
                </div>
              </div>

              <div className="kitchen-card__items">
                {parseOrderItems(order.items)}
              </div>

              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', padding:'0 0.5rem'}}>
                 <span style={{fontSize:'0.75rem', opacity: 0.5, textTransform:'uppercase'}}>Total</span>
                 <span style={{fontWeight:800, color: 'var(--color-primary)', fontSize:'1.1rem'}}>${Number(order.total_price || order.total || 0).toFixed(2)}</span>
              </div>

              <div className="kitchen-card__actions">
                {(currentStatus === 'pending' || currentStatus === 'Order Placed' || !currentStatus) && (
                  <button className="kitchen-btn preparing" onClick={() => updateStatus(order.id, 'preparing')}>
                    Start Preparing
                  </button>
                )}

                {currentStatus === 'preparing' && (
                  <button className="kitchen-btn ready" onClick={() => updateStatus(order.id, 'ready')}>
                    Ready
                  </button>
                )}

                {currentStatus === 'ready' && (
                  <button className="kitchen-btn completed" onClick={() => updateStatus(order.id, 'completed')}>
                    Completed
                  </button>
                )}
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [section, setSection] = useState('home');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allAddons, setAllAddons] = useState([]);
  const [addonLinks, setAddonLinks] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, newOrders: 0, totalProducts: 0 });

  const fetchData = async () => {
    try {
      const { data: p } = await supabase.from('menu_items').select('*').order('id');
      const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const { data: a } = await supabase.from('addons').select('*').order('id');
      const { data: links } = await supabase.from('product_addons').select('*');
      
      setProducts(p || []);
      setOrders(o || []);
      setAllAddons(a || []);
      setAddonLinks(links || []);
      setStats({
        totalOrders: o?.length || 0,
        newOrders: o?.filter(ord => ord.current_status === 'Order Placed').length || 0,
        totalProducts: p?.length || 0
      });
    } catch (err) { console.error('Admin Fetch Error:', err); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="admin-root admin-layout">
      <AdminSidebar active={section} setSection={setSection} onLogout={() => window.location.href = '/'} />
      <main className="admin-main">
        {section === 'home' && <AdminHome stats={stats} />}
        {section === 'products' && <AdminProducts products={products} allAddons={allAddons} addonLinks={addonLinks} onRefresh={fetchData} />}
        {section === 'orders' && <AdminOrders orders={orders} onUpdate={async (id, s) => { await supabase.from('orders').update({current_status:s}).eq('id',id); fetchData(); }} />}
        {section === 'addons' && <AdminExtras onRefresh={fetchData} />}
      </main>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('customer');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const p = window.location.pathname;
    if (p === '/admin') {
      setView('admin');
    } else if (p === '/kitchen') {
      setView('kitchen');
    } else {
      setView('customer');
    }
  }, []);

  if (view === 'kitchen') return <KitchenDashboard />;

  if (view === 'admin') {
    if (!isAdminLoggedIn) return <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />;
    return <AdminDashboard />;
  }

  return (
    <CustomerErrorBoundary>
      <CustomerApp />
    </CustomerErrorBoundary>
  );
}
