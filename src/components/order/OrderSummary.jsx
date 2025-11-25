import React from "react";

export default function OrderSummary({ total, shipping, grandTotal, onCheckout, isSending }) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-5 bg-white h-max">
      <div className="font-semibold mb-3">Next Step</div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-zinc-600">
          <span>Subtotal:</span>
          <span>R {total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-600">
          <span>Shipping:</span>
          <span>R {shipping.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-1">
          <span>Total:</span>
          <span>R {grandTotal.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={isSending}
        className="w-full mt-4 px-4 py-3 rounded-xl bg-zinc-900 text-white font-medium disabled:bg-zinc-400"
      >
        {isSending ? "Placing Order..." : "Proceed to Checkout (EFT)"}
      </button>

      <p className="text-xs text-zinc-500 mt-3">
        Shipping will be quoted once address is confirmed. Orders ship from Midrand Warehouse after payment.
      </p>
    </div>
  );
}