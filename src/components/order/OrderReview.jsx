import React from "react";

export default function OrderReview({ items, removeItem }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 p-6 bg-white text-center">
        <div className="text-zinc-600">
          No line items yet. Visit{" "}
          <a href="/products" className="underline">
            Products
          </a>{" "}
          to add windows.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr className="text-left">
              {"# System Size Qty Glazing Finish UnitPrice Total".split(" ").map((h, i) => (
                <th key={i} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((x, i) => (
              <tr key={x.id || i} className="border-t border-zinc-100">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2">{x.systemName}</td>
                <td className="px-3 py-2">{x.size || "—"}</td>
                <td className="px-3 py-2">{x.quantity}</td>
                <td className="px-3 py-2">{x.glazing || "—"}</td>
                <td className="px-3 py-2">{x.finish || "—"}</td>
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
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {items.map((x, i) => (
          <div
            key={x.id || i}
            className="border rounded-2xl p-4 bg-white flex flex-col space-y-2"
          >
            <div className="font-semibold">{x.systemName}</div>
            <div className="text-sm text-zinc-600">
              Size: {x.size || "—"}, Qty: {x.quantity}, Glazing: {x.glazing || "—"}, Finish: {x.finish || "—"}
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="font-semibold">R {x.subtotal.toLocaleString()}</div>
              <button
                onClick={() => removeItem(x.id)}
                className="px-3 py-1 rounded-xl border border-zinc-300 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}