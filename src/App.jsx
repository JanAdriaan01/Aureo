import React, { useMemo, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  PRODUCT_LIBRARY,
  ROOM_PRESETS,
  GLASS_MULTIPLIER,
  FINISH_MULTIPLIER,
  makeSku,
  parseSku,
  findProductByPrefix,
  PRODUCT_REVIEWS,
} from "./data/catalog";

/*
  AUREO INTERNATIONAL — Aluminium Windows (React SPA)
  Shop grid with filters (Room / Type), preset sizes, instant pricing.
  - TailwindCSS for styling
  - Order flow persists via localStorage
  - Product Details uses base price + glazing/finish multipliers
*/

// ---------- Utilities ----------
const IMAGES = {
  sliding1000: "/images/sliding1000.jpg",
  swift38: "/images/swift38.jpg",
  edge42: "/images/edge42.jpg",
  elite: "/images/elite.jpg",
};

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

// ---------- Layout ----------
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Logo />
          <nav className="hidden md:flex gap-4 text-sm">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/products">Products</NavItem>
            <NavItem to="/order">Order</NavItem>
            <NavItem to="/gallery">Gallery</NavItem>
            <NavItem to="/compliance">Compliance</NavItem>
            <NavItem to="/faq">FAQ</NavItem>
            <NavItem to="/contact">Contact</NavItem>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <OrderMini />
           
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
       <ChatButton />
      <Footer />
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <img src="/images/logo.png" alt="Aureo Logo" className="w-14 h-14 object-contain" />
      <div className="leading-tight">
        <div>AUREO INTERNATIONAL</div>
        <div className="text-xs text-zinc-500">A Modahaus Company</div>
      </div>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      end
      className={({ isActive }) =>
        classNames(
          "px-3 py-1.5 rounded-xl hover:bg-zinc-100",
          isActive && "bg-zinc-900 text-white hover:bg-zinc-900"
        )
      }
      to={to}
    >
      {children}
    </NavLink>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <Logo />
          <p className="mt-3 text-zinc-600">
            Fabrication & shipment of aluminium window systems. SANS compliant.
            Coastal & inland specs.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-2">Quick links</div>
          <ul className="space-y-1">
            <li><a href="/products" className="hover:underline">Products</a></li>
            <li><a href="/order" className="hover:underline">Place an Order</a></li>
            <li><a href="/compliance" className="hover:underline">Compliance</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <div className="text-zinc-600">Johannesburg</div>
          <div className="text-zinc-600">+27 (0) 61 193 3931</div>
          <div className="text-zinc-600">info@modahaus.co.za</div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Global Order State ----------
const OrderContext = React.createContext(null);

function OrderProvider({ children }) {
  const [items, setItems] = useLocalStorage("order-items", []);
  const [customer, setCustomer] = useLocalStorage("order-customer", {
    name: "",
    email: "",
    phone: "",
    siteAddress: "",
  });

  const addItem = (item) =>
    setItems((prev) => [...prev, { id: crypto.randomUUID(), ...item }]);
  const removeItem = (id) => setItems((prev) => prev.filter((x) => x.id !== id));
  const clearOrder = () => setItems([]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, clearOrder, customer, setCustomer }),
    [items, customer]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

function useOrder() {
  const ctx = React.useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}

function OrderMini() {
  const { items } = useOrder();
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/order")}
      className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-sm"
    >
      Order <span className="opacity-80">({items.length})</span>
    </button>
  );
}

// ---------- Pages ----------
function Home() {
  const navigate = useNavigate();
  return (
    <div className="space-y-16">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Aluminium windows, built to your spec.
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            Premium systems in standard sizes or custom — anodised or powder coated.
            Live pricing for standard sizes. Configure online; we fabricate.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate("/products")}
              className="px-5 py-3 rounded-2xl bg-zinc-900 text-white"
            >
              Shop Windows
            </button>
            <button
              onClick={() => navigate("/order")}
              className="px-5 py-3 rounded-2xl border border-zinc-300"
            >
              Review Order
            </button>
          </div>
          <div className="mt-6 text-sm text-zinc-500">
            Lead times from 10 working days depending on finish and glazing.
          </div>
        </div>
        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
          <img src={IMAGES.sliding1000} alt="Premium Aluminium Windows" className="w-full h-full object-cover" />
        </div>
      </section>
      <TrustBar />
    </div>
  );
}

function TrustBar() {
  const items = [
    { title: "SANS-aligned", text: "Glazing & wind load checks inline with local standards." },
    { title: "Site-measured", text: "We verify openings before fabrication." },
    { title: "Warranty-backed", text: "Finish & workmanship warranties available." },
    { title: "Nationwide", text: "Install teams across major metros." },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((x, i) => (
        <div key={i} className="rounded-2xl border border-zinc-200 p-4 bg-white">
          <div className="font-semibold">{x.title}</div>
          <div className="text-sm text-zinc-600">{x.text}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- Shop (filters + grid) ----------
function Products() {
  const navigate = useNavigate();
  const [room, setRoom] = useState("");           // Bathroom / Bedroom / Kitchen / LivingRoom
  const [typeFilter, setTypeFilter] = useState(""); // Sliding Window / Casement Window / Fixed Window
  const presetSizes = room ? ROOM_PRESETS[room] || [] : null;

  const gridItems = useMemo(() => {
    // Build flat list from PRODUCT_LIBRARY based on filters
    const items = [];
    Object.entries(PRODUCT_LIBRARY).forEach(([type, product]) => {
      if (typeFilter && type !== typeFilter) return;

      Object.entries(product.sizes).forEach(([size, basePrice]) => {
        if (presetSizes && !presetSizes.includes(size)) return;
        const sku = makeSku(product.codePrefix, size);
        items.push({
          sku,
          type,
          size,
          name: `${type} ${size}`,
          image: product.image,
          price: basePrice, // base (clear glass, white frame)
        });
      });
    });
    return items;
  }, [room, typeFilter]);

  return (
    <div className="grid lg:grid-cols-[280px,1fr] gap-8">
      {/* Sidebar */}
      <aside className="space-y-6 bg-white border border-zinc-200 rounded-2xl p-4 h-max sticky top-24">
        <h2 className="font-semibold text-zinc-800">Filters</h2>

        {/* Room */}
        <div>
          <div className="font-medium text-sm text-zinc-800 mb-1">Room</div>
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
          >
            <option value="">All rooms</option>
            <option>Bathroom</option>
            <option>Bedroom</option>
            <option>Kitchen</option>
            <option value="LivingRoom">Living Room</option>
          </select>
          <div className="text-xs text-zinc-500 mt-1">
            Presets: {room ? (ROOM_PRESETS[room] || []).join(", ") : "–"}
          </div>
        </div>

        {/* Type */}
        <div>
          <div className="font-medium text-sm text-zinc-800 mb-1">Window Type</div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
          >
            <option value="">All types</option>
            {Object.keys(PRODUCT_LIBRARY).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-zinc-500">
          Prices shown are for **clear glass & white frame**. Adjust on the product page.
        </div>
      </aside>

      {/* Grid */}
      <div>
        <h1 className="text-3xl font-bold mb-4">Shop Windows</h1>
        {gridItems.length === 0 ? (
          <div className="text-sm text-zinc-600">No products match your filters.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gridItems.map((item) => (
              <div key={item.sku} className="rounded-2xl border border-zinc-200 overflow-hidden bg-white">
                <img src={item.image} alt={item.name} className="w-full aspect-[4/3] object-cover" />
                <div className="p-4">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-zinc-600">{item.type}</div>
                  <ReviewSummary sku={item.sku} />
      </div>
                  <div className="mt-1 font-bold">R {item.price.toLocaleString()}</div>
                   <div className="mt-2">
        
                  <button
                    onClick={() => navigate(`/products/${encodeURIComponent(item.sku)}`)}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Product Details (instant price with multipliers) ----------
function ProductDetails() {
  const { code: rawSku } = useParams(); // sku = e.g. CW-1200x1500
  const sku = decodeURIComponent(rawSku || "");
  const navigate = useNavigate();
  const { addItem } = useOrder();

  const { prefix, size: initialSize } = parseSku(sku);
  const productEntry = findProductByPrefix(prefix);
  
  // FIX: Check if productEntry exists and destructure properly
  const productType = productEntry ? productEntry[0] : null;
  const product = productEntry ? productEntry[1] : null;

  // ADD THESE LINES FOR REVIEWS
  const reviews = PRODUCT_REVIEWS[sku] || [];
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Add debug logging
  console.log('ProductDetails debug:', { sku, prefix, productEntry, productType, product });
  
  const [config, setConfig] = useState({
    size: initialSize || (product ? Object.keys(product.sizes)[0] : ""),
    glazing: "clear",
    colour: "white",
    quantity: 1,
  });

  if (!product) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="text-sm text-zinc-500 hover:underline">
          ← Back
        </button>
        <div className="text-zinc-600">Product not found.</div>
      </div>
    );
  }

  const base = product.sizes[config.size] || 0;
  const price =
    Math.round(
      base *
        (GLASS_MULTIPLIER[config.glazing] || 1) *
        (FINISH_MULTIPLIER[config.colour] || 1)
    / 10) * 10; // round to nearest 10

  const handleAdd = () => {
    if (!base) {
      alert("Please select a valid size.");
      return;
    }
    addItem({
      system: product.codePrefix,
      systemName: `${productType} ${config.size}`,
      size: config.size,
      glazing: config.glazing,
      finish: config.colour,
      quantity: config.quantity,
      price,
      subtotal: price * config.quantity,
    });
    alert(`${productType} ${config.size} added to order.`);
  };

  return (
    <div className="space-y-8">
      <button onClick={() => navigate(-1)} className="text-sm text-zinc-500 hover:underline">
        ← Back to Products
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden border border-zinc-200">
          <img src={product.image} alt={productType} className="w-full h-full object-cover" />
        </div>

        <div>
          <h1 className="text-3xl font-bold">{productType}</h1>
          <div className="text-zinc-600 mt-1">{product.description}</div>

          <div className="mt-6 space-y-4">
            {/* Size */}
            <div>
              <label className="font-medium text-sm text-zinc-700">Select Size</label>
              <select
                value={config.size}
                onChange={(e) => setConfig({ ...config, size: e.target.value })}
                className="block w-full border border-zinc-300 rounded-lg mt-1 p-2"
              >
                {Object.keys(product.sizes).map((sz) => (
                  <option key={sz} value={sz}>{sz} mm</option>
                ))}
              </select>
            </div>

            {/* Glazing */}
            <div>
              <label className="font-medium text-sm text-zinc-700">Glazing</label>
              <select
                value={config.glazing}
                onChange={(e) => setConfig({ ...config, glazing: e.target.value })}
                className="block w-full border border-zinc-300 rounded-lg mt-1 p-2"
              >
                <option value="clear">Clear</option>
                <option value="tinted">Tinted</option>
                <option value="laminated">Laminated</option>
                <option value="lowe">Low-E</option>
              </select>
            </div>

            {/* Colour */}
            <div>
              <label className="font-medium text-sm text-zinc-700">Frame Colour</label>
              <select
                value={config.colour}
                onChange={(e) => setConfig({ ...config, colour: e.target.value })}
                className="block w-full border border-zinc-300 rounded-lg mt-1 p-2"
              >
                <option value="white">Powder Coat — White</option>
                <option value="charcoal">Powder Coat — Charcoal</option>
                <option value="black">Powder Coat — Black</option>
                <option value="bronze">Anodised — Bronze</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="font-medium text-sm text-zinc-700">Quantity</label>
              <input
                type="number"
                min="1"
                value={config.quantity}
                onChange={(e) => setConfig({ ...config, quantity: Number(e.target.value) || 1 })}
                className="block w-full border border-zinc-300 rounded-lg mt-1 p-2"
              />
            </div>
          </div>

          {/* Price Display */}
          <div className="mt-6 text-2xl font-semibold">
            {base ? `Price: R ${price.toLocaleString()}` : "Select size to see price"}
          </div>

          {/* Add Button */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAdd}
              disabled={!base}
              className={`px-6 py-3 rounded-2xl text-base font-medium transition ${
                base
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-zinc-300 text-zinc-600 cursor-not-allowed"
              }`}
            >
              🛒 Add to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  } 
// ---------- Product Reviews Component ----------
function ProductReviews({ sku, reviews, averageRating }) {
  const [sortBy, setSortBy] = useState('recent');
  
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    if (sortBy === 'highest') return b.rating - a.rating;
    return a.rating - b.rating;
  });

  return (
    <section className="border-t border-zinc-200 pt-8">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      
      {/* Review Summary Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-zinc-900">{averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-zinc-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <div className="text-sm text-zinc-500 mt-1">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <div key={review.id} className="border-b border-zinc-100 pb-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-zinc-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Verified Purchase
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-zinc-900">{review.title}</h3>
              </div>
              <span className="text-sm text-zinc-500">{new Date(review.date).toLocaleDateString()}</span>
            </div>
            
            <p className="text-zinc-700 mb-3">{review.comment}</p>
            
            {/* Review Images */}
            {review.images.length > 0 && (
              <div className="flex gap-2 mb-3">
                {review.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="Review"
                    className="w-20 h-20 object-cover rounded-lg border border-zinc-200 cursor-pointer"
                    onClick={() => window.open(img, '_blank')}
                  />
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">By {review.customerName}</span>
              <button className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                </svg>
                Helpful ({review.helpful})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Reviews State */}
      {reviews.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-zinc-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
          <h3 className="text-lg font-semibold text-zinc-600 mb-2">No reviews yet</h3>
          <p className="text-zinc-500">Be the first to review this product</p>
        </div>
      )}
    </section>
  );
}
// ---------- Order ----------

function Order() {

   console.log('Order component rendering'); // Add this line
  const ctx = useOrder();
  if (!ctx) {
    return (
      <div className="text-center text-zinc-600 py-20">
        Loading order context...
      </div>
    );
  }

  const { items, removeItem, clearOrder, customer, setCustomer } = ctx;
  const [stage, setStage] = useState("review");
  const [orderId, setOrderId] = useState("");
  const [shipping, setShipping] = useState(0);
  const [customerErrors, setCustomerErrors] = useState({});

  const total = items.reduce((sum, x) => sum + (x.subtotal || 0), 0);
  const grandTotal = total + shipping;

  // Validation function
  const validateCustomer = (customer) => {
    const errors = [];
    
    if (!customer.name?.trim()) {
      errors.push("Full name is required");
    }
    
    if (!customer.email?.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.push("Valid email address is required");
    }
    
    if (!customer.phone?.trim()) {
      errors.push("Phone number is required");
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(customer.phone.replace(/\s/g, ''))) {
      errors.push("Valid phone number is required");
    }
    
    if (!customer.siteAddress?.trim()) {
      errors.push("Site address is required");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Real-time field validation
  const validateField = (field, value) => {
    const errors = { ...customerErrors };
    
    switch (field) {
      case 'email':
        if (!value.trim()) {
          errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = "Valid email is required";
        } else {
          delete errors.email;
        }
        break;
      case 'phone':
        if (!value.trim()) {
          errors.phone = "Phone is required";
        } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value.replace(/\s/g, ''))) {
          errors.phone = "Valid phone number is required";
        } else {
          delete errors.phone;
        }
        break;
      case 'name':
        if (!value.trim()) {
          errors.name = "Full name is required";
        } else {
          delete errors.name;
        }
        break;
      case 'siteAddress':
        if (!value.trim()) {
          errors.siteAddress = "Site address is required";
        } else {
          delete errors.siteAddress;
        }
        break;
      default:
        if (!value.trim()) {
          errors[field] = `${field} is required`;
        } else {
          delete errors[field];
        }
    }
    
    setCustomerErrors(errors);
  };

  const handleCheckout = () => {
    const validation = validateCustomer(customer);
    if (!validation.isValid) {
      alert(`Please fix the following errors:\n\n• ${validation.errors.join('\n• ')}`);
      return;
    }

    const id = `ORD-${Date.now().toString().slice(-6)}`;
    setOrderId(id);
    setStage("confirm");
  };

  const confirmPayment = () => {
    setStage("success");
    clearOrder();
  };

  // ---------- SUCCESS ----------
  if (stage === "success") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold">Order Placed</h1>
        <p className="text-zinc-600">
          Your order <b>{orderId}</b> has been received and is awaiting payment.
        </p>
        <p className="text-zinc-600">
          Please make payment via <b>EFT within 72 hours</b> using your order number as
          reference. Once payment reflects, a confirmation email with receipt will be sent.
        </p>

        <div className="rounded-2xl border border-zinc-200 p-6 bg-white text-left inline-block mt-4">
          <h2 className="font-semibold mb-2">Bank Details</h2>
          <div className="text-sm leading-relaxed text-zinc-700">
            <div><b>Account Name:</b> Modahaus (Pty) Ltd</div>
            <div><b>Bank:</b> FNB</div>
            <div><b>Account Number:</b> 62012345678</div>
            <div><b>Branch Code:</b> 250655</div>
            <div><b>Reference:</b> {orderId}</div>
          </div>
        </div>

        <p className="text-sm text-zinc-500 mt-4">
          Orders not paid within 72 hours are automatically cancelled.
          Orders are shipped from <b>Midrand Warehouse</b> after manufacturing and payment.
        </p>

        <a
          href="/products"
          className="inline-block mt-6 px-6 py-3 rounded-2xl bg-zinc-900 text-white"
        >
          Back to Shop
        </a>
      </div>
    );
  }

  // ---------- CONFIRM ----------
  if (stage === "confirm") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Confirm Order</h1>
        <p className="text-zinc-600">
          Please confirm your order details below. Shipping will be added based on your address.
        </p>

        <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
          <h2 className="font-semibold mb-2">Customer</h2>
          <div className="text-sm text-zinc-700">
            {customer.name}, {customer.email}, {customer.phone}
            <br />
            {customer.siteAddress}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
          <h2 className="font-semibold mb-2">Order Items</h2>
          <ul className="divide-y divide-zinc-200 text-sm">
            {items.map((x, i) => (
              <li key={i} className="py-2 flex justify-between">
                <div>
                  {x.systemName} ({x.size}) × {x.quantity}
                </div>
                <div>R {x.subtotal.toLocaleString()}</div>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-right font-semibold">
            Subtotal: R {total.toLocaleString()}
          </div>
          {shipping > 0 && (
            <div className="text-right text-sm text-zinc-600">
              + Shipping: R {shipping.toLocaleString()}
            </div>
          )}
          <div className="text-right text-xl font-bold mt-1">
            Total: R {grandTotal.toLocaleString()}
          </div>
        </div>

        <div className="text-right">
          <button
            onClick={confirmPayment}
            className="px-6 py-3 rounded-2xl bg-zinc-900 text-white"
          >
            Place Order & Show EFT Details
          </button>
        </div>
      </div>
    );
  }

  // ---------- REVIEW ----------
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Order</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 p-6 bg-white">
          <div className="text-zinc-600">
            No line items yet. Visit{" "}
            <a href="/products" className="underline">
              Products
            </a>{" "}
            to add windows.
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50">
                <tr className="text-left">
                  {"# System Size Qty Glazing Finish UnitPrice Total"
                    .split(" ")
                    .map((h, i) => (
                      <th key={i} className="px-3 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((x, i) => (
                  <tr key={x.id} className="border-t border-zinc-100">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{x.systemName}</td>
                    <td className="px-3 py-2">{x.size}</td>
                    <td className="px-3 py-2">{x.quantity}</td>
                    <td className="px-3 py-2">{x.glazing}</td>
                    <td className="px-3 py-2">{x.finish}</td>
                    <td className="px-3 py-2">R {x.price.toLocaleString()}</td>
                    <td className="px-3 py-2">R {x.subtotal.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => removeItem(x.id)}
                        className="px-3 py-1.5 rounded-xl border border-zinc-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right text-xl font-bold mt-4 p-4">
              Subtotal: R {total.toLocaleString()}
            </div>
          </div>

          <section className="grid lg:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
              <div className="font-semibold">Customer Details</div>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <Input
                  label="Full name"
                  value={customer.name}
                  onChange={(v) => {
                    setCustomer({ ...customer, name: v });
                    validateField('name', v);
                  }}
                  required
                  error={customerErrors.name}
                />
                <Input
                  label="Email"
                  value={customer.email}
                  onChange={(v) => {
                    setCustomer({ ...customer, email: v });
                    validateField('email', v);
                  }}
                  required
                  error={customerErrors.email}
                />
                <Input
                  label="Phone"
                  value={customer.phone}
                  onChange={(v) => {
                    setCustomer({ ...customer, phone: v });
                    validateField('phone', v);
                  }}
                  required
                  error={customerErrors.phone}
                />
                <Input
                  label="Site address"
                  value={customer.siteAddress}
                  onChange={(v) => {
                    setCustomer({ ...customer, siteAddress: v });
                    validateField('siteAddress', v);
                  }}
                  required
                  error={customerErrors.siteAddress}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-5 bg-white h-max">
              <div className="font-semibold mb-3">Next Step</div>
              <button
                onClick={handleCheckout}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 text-white font-medium"
              >
                Proceed to Checkout (EFT)
              </button>
              <p className="text-xs text-zinc-500 mt-3">
                Shipping will be quoted once address is confirmed. Orders ship from Midrand
                Warehouse after manufacturing & payment.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
//--------- WhatsApp Chat Button ----------
function ChatButton() {
  const phoneNumber = "+27611933931"; // Your phone number
  const message = "Hi, I'm interested in your aluminium windows. Can you help me?";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.189-1.248-6.189-3.515-8.444"/>
      </svg>
    </a>
  );
}

// ---------- Product Review Summary ----------
function ReviewSummary({ sku, showCount = true }) {
  const reviews = PRODUCT_REVIEWS[sku] || [];
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  if (reviews.length === 0) {
    return showCount ? (
      <div className="flex items-center gap-1 text-sm text-zinc-500">
        <span>No reviews yet</span>
      </div>
    ) : null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Star Rating */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3 h-3 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-zinc-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
        <span className="text-sm font-medium text-zinc-700 ml-1">
          {averageRating.toFixed(1)}
        </span>
      </div>
      
      {/* Review Count */}
      {showCount && (
        <span className="text-sm text-zinc-500">
          ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
}

// ---------- Reusable Input Component ----------
function Input({ label, value, onChange, type = "text", required = false, error }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-zinc-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`px-4 py-2 rounded-xl border ${
          error ? 'border-red-300 bg-red-50' : 'border-zinc-300'
        }`}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}

// ---------- Other Pages ----------
function Gallery() {
  const imgs = [IMAGES.elite, IMAGES.swift38, IMAGES.edge42, IMAGES.sliding1000];
  return (
    <div>
      <h1 className="text-3xl font-bold">Gallery</h1>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {imgs.map((src, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-zinc-200 aspect-[4/3]">
            <img src={src} alt="Project" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Compliance() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Compliance & Care</h1>
      <p className="text-zinc-600 max-w-3xl">
        We adhere to manufacturer manuals during fabrication and installation and align glazing to SANS guidelines.
      </p>
      <ul className="list-disc list-inside space-y-1 text-zinc-700">
        <li>Fabrication from genuine Wispeco/Crealco profiles only.</li>
        <li>Joint sealing with compatible silicone.</li>
        <li>Performance certificates and manuals available on request.</li>
      </ul>
    </div>
  );
}

function FAQ() {
  const faqs = [
    { q: "How are orders priced?", a: "Live prices for standard sizes (clear glass & white frame). Extras adjust on PDP." },
    { q: "Lead time?", a: "Typically 10–20 working days after deposit and site measure." },
    { q: "Do you install?", a: "Yes. Our trained teams install to best practice." },
  ];
  return (
    <div>
      <h1 className="text-3xl font-bold">FAQs</h1>
      <div className="mt-4 grid gap-4">
        {faqs.map((f, i) => (
          <details key={i} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <summary className="font-medium cursor-pointer">{f.q}</summary>
            <div className="text-zinc-700 mt-2">{f.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

function Contact() {
  const [msg, setMsg] = useState({ name: "", email: "", phone: "", message: "" });
  const submit = (e) => {
    e.preventDefault();
    alert("Thanks! We’ll get back to you.");
    setMsg({ name: "", email: "", phone: "", message: "" });
  };
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-3xl font-bold">Contact</h1>
        <p className="text-zinc-600 mt-1">Send a message or call us to discuss your project.</p>
        <div className="mt-6 space-y-2 text-zinc-700">
          <div><span className="font-medium">Phone:</span> +27 (0) 61 193 3931</div>
          <div><span className="font-medium">Email:</span> info@modahaus.co.za</div>
          <div><span className="font-medium">Hours:</span> Mon–Sun 08:00–17:00</div>
        </div>
      </div>
      <form onSubmit={submit} className="rounded-2xl border border-zinc-200 p-5 bg-white">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Full name" value={msg.name} onChange={(v) => setMsg({ ...msg, name: v })} />
          <Input label="Email" value={msg.email} onChange={(v) => setMsg({ ...msg, email: v })} />
          <Input label="Phone" value={msg.phone} onChange={(v) => setMsg({ ...msg, phone: v })} />
        </div>
        <label className="flex flex-col gap-1 mt-3">
          <span className="text-sm text-zinc-600">Message</span>
          <textarea
            value={msg.message}
            onChange={(e) => setMsg({ ...msg, message: e.target.value })}
            className="px-4 py-2 rounded-xl border border-zinc-300 min-h-[120px]"
          />
        </label>
        <div className="mt-4">
          <button className="px-5 py-3 rounded-2xl bg-zinc-900 text-white">Send</button>
        </div>
      </form>
    </div>
  );
}

// ---------- App ----------
function App() {
  return (
    <BrowserRouter>
      <OrderProvider>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:code" element={<ProductDetails />} />
            <Route path="/order" element={<Order />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Shell>
      </OrderProvider>
    </BrowserRouter>
  );
}

export default App;

// For plain HTML mounting:
// const root = createRoot(document.getElementById("root"));
// root.render(<App />);
