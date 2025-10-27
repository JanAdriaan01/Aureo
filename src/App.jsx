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
                  <div className="mt-1 font-bold">R {item.price.toLocaleString()}</div>
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
  const productType = productEntry ? productEntry[0] : null;
  const product = productEntry ? productEntry[1] : null;

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

// ---------- Order ----------
// ---------- Order ----------
function Order() {
  const { items, removeItem, clearOrder, customer, setCustomer } = useOrder();
  const [stage, setStage] = useState("review"); // review | confirm | success
  const [orderId, setOrderId] = useState("");
  const [shipping, setShipping] = useState(0);

  const total = items.reduce((sum, x) => sum + (x.subtotal || 0), 0);
  const grandTotal = total + shipping;

  const handleCheckout = () => {
    if (!customer.name || !customer.email || !customer.phone || !customer.siteAddress) {
      alert("Please complete all customer details before placing order.");
      return;
    }
    const id = `ORD-${Date.now().toString().slice(-6)}`; // ✅ FIXED
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
          Orders not paid within 72 hours are automatically cancelled. All orders are shipped
          from <b>Midrand Warehouse</b> after manufacturing and payment confirmation.
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
                  onChange={(v) => setCustomer({ ...customer, name: v })}
                />
                <Input
                  label="Email"
                  value={customer.email}
                  onChange={(v) => setCustomer({ ...customer, email: v })}
                />
                <Input
                  label="Phone"
                  value={customer.phone}
                  onChange={(v) => setCustomer({ ...customer, phone: v })}
                />
                <Input
                  label="Site address"
                  value={customer.siteAddress}
                  onChange={(v) => setCustomer({ ...customer, siteAddress: v })}
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

function Input({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-zinc-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 rounded-xl border border-zinc-300"
      />
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
