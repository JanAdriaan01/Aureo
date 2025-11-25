// src/components/order/Order.jsx
import React, { useState, useMemo } from "react";
import { useOrder } from "../../context/OrderContext";
import OrderReview from "./OrderReview";
import CustomerForm from "./CustomerForm";
import OrderSummary from "./OrderSummary";
import OrderSuccess from "./OrderSuccess";

export default function Order() {
  const ctx = useOrder();
  if (!ctx) {
    return (
      <div className="text-center text-zinc-600 py-20">Loading order context...</div>
    );
  }

  const { items, removeItem, clearOrder, customer, setCustomer } = ctx;

  // Stages: review -> confirm -> success
  const [stage, setStage] = useState("review");
  const [orderId, setOrderId] = useState("");
  const [shipping, setShipping] = useState(0);
  const [customerErrors, setCustomerErrors] = useState({});
  const [isSending, setIsSending] = useState(false);

  // defensive totals
  const total = useMemo(
    () => items.reduce((sum, x) => sum + Number(x.subtotal || 0), 0),
    [items]
  );
  const grandTotal = Number(total || 0) + Number(shipping || 0);

  // Determine whether the order has valid items:
  // - at least one item
  // - each item quantity > 0
  // - total > 0
  const hasValidItems = useMemo(() => {
    if (!items || items.length === 0) return false;
    if (Number(total || 0) <= 0) return false;
    for (const it of items) {
      if (Number(it.quantity || 0) <= 0) return false;
      if (Number(it.subtotal || 0) <= 0) return false;
    }
    return true;
  }, [items, total]);

  // Validate customer object with address fields used in CustomerForm
  const validateCustomer = (cust) => {
    const errors = [];
    if (!cust?.name?.trim()) errors.push("Full name is required");
    if (!cust?.email?.trim()) errors.push("Email is required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cust.email)) errors.push("Valid email is required");
    if (!cust?.phone?.trim()) errors.push("Phone number is required");
    if (!cust?.street?.trim()) errors.push("Street address is required");
    if (!cust?.city?.trim()) errors.push("City is required");
    if (!cust?.postal?.trim()) errors.push("Postal code is required");
    if (!cust?.country?.trim()) errors.push("Country is required");
    return { isValid: errors.length === 0, errors };
  };

  const validateField = (field, value) => {
    const errors = { ...customerErrors };
    if (!String(value || "").trim()) errors[field] = `${field} is required`;
    else delete errors[field];
    setCustomerErrors(errors);
  };

  // Proceed to confirm (validate customer)
  const handleCheckout = () => {
    const validation = validateCustomer(customer || {});
    if (!validation.isValid) {
      alert(`Please fix the following errors:\n\n• ${validation.errors.join("\n• ")}`);
      return;
    }
    const id = `ORD-${Date.now().toString().slice(-6)}`;
    setOrderId(id);
    setStage("confirm");
  };

  // Send email + finalize order
  const confirmPayment = async () => {
    // Do not allow placing order if items invalid - defensive check.
    if (!hasValidItems) {
      alert("Cannot place order: cart is empty or contains invalid items (zero quantity or zero value).");
      return;
    }

    const id = orderId || `ORD-${Date.now().toString().slice(-6)}`;
    if (!orderId) setOrderId(id);

    const lines = items.map((x, i) => {
      const qty = Number(x.quantity || 0);
      const subtotal = Number(x.subtotal || 0);
      return `${i + 1}. ${x.systemName || x.system || "Item"} (${x.size || ""}) × ${qty}
 - Glazing: ${x.glazing || "—"}
 - Finish: ${x.finish || "—"}
 - Line total: R ${subtotal.toLocaleString()}`;
    });

    const bankingDetails = `
Bank Details:
- Account Name: Modahaus (Pty) Ltd
- Bank: Standard Bank
- Account Number: 10256640074
- Branch Code: 4906
- SWIFT Code: SBZAZAJJ
- Reference: ${id}
`.trim();

    const message = `
Dear ${customer?.name || "Customer"},

Thank you for placing your order with Modahaus.

Order Number: ${id}
Date: ${new Date().toLocaleString()}

Customer Details:
- Name: ${customer?.name || ""}
- Email: ${customer?.email || ""}
- Phone: ${customer?.phone || ""}
- Address: ${[customer?.street, customer?.city, customer?.postal, customer?.country].filter(Boolean).join(", ")}

Order Items:
${lines.join("\n\n")}

Subtotal: R ${total.toLocaleString()}
Shipping: R ${Number(shipping || 0).toLocaleString()}
Total: R ${grandTotal.toLocaleString()}

${bankingDetails}

Please make payment via EFT within 72 hours using your order number as reference.
`.trim();

    try {
      setIsSending(true);
      const res = await fetch("https://modahaus-backend.vercel.app/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customer?.name,
          email: customer?.email,
          subject: `Modahaus Order ${id}`,
          message,
        }),
      });

      if (!res.ok) {
        console.error("Email send failed:", await res.text());
        // proceed anyway
      }
    } catch (err) {
      console.error("Error sending order email:", err);
      // proceed anyway
    } finally {
      setIsSending(false);
      setStage("success");
      clearOrder();
    }
  };

  // Success view: keep banking details visible
  if (stage === "success") {
    return <OrderSuccess orderId={orderId} />;
  }

  // Confirm view (summary + place order) — NO remove buttons, includes Back button
  if (stage === "confirm") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Confirm Order</h1>
          <button
            onClick={() => setStage("review")}
            className="px-3 py-2 rounded-md border text-sm"
          >
            ← Back to Order
          </button>
        </div>

        <p className="text-zinc-600">
          Please confirm your order details below. Shipping will be added based on your address.
        </p>

        <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
          <h2 className="font-semibold mb-2">Customer</h2>
          <div className="text-sm text-zinc-700">
            {customer?.name}, {customer?.email}, {customer?.phone}
            <br />
            {[customer?.street, customer?.city, customer?.postal, customer?.country].filter(Boolean).join(", ")}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
          <h2 className="font-semibold mb-2">Order Items</h2>

          {/* Desktop: table without Remove column */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50">
                <tr className="text-left">
                  {"# System Size Qty Glazing Finish UnitPrice Total".split(" ").map((h, i) => (
                    <th key={i} className="px-3 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((x, i) => {
                  const qty = Number(x.quantity || 0);
                  const unitPrice = Number(x.price || 0);
                  const lineSubtotal = Number(x.subtotal || 0);
                  return (
                    <tr key={x.id || `${i}-${x.system || "sys"}`} className="border-t border-zinc-100">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{x.systemName}</td>
                      <td className="px-3 py-2">{x.size || "—"}</td>
                      <td className="px-3 py-2">{qty}</td>
                      <td className="px-3 py-2">{x.glazing || "—"}</td>
                      <td className="px-3 py-2">{x.finish || "—"}</td>
                      <td className="px-3 py-2">R {unitPrice.toLocaleString()}</td>
                      <td className="px-3 py-2">R {lineSubtotal.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards without remove buttons */}
          <div className="md:hidden space-y-4 mt-4">
            {items.map((x, i) => {
              const qty = Number(x.quantity || 0);
              const unitPrice = Number(x.price || 0);
              const lineSubtotal = Number(x.subtotal || 0);
              return (
                <div key={x.id || `${i}-${x.system || "sys"}`} className="p-4 border rounded-lg bg-white">
                  <div className="font-semibold">{x.systemName}</div>
                  <div className="flex justify-between mt-1"><span>Size</span><span>{x.size || "—"}</span></div>
                  <div className="flex justify-between mt-1"><span>Qty</span><span>{qty}</span></div>
                  <div className="flex justify-between mt-1"><span>Glazing</span><span>{x.glazing || "—"}</span></div>
                  <div className="flex justify-between mt-1"><span>Finish</span><span>{x.finish || "—"}</span></div>
                  <div className="flex justify-between mt-1 font-semibold"><span>Subtotal</span><span>R {lineSubtotal.toLocaleString()}</span></div>
                </div>
              );
            })}
          </div>

          <div className="text-right text-xl font-bold mt-4">Total: R {grandTotal.toLocaleString()}</div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setStage("review")}
            className="px-4 py-2 rounded-xl border"
          >
            Edit Order
          </button>

          <button
            onClick={confirmPayment}
            disabled={!hasValidItems || isSending}
            className="px-6 py-3 rounded-2xl bg-zinc-900 text-white disabled:bg-zinc-400"
          >
            {isSending ? "Placing Order..." : "Place Order & Show EFT Details"}
          </button>
        </div>
      </div>
    );
  }

  // REVIEW stage (default) — desktop table preserved, mobile stacked cards used
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Order</h1>

      <OrderReview items={items} removeItem={removeItem} />

      <section className="grid lg:grid-cols-2 gap-6">
        <CustomerForm
          customer={customer || {}}
          setCustomer={(c) => setCustomer({ ...customer, ...c })}
          errors={customerErrors}
          validateField={validateField}
        />

        <OrderSummary
          total={total}
          shipping={shipping}
          grandTotal={grandTotal}
          onCheckout={handleCheckout}
          isSending={isSending}
        />
      </section>
    </div>
  );
}