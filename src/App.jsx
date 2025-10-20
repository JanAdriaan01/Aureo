import React, { useMemo, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";

/*
  Crealco Aluminium Windows — Full Website (React SPA)

  Notes for the site owner:
  - This is a single-file React app that you can drop into any Vite/Next/CRA project as App.jsx.
  - Uses Tailwind classes for styling (no external CSS required beyond Tailwind).
  - The "Order" flow collects specs and produces a human-readable PDF/print and CSV export.
  - All pricing is intentionally omitted — you will price manually after receiving the order.
  - Replace placeholder images in the IMAGES map with your own product photos.

  Pages:
  - Home (hero, trust, CTA)
  - Products (Crealco systems catalogue with filters)
  - Builder (configure each window/door + add to order)
  - Order (customer details, final review, export/send)
  - Gallery (before/after, inspiration; placeholders here)
  - Compliance (warranty, cleaning & maintenance summary)
  - FAQ & Contact
*/

// ---------- Utilities ----------
const IMAGES = {
  elite: "https://images.unsplash.com/photo-1523419409543-a7ea0c77e2d1?w=1200&q=80&auto=format&fit=crop",
  slenderline500: "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?w=1200&q=80&auto=format&fit=crop",
  sliding1000: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80&auto=format&fit=crop",
  swift36: "https://images.unsplash.com/photo-1534239143979-0e3c5ea1e57c?w=1200&q=80&auto=format&fit=crop",
  swift38: "https://images.unsplash.com/photo-1505693621784-35f4b3b4f7b0?w=1200&q=80&auto=format&fit=crop",
  skyline41: "https://images.unsplash.com/photo-1486946255434-2466348c2166?w=1200&q=80&auto=format&fit=crop",
  pivot38: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&auto=format&fit=crop",
  edge42: "https://images.unsplash.com/photo-1472224371017-08207f84aaae?w=1200&q=80&auto=format&fit=crop",
  serene52: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&q=80&auto=format&fit=crop",
  vert70: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80&auto=format&fit=crop",
  clip38: "https://images.unsplash.com/photo-1519710884005-8a3cb1886c2f?w=1200&q=80&auto=format&fit=crop",
  clip44: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop",
};

const CREALCO_SYSTEMS = [
  { code: "ELITE", name: "Elite™ Sliding Window", type: "Sliding Window", depth_mm: 0, image: IMAGES.elite },
  { code: "SLENDERLINE500", name: "500 Slenderline Sliding Window", type: "Sliding Window", depth_mm: 0, image: IMAGES.slenderline500 },
  { code: "SLIDING1000", name: "1000 Sliding Window", type: "Sliding Window", depth_mm: 0, image: IMAGES.sliding1000 },
  { code: "SWIFT36", name: "Swift™ 36 (36mm) Top/Side Hung", type: "Casement", depth_mm: 36, image: IMAGES.swift36 },
  { code: "SWIFT38", name: "Swift™ 38 (38mm) Top/Side Hung", type: "Casement", depth_mm: 38, image: IMAGES.swift38 },
  { code: "SKYLINE41", name: "Skyline™ High Performance (41mm)", type: "Casement/Project", depth_mm: 41, image: IMAGES.skyline41 },
  { code: "PIVOT38", name: "Pivot 38 (38mm)", type: "Pivot", depth_mm: 38, image: IMAGES.pivot38 },
  { code: "EDGE42", name: "Edge™ Thermal Break (42mm)", type: "Thermal Break Casement", depth_mm: 42, image: IMAGES.edge42 },
  { code: "SERENE52", name: "Serene™ Tilt & Turn (52mm)", type: "Tilt & Turn", depth_mm: 52, image: IMAGES.serene52 },
  { code: "VERT70", name: "Vert 70 Vertical Sliding Window", type: "Vertical Sliding", depth_mm: 70, image: IMAGES.vert70 },
  { code: "CLIP38", name: "Clip 38 Shopfront", type: "Shopfront", depth_mm: 38, image: IMAGES.clip38 },
  { code: "CLIP44", name: "Clip 44™ Shopfront", type: "Shopfront", depth_mm: 44, image: IMAGES.clip44 },
];

const FINISHES = ["Natural Anodised", "Bronze Anodised", "Black Anodised", "Powder Coat White", "Powder Coat Charcoal", "Custom RAL/Code"];
const GLAZING = ["3mm Float", "4mm Float", "6.38mm Laminated", "6.38mm PVB Lam Safety", "Double Glazed 24mm", "Low-E (specify)"];
const HARDWARE = ["Standard", "Lockable Handle", "Night Latch", "Safety Stays", "Trickle Vent"];

const SASH_TYPES = [
  { key: "top-hung", label: "Top Hung" },
  { key: "side-hung", label: "Side Hung" },
  { key: "fixed", label: "Fixed" },
  { key: "sliding-2", label: "2-Panel Sliding" },
  { key: "sliding-3", label: "3-Panel Sliding" },
  { key: "pivot", label: "Pivot" },
  { key: "tilt-turn", label: "Tilt & Turn" },
  { key: "vertical-slide", label: "Vertical Sliding" },
  { key: "shopfront", label: "Shopfront" },
];

function classNames(...xs){return xs.filter(Boolean).join(" ");}

function useLocalStorage(key, initial){
  const [state, setState] = useState(()=>{
    try{ const raw = localStorage.getItem(key); return raw? JSON.parse(raw): initial; }catch{ return initial; }
  });
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(state)); }catch{} },[key, state]);
  return [state, setState];
}

// ---------- Layout ----------
function Shell({ children }){
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
     
     <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-zinc-200"> 
     <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4"> 
      <Logo /> <nav className="hidden md:flex gap-4 text-sm"> 
        <NavItem to="/">Home</NavItem> 
        <NavItem to="/products">Products</NavItem> 
        <NavItem to="/builder">Builder</NavItem> 
        <NavItem to="/order">Order</NavItem> 
        <NavItem to="/gallery">Gallery</NavItem> 
        <NavItem to="/compliance">Compliance</NavItem> 
        <NavItem to="/faq">FAQ</NavItem> 
        <NavItem to="/contact">Contact</NavItem> 
        </nav> <div className="ml-auto flex items-center gap-2"> <OrderMini />
        </div> 
        </div> 
        </header>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}

function Logo(){
  return (
    <div className="flex items-center gap-2 font-semibold">
      <img 
        src="/images/logo.png" 
        alt="Aureo Logo" 
        className="w-14 h-14 object-contain"
      />
         <div className="leading-tight">
        <div>AUREO</div>
        <div className="text-xs text-zinc-500">A Modahaus Company</div>
      </div>
    </div>
  );
}

function NavItem({ to, children }){
  return (
    <NavLink end className={({isActive})=>classNames("px-3 py-1.5 rounded-xl hover:bg-zinc-100", isActive && "bg-zinc-900 text-white hover:bg-zinc-900")} to={to}>
      {children}
    </NavLink>
  );
}

function Footer(){
  return (
    <footer className="border-t border-zinc-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <Logo />
          <p className="mt-3 text-zinc-600">Fabrication & installation of Crealco aluminium systems. SANS compliant. Coastal & inland specs.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Quick links</div>
          <ul className="space-y-1">
            <li><a href="/products" className="hover:underline">Products</a></li>
            <li><a href="/builder" className="hover:underline">Spec Builder</a></li>
            <li><a href="/order" className="hover:underline">Place an Order</a></li>
            <li><a href="/compliance" className="hover:underline">Compliance</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <div className="text-zinc-600">Johannesburg • Cape Town • Durban</div>
          <div className="text-zinc-600">+27 (0) 61 193 3931</div>
          <div className="text-zinc-600">info@modahaus.co.za</div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Global Order State ----------
const OrderContext = React.createContext(null);

function OrderProvider({ children }){
  const [items, setItems] = useLocalStorage("order-items", []);
  const [customer, setCustomer] = useLocalStorage("order-customer", { name: "", company: "", email: "", phone: "", siteAddress: "", notes: "" });

  const addItem = (item)=> setItems(prev=>[...prev, { id: crypto.randomUUID(), ...item }]);
  const removeItem = (id)=> setItems(prev=>prev.filter(x=>x.id!==id));
  const clearOrder = ()=> setItems([]);

  const value = useMemo(()=>({ items, addItem, removeItem, clearOrder, customer, setCustomer }), [items, customer]);
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

function useOrder(){
  const ctx = React.useContext(OrderContext);
  if(!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}

function OrderMini(){
  const { items } = useOrder();
  const navigate = useNavigate();
  return (
    <button onClick={()=>navigate("/order")} className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-sm">
      Order <span className="opacity-80">({items.length})</span>
    </button>
  );
}

// ---------- Pages ----------
function Home(){
  const navigate = useNavigate();
  return (
    <div className="space-y-16">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Crealco aluminium windows, built to spec.</h1>
          <p className="mt-4 text-lg text-zinc-600">Domestic to high-performance systems, powder coated or anodised, glazed to SANS 10400 & 10137 guidelines. Configure online — we’ll price and fabricate.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={()=>navigate("/builder")} className="px-5 py-3 rounded-2xl bg-zinc-900 text-white">Start Spec Builder</button>
            <button onClick={()=>navigate("/products")} className="px-5 py-3 rounded-2xl border border-zinc-300">Browse Products</button>
          </div>
          <div className="mt-6 text-sm text-zinc-500">Lead times from 10–20 working days depending on finish and glazing.</div>
        </div>
        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
          <img src={IMAGES.edge42} alt="Thermally broken casement in charcoal" className="w-full h-full object-cover"/>
        </div>
      </section>

      <TrustBar />

      <section>
        <h2 className="text-2xl font-bold">Popular systems</h2>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CREALCO_SYSTEMS.slice(0,6).map(s=> <SystemCard key={s.code} system={s} />)}
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-white p-8 md:p-12 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-3xl font-bold">Spec with confidence</h3>
          <ul className="mt-4 space-y-2 text-zinc-100 list-disc list-inside">
            <li>Crealco systems & genuine Wispeco profiles</li>
            <li>Glazing options incl. laminated, Low‑E & DGU</li>
            <li>Marine-grade hardware & coastal sealants</li>
            <li>Installations to best-practice guidelines</li>
          </ul>
        </div>
        <div className="rounded-2xl overflow-hidden">
          <img src={IMAGES.elite} alt="Sliding window" className="w-full h-full object-cover" />
        </div>
      </section>
    </div>
  );
}

function TrustBar(){
  const items = [
    { title: "SANS-aligned", text: "Glazing & wind load checks inline with local standards." },
    { title: "Site-measured", text: "We verify openings before fabrication." },
    { title: "Warranty-backed", text: "Finish & workmanship warranties available." },
    { title: "Nationwide", text: "Install teams across major metros." },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((x,i)=> (
        <div key={i} className="rounded-2xl border border-zinc-200 p-4 bg-white">
          <div className="font-semibold">{x.title}</div>
          <div className="text-sm text-zinc-600">{x.text}</div>
        </div>
      ))}
    </div>
  );
}

function SystemCard({ system }){
  return (
    <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-white flex flex-col">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={system.image} alt={system.name} className="w-full h-full object-cover"/>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="font-semibold">{system.name}</div>
        <div className="text-sm text-zinc-600">{system.type} {system.depth_mm? `• ${system.depth_mm}mm`: ""}</div>
        <div className="mt-4 flex gap-2">
          <a href="/builder" className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-sm">Configure</a>
          <a href="/products" className="px-3 py-1.5 rounded-xl border border-zinc-300 text-sm">Details</a>
        </div>
      </div>
    </div>
  );
}

function Products(){
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const filtered = CREALCO_SYSTEMS.filter(s =>
    (type === "all" || s.type.toLowerCase().includes(type)) &&
    (query.trim() === "" || s.name.toLowerCase().includes(query.trim().toLowerCase()))
  );
  return (
    <div>
      <h1 className="text-3xl font-bold">Crealco systems</h1>
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name (e.g. Swift 38, Clip 44)" className="px-4 py-2 rounded-xl border border-zinc-300 flex-1"/>
        <select value={type} onChange={e=>setType(e.target.value)} className="px-4 py-2 rounded-xl border border-zinc-300">
          <option value="all">All types</option>
          <option value="sliding">Sliding Window</option>
          <option value="casement">Casement</option>
          <option value="pivot">Pivot</option>
          <option value="tilt">Tilt & Turn</option>
          <option value="vertical">Vertical Sliding</option>
          <option value="shopfront">Shopfront</option>
        </select>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(s=> <SystemCard key={s.code} system={s} />)}
      </div>

      <div className="mt-10 text-sm text-zinc-600 max-w-3xl">
        <p>Notes: Actual profile selection, mullion sizing, maximum sash sizes, and performance ratings depend on opening sizes, wind loads, glazing mass and hardware selection. We confirm all specs during technical review and site measure.</p>
      </div>
    </div>
  );
}

function Builder(){
  const { addItem } = useOrder();
  const [form, setForm] = useState({
    system: "SWIFT38",
    sashType: "top-hung",
    width: "", height: "",
    quantity: 1,
    glazing: "4mm Float",
    finish: "Powder Coat White",
    hardware: "Standard",
    transom: "None",
    notes: "",
    location: "",
  });
  const system = CREALCO_SYSTEMS.find(x=>x.code===form.system);

  const update = (k,v)=> setForm(prev=> ({...prev, [k]: v}));
  const add = ()=>{
    if(!form.width || !form.height) { alert("Please enter dimensions"); return; }
    addItem({...form, systemName: system?.name});
    setForm(f=>({...f, width:"", height:"", quantity:1, notes:""}));
    alert("Added to order");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <h1 className="text-3xl font-bold">Spec builder</h1>
        <p className="text-zinc-600 mt-1">Create line items for your order. We’ll verify span limits and hardware during review.</p>

        <div className="mt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Select label="System" value={form.system} onChange={v=>update("system", v)} options={CREALCO_SYSTEMS.map(x=>({value:x.code, label:x.name}))} />
            <Select label="Sash/Configuration" value={form.sashType} onChange={v=>update("sashType", v)} options={SASH_TYPES.map(x=>({value:x.key, label:x.label}))} />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Input label="Width (mm)" value={form.width} onChange={v=>update("width", v.replace(/[^0-9]/g, ""))} />
            <Input label="Height (mm)" value={form.height} onChange={v=>update("height", v.replace(/[^0-9]/g, ""))} />
            <Input label="Quantity" value={form.quantity} onChange={v=>update("quantity", Number(v)||1)} />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Select label="Glazing" value={form.glazing} onChange={v=>update("glazing", v)} options={GLAZING.map(x=>({value:x, label:x}))} />
            <Select label="Finish" value={form.finish} onChange={v=>update("finish", v)} options={FINISHES.map(x=>({value:x, label:x}))} />
            <Select label="Hardware" value={form.hardware} onChange={v=>update("hardware", v)} options={HARDWARE.map(x=>({value:x, label:x}))} />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Select label="Transom/Mullion" value={form.transom} onChange={v=>update("transom", v)} options={["None","Mid-rail","T-bar","Coupled"].map(x=>({value:x, label:x}))} />
            <Input label="Location/Room" value={form.location} onChange={v=>update("location", v)} />
            <Input label="Notes" value={form.notes} onChange={v=>update("notes", v)} />
          </div>

          <div className="rounded-2xl bg-white border border-zinc-200 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 font-medium">Preview</div>
            <div className="p-4 grid gap-6 md:grid-cols-2">
              <div>
                <img src={system?.image} alt={system?.name} className="rounded-xl w-full aspect-video object-cover"/>
              </div>
              <div className="text-sm text-zinc-700 space-y-1">
                <Detail label="System" value={system?.name} />
                <Detail label="Config" value={SASH_TYPES.find(x=>x.key===form.sashType)?.label} />
                <Detail label="Size" value={`${form.width || "—"} x ${form.height || "—"} mm`} />
                <Detail label="Glazing" value={form.glazing} />
                <Detail label="Finish" value={form.finish} />
                <Detail label="Hardware" value={form.hardware} />
                <Detail label="Qty" value={String(form.quantity)} />
                <Detail label="Transom/Mullion" value={form.transom} />
                <Detail label="Location" value={form.location || "—"} />
                <Detail label="Notes" value={form.notes || "—"} />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={add} className="px-5 py-3 rounded-2xl bg-zinc-900 text-white">Add to Order</button>
            <a href="/order" className="px-5 py-3 rounded-2xl border border-zinc-300">Review Order</a>
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 h-max">
        <Tips />
      </div>
    </div>
  );
}

function Tips(){
  const tips = [
    "Measure structural opening (brick-to-brick) to the nearest millimetre.",
    "State inside/outside, handing and stack direction for sliders.",
    "Consider ventilation: add trickle vents or fixed louvres if required.",
    "Coastal? Prefer anodised or high-spec powder coat with marine hardware.",
  ];
  return (
    <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
      <div className="font-semibold">Spec tips</div>
      <ul className="mt-2 list-disc list-inside text-sm text-zinc-600 space-y-1">
        {tips.map((t,i)=>(<li key={i}>{t}</li>))}
      </ul>
    </div>
  );
}

function Detail({label, value}){
  return (
    <div className="grid grid-cols-[120px,1fr] gap-2"><div className="text-zinc-500">{label}</div><div>{value}</div></div>
  );
}

function Input({label, value, onChange, placeholder}){
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-zinc-600">{label}</span>
      <input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} className="px-4 py-2 rounded-xl border border-zinc-300" />
    </label>
  );
}

function Select({label, value, onChange, options}){
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-zinc-600">{label}</span>
      <select value={value} onChange={(e)=>onChange(e.target.value)} className="px-4 py-2 rounded-xl border border-zinc-300">
        {options.map(opt => <option key={opt.value||opt} value={opt.value||opt}>{opt.label||opt}</option>)}
      </select>
    </label>
  );
}

function Order(){
  const { items, removeItem, clearOrder, customer, setCustomer } = useOrder();

  const csv = useMemo(()=>{
    const head = ["System","Config","Width(mm)","Height(mm)","Qty","Glazing","Finish","Hardware","Transom","Location","Notes"];
    const rows = items.map(x=>[
      x.systemName, x.sashType, x.width, x.height, x.quantity, x.glazing, x.finish, x.hardware, x.transom, x.location, JSON.stringify(x.notes||"")
    ]);
    return [head, ...rows].map(r=>r.join(",")).join("\n");
  },[items]);

  const download = (filename, content, type="text/csv")=>{
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const mailto = useMemo(()=>{
    const subject = encodeURIComponent(`WINDOW ORDER — ${customer.name||"Client"}`);
    const body = encodeURIComponent([
      `Name: ${customer.name}`,
      `Company: ${customer.company}`,
      `Email: ${customer.email}`,
      `Phone: ${customer.phone}`,
      `Site: ${customer.siteAddress}`,
      `Notes: ${customer.notes}`,
      "",
      "Order lines:",
      ...items.map((x,i)=> `${i+1}. ${x.quantity} x ${x.systemName} ${x.width}x${x.height}mm (${x.sashType}) — ${x.glazing}, ${x.finish}, ${x.hardware}${x.transom!=="None"? ", "+x.transom: ""}${x.location? ", room: "+x.location: ""}${x.notes? " — "+x.notes: ""}`)
    ].join("\n"));
    return `mailto:sales@yourfabricator.co.za?subject=${subject}&body=${body}`;
  },[items, customer]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your order</h1>

      {items.length===0 ? (
        <div className="rounded-2xl border border-zinc-200 p-6 bg-white">
          <div className="text-zinc-600">No line items yet. Use the <a href="/builder" className="underline">Spec Builder</a> to add items.</div>
        </div>
      ):(
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50">
              <tr className="text-left">
                {"# System Config Size Qty Glazing Finish Hardware Transom Location Notes".split(" ").map((h,i)=>(<th key={i} className="px-3 py-2 font-medium">{h}</th>))}
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((x,i)=> (
                <tr key={x.id} className="border-t border-zinc-100">
                  <td className="px-3 py-2">{i+1}</td>
                  <td className="px-3 py-2">{x.systemName}</td>
                  <td className="px-3 py-2">{x.sashType}</td>
                  <td className="px-3 py-2">{x.width}×{x.height}mm</td>
                  <td className="px-3 py-2">{x.quantity}</td>
                  <td className="px-3 py-2">{x.glazing}</td>
                  <td className="px-3 py-2">{x.finish}</td>
                  <td className="px-3 py-2">{x.hardware}</td>
                  <td className="px-3 py-2">{x.transom}</td>
                  <td className="px-3 py-2">{x.location}</td>
                  <td className="px-3 py-2 max-w-[240px] truncate" title={x.notes}>{x.notes}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={()=>removeItem(x.id)} className="px-3 py-1.5 rounded-xl border border-zinc-300">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="grid lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
          <div className="font-semibold">Customer & site details</div>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <Input label="Full name" value={customer.name} onChange={v=>setCustomer({...customer, name:v})} />
            <Input label="Company (optional)" value={customer.company} onChange={v=>setCustomer({...customer, company:v})} />
            <Input label="Email" value={customer.email} onChange={v=>setCustomer({...customer, email:v})} />
            <Input label="Phone" value={customer.phone} onChange={v=>setCustomer({...customer, phone:v})} />
            <Input label="Site address" value={customer.siteAddress} onChange={v=>setCustomer({...customer, siteAddress:v})} />
            <Input label="Notes" value={customer.notes} onChange={v=>setCustomer({...customer, notes:v})} />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-5 bg-white h-max">
          <div className="font-semibold">Export & submit</div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button onClick={()=>download("order.csv", csv)} className="px-4 py-2 rounded-xl border border-zinc-300">Download CSV</button>
            <button onClick={()=>window.print()} className="px-4 py-2 rounded-xl border border-zinc-300">Print / Save PDF</button>
            <a href={mailto} className="px-4 py-2 rounded-xl bg-zinc-900 text-white">Email Order</a>
            <button onClick={clearOrder} className="px-4 py-2 rounded-xl border border-red-300 text-red-600">Clear</button>
          </div>
          <div className="text-xs text-zinc-500 mt-3">No prices shown online. We’ll reply with a formal quote & lead time.</div>
        </div>
      </section>
    </div>
  );
}

function Gallery(){
  const imgs = [IMAGES.elite, IMAGES.slenderline500, IMAGES.swift38, IMAGES.edge42, IMAGES.vert70, IMAGES.clip44];
  return (
    <div>
      <h1 className="text-3xl font-bold">Gallery</h1>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {imgs.map((src,i)=>(
          <div key={i} className="rounded-2xl overflow-hidden border border-zinc-200 aspect-[4/3]">
            <img src={src} alt="Project" className="w-full h-full object-cover"/>
          </div>
        ))}
      </div>
    </div>
  );
}

function Compliance(){
  const bullets = [
    "Fabrication from genuine Wispeco/Crealco profiles only.",
    "Joint sealing with compatible silicone; we ensure all mechanical joints are sealed.",
    "Installation, cleaning and maintenance as per manufacturer guidance.",
    "Performance certificates and manuals available on request for each system.",
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Compliance & care</h1>
      <p className="text-zinc-600 max-w-3xl">We adhere to manufacturer manuals during fabrication and installation and align glazing to SANS guidelines. After installation we provide cleaning & maintenance guidance to maximise lifespan, particularly in coastal environments.</p>
      <ul className="list-disc list-inside space-y-1 text-zinc-700">
        {bullets.map((b,i)=>(<li key={i}>{b}</li>))}
      </ul>
      <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
        <div className="font-semibold">Available documents</div>
        <ul className="mt-2 text-sm list-disc list-inside text-zinc-700">
          <li>Product manuals per system (e.g. Swift™ 38, Edge™ Thermal Break, 4500 series)</li>
          <li>Installation, Cleaning & Maintenance guidelines</li>
          <li>Performance certificates and wall charts</li>
        </ul>
      </div>
    </div>
  );
}

function FAQ(){
  const faqs = [
    { q: "How are orders priced?", a: "Submit your specs; a technician reviews spans, hardware, finish and glazing, then we reply with a formal quote." },
    { q: "Lead time?", a: "Typically 10–20 working days after deposit and site measure. Anodise colours or DGUs may extend this." },
    { q: "Do you install?", a: "Yes. Our trained teams install to best-practice, including perimeter sealing and setting blocks as per glazing standards." },
    { q: "Do you work with architects?", a: "Absolutely. We share CAD blocks on request and coordinate details early." },
  ];
  return (
    <div>
      <h1 className="text-3xl font-bold">FAQs</h1>
      <div className="mt-4 grid gap-4">
        {faqs.map((f,i)=> (
          <details key={i} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <summary className="font-medium cursor-pointer">{f.q}</summary>
            <div className="text-zinc-700 mt-2">{f.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

function Contact(){
  const [msg, setMsg] = useState({ name:"", email:"", phone:"", message:"" });
  const submit = (e)=>{ e.preventDefault(); alert("Thanks! We’ll get back to you."); setMsg({name:"",email:"",phone:"",message:""}); };
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-3xl font-bold">Contact</h1>
        <p className="text-zinc-600 mt-1">Send a message or call us to discuss your project. We can meet on site or assist off plan.</p>
        <div className="mt-6 space-y-2 text-zinc-700">
          <div><span className="font-medium">Phone:</span> +27 (0) 61 193 3931</div>
          <div><span className="font-medium">Email:</span> info@modahaus.co.za</div>
          <div><span className="font-medium">Hours:</span> Mon–Sun 08:00–17:00</div>
        </div>
      </div>
      <form onSubmit={submit} className="rounded-2xl border border-zinc-200 p-5 bg-white">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Full name" value={msg.name} onChange={v=>setMsg({...msg, name:v})} />
          <Input label="Email" value={msg.email} onChange={v=>setMsg({...msg, email:v})} />
          <Input label="Phone" value={msg.phone} onChange={v=>setMsg({...msg, phone:v})} />
        </div>
        <label className="flex flex-col gap-1 mt-3">
          <span className="text-sm text-zinc-600">Message</span>
          <textarea value={msg.message} onChange={e=>setMsg({...msg, message:e.target.value})} className="px-4 py-2 rounded-xl border border-zinc-300 min-h-[120px]"/>
        </label>
        <div className="mt-4"><button className="px-5 py-3 rounded-2xl bg-zinc-900 text-white">Send</button></div>
      </form>
    </div>
  );
}

// ---------- App ----------
function App(){
  return (
    <BrowserRouter>
      <OrderProvider>
        <Shell>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/products" element={<Products/>} />
            <Route path="/builder" element={<Builder/>} />
            <Route path="/order" element={<Order/>} />
            <Route path="/gallery" element={<Gallery/>} />
            <Route path="/compliance" element={<Compliance/>} />
            <Route path="/faq" element={<FAQ/>} />
            <Route path="/contact" element={<Contact/>} />
          </Routes>
        </Shell>
      </OrderProvider>
    </BrowserRouter>
  );
}

export default App;

// If you want to render directly in a plain HTML page, uncomment below:
// const root = createRoot(document.getElementById("root"));
// root.render(<App />);
