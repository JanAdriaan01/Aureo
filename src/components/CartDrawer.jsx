// src/components/CartDrawer.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "../context/OrderContext";

export default function CartDrawer() {
  const { items } = useOrder();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Open when "cart:open" event is dispatched
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("cart:open", handler);
    return () => window.removeEventListener("cart:open", handler);
  }, []);

  // Defensive numeric conversions
  const itemCount = items.reduce((sum, x) => sum + (Number(x.quantity) || 0), 0);
  const subtotal = items.reduce((sum, x) => sum + (Number(x.subtotal) || 0), 0);

  return (
    <>
      {/* Handle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed top-1/2 -translate-y-1/2 right-0 z-40 rounded-l-2xl px-3 py-2 text-xs bg-zinc-900 text-white shadow-lg"
      >
        Cart ({itemCount})
      </button>

      {/* Drawer */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />

          <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
              <div>
                <div className="text-sm font-semibold">Order Summary</div>
                <div className="text-xs text-zinc-500">
                  {itemCount === 0 ? "No items yet" : `${itemCount} item${itemCount !== 1 ? "s" : ""} in order`}
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-500 hover:text-zinc-800">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.length === 0 ? (
                <div className="text-sm text-zinc-500">Your order is empty. Add a product to see it here.</div>
              ) : (
                items.map((x) => {
                  const key = x.id || `${x.system || "sys"}-${x.size || "size"}-${x.timestamp || Math.random()}`;
                  const qty = Number(x.quantity) || 0;
                  const lineSubtotal = Number(x.subtotal) || 0;
                  const unitPrice = Number(x.price) || 0;

                  return (
                    <div key={key} className="border border-zinc-200 rounded-xl p-3 text-xs">
                      <div className="font-semibold text-zinc-800">{x.systemName || x.system || "Item"}</div>
                      <div className="text-zinc-500">Size: {x.size || "—"} · Qty: {qty}</div>
                      <div className="text-zinc-500">{x.glazing || "—"} · {x.finish || "—"}</div>
                      <div className="mt-1 font-semibold text-zinc-900">R {lineSubtotal.toLocaleString()}</div>
                      <div className="text-[11px] text-zinc-500 mt-1">Unit: R {unitPrice.toLocaleString()}</div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-zinc-200 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Subtotal</span>
                <span className="font-semibold">R {subtotal.toLocaleString()}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/order");
                }}
                className="w-full mt-1 px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-medium"
              >
                Review & Place Order
              </button>

              <p className="text-[11px] text-zinc-500">
                Customer details & payment instructions will be captured on the order page.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}