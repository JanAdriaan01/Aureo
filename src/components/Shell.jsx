// src/components/Shell.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useOrder } from "./OrderContext";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function Shell({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const { items } = useOrder();
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-zinc-200">
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
        <button
          onClick={() => navigate("/order")}
          className="ml-auto px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-sm"
        >
          Order ({items.length})
        </button>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <img src="/images/logo.png" alt="Aureo" className="w-10 h-10 object-contain" />
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
      to={to}
      className={({ isActive }) =>
        classNames(
          "px-3 py-1.5 rounded-xl hover:bg-zinc-100",
          isActive && "bg-zinc-900 text-white hover:bg-zinc-900"
        )
      }
    >
      {children}
    </NavLink>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <Logo />
          <p className="mt-3 text-zinc-600">
            Aluminium windows and doors — designed, fabricated, and shipped
            nationwide from our Midrand facility.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-2">Quick links</div>
          <ul className="space-y-1">
            <li><NavLink to="/products">Products</NavLink></li>
            <li><NavLink to="/order">Order</NavLink></li>
            <li><NavLink to="/compliance">Compliance</NavLink></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <div className="text-zinc-600">Midrand, Johannesburg</div>
          <div className="text-zinc-600">+27 (0) 61 193 3931</div>
          <div className="text-zinc-600">info@modahaus.co.za</div>
        </div>
      </div>
    </footer>
  );
}