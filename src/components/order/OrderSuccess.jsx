import React from "react";

export default function OrderSuccess({ orderId }) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold">Order Placed</h1>
      <p className="text-zinc-600">
        Your order <b>{orderId}</b> has been received and is awaiting payment.
      </p>
      <p className="text-zinc-600">
        Please make payment via <b>EFT within 72 hours</b> using your order number as reference.
      </p>

      <div className="rounded-2xl border border-zinc-200 p-6 bg-white text-left inline-block mt-4">
        <h2 className="font-semibold mb-2">Bank Details</h2>
        <div className="text-sm leading-relaxed text-zinc-700">
          <div><b>Account Name:</b> Modahaus (Pty) Ltd</div>
          <div><b>Bank:</b> Standard Bank</div>
          <div><b>Account Number:</b> 10256640074</div>
          <div><b>Branch Code:</b> 4906</div>
          <div><b>SWIFT Code:</b> SBZAZAJJ</div>
          <div><b>Reference:</b> {orderId}</div>
        </div>
      </div>

      <a
        href="/products"
        className="inline-block mt-6 px-6 py-3 rounded-2xl bg-zinc-900 text-white"
      >
        Back to Shop
      </a>
    </div>
  );
}