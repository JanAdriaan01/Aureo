// src/components/order/Order.jsx
import { useState } from "react";
import { useOrder } from "../../context/OrderContext";
import Input from "../ui/Input";

export default function Order() {
  const ctx = useOrder();
  if (!ctx)
    return (
      <div className="text-center text-zinc-600 py-20">
        Loading order context...
      </div>
    );

  const { items, removeItem, clearOrder, customer, setCustomer } = ctx;
  const [stage, setStage] = useState("review");
  const [orderId, setOrderId] = useState("");
  const [shipping, setShipping] = useState(0);
  const [customerErrors, setCustomerErrors] = useState({});
  const [isSending, setIsSending] = useState(false);

  const total = items.reduce((sum, x) => sum + Number(x.subtotal || 0), 0);
  const grandTotal = total + Number(shipping || 0);

  const validateCustomer = (cust) => {
    const errors = [];
    if (!cust.name?.trim()) errors.push("Full name is required");
    if (!cust.email?.trim()) errors.push("Email is required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cust.email)) errors.push("Valid email required");
    if (!cust.phone?.trim()) errors.push("Phone is required");
    if (!cust.address?.trim()) errors.push("Street Address is required");
    if (!cust.city?.trim()) errors.push("City is required");
    if (!cust.postalCode?.trim()) errors.push("Postal Code is required");
    if (!cust.country?.trim()) errors.push("Country is required");
    return { isValid: errors.length === 0, errors };
  };

  const validateField = (field, value) => {
    const errors = { ...customerErrors };
    if (!value.trim()) errors[field] = `${field} is required`;
    else delete errors[field];
    setCustomerErrors(errors);
  };

  const handleCheckout = () => {
    const validation = validateCustomer(customer);
    if (!validation.isValid) {
      alert(`Please fix the following errors:\n• ${validation.errors.join("\n• ")}`);
      return;
    }
    setOrderId(`ORD-${Date.now().toString().slice(-6)}`);
    setStage("confirm");
  };

  const confirmPayment = async () => {
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
`;

    const message = `
Dear ${customer.name || "Customer"},

Thank you for placing your order with Modahaus.

Order Number: ${id}
Date: ${new Date().toLocaleString()}

Customer Details:
- Name: ${customer.name}
- Email: ${customer.email}
- Phone: ${customer.phone}
- Address: ${customer.address}, ${customer.city}, ${customer.postalCode}, ${customer.country}

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
      await fetch("https://modahaus-backend.vercel.app/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customer.name,
          email: customer.email,
          subject: `Modahaus Order ${id}`,
          message,
        }),
      });
    } catch (err) {
      console.error(err);
      alert("Order placed, but email failed.");
    } finally {
      setIsSending(false);
      setStage("success");
      clearOrder();
    }
  };

  // ---------- SUCCESS ----------
  if (stage === "success") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold">Order Placed</h1>
        <p className="text-zinc-600">Your order <b>{orderId}</b> has been received and is awaiting payment.</p>
        <p className="text-zinc-600">Please make payment via <b>EFT within 72 hours</b>.</p>
        <a href="/products" className="inline-block mt-6 px-6 py-3 rounded-2xl bg-zinc-900 text-white">Back to Shop</a>
      </div>
    );
  }

  // ---------- CONFIRM ----------
  if (stage === "confirm") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Confirm Order</h1>

        <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
          <h2 className="font-semibold mb-2">Customer</h2>
          <div className="text-sm text-zinc-700">
            {customer.name}, {customer.email}, {customer.phone}
            <br />
            {customer.address}, {customer.city}, {customer.postalCode}, {customer.country}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
          <h2 className="font-semibold mb-2">Order Items</h2>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50">
                <tr className="text-left">
                  {"# System Size Qty Glazing Finish UnitPrice Total".split(" ").map((h, i) => (
                    <th key={i} className="px-3 py-2 font-medium">{h}</th>
                  ))}
                  <th className="px-3 py-2"></th>
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
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => removeItem(x.id)} className="px-3 py-1.5 rounded-xl border border-zinc-300">Remove</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="text-right text-xl font-bold mt-4 p-4">Total: R {grandTotal.toLocaleString()}</div>
          </div>

          {/* Mobile stacked */}
          <div className="md:hidden space-y-4 mt-4">
            {items.map((x, i) => {
              const qty = Number(x.quantity || 0);
              const unitPrice = Number(x.price || 0);
              const lineSubtotal = Number(x.subtotal || 0);
              return (
                <div key={x.id || `${i}-${x.system || "sys"}`} className="p-4 border rounded-lg bg-white shadow">
                  <div className="font-semibold">{x.systemName}</div>
                  <div className="flex justify-between mt-1"><span>Size</span><span>{x.size || "—"}</span></div>
                  <div className="flex justify-between mt-1"><span>Qty</span><span>{qty}</span></div>
                  <div className="flex justify-between mt-1"><span>Glazing</span><span>{x.glazing || "—"}</span></div>
                  <div className="flex justify-between mt-1"><span>Finish</span><span>{x.finish || "—"}</span></div>
                  <div className="flex justify-between mt-1 font-semibold"><span>Subtotal</span><span>R {lineSubtotal.toLocaleString()}</span></div>
                  <button onClick={() => removeItem(x.id)} className="mt-2 w-full px-2 py-1 bg-red-500 text-white rounded">Remove</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-right mt-4">
          <button onClick={confirmPayment} disabled={isSending} className="px-6 py-3 rounded-2xl bg-zinc-900 text-white disabled:bg-zinc-400">
            {isSending ? "Placing Order..." : "Place Order & Show EFT Details"}
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
        <div className="rounded-2xl border border-zinc-200 p-6 bg-white text-center text-zinc-600">
          No line items yet. Visit <a href="/products" className="underline">Products</a> to add windows.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50">
                <tr className="text-left">
                  {"# System Size Qty Glazing Finish UnitPrice Total".split(" ").map((h, i) => (
                    <th key={i} className="px-3 py-2 font-medium">{h}</th>
                  ))}
                  <th className="px-3 py-2"></th>
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
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => removeItem(x.id)} className="px-3 py-1.5 rounded-xl border border-zinc-300">Remove</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="text-right text-xl font-bold mt-4 p-4">Total: R {grandTotal.toLocaleString()}</div>
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-4">
            {items.map((x, i) => {
              const qty = Number(x.quantity || 0);
              const unitPrice = Number(x.price || 0);
              const lineSubtotal = Number(x.subtotal || 0);
              return (
                <div key={x.id || `${i}-${x.system || "sys"}`} className="p-4 border rounded-lg bg-white shadow">
                  <div className="font-semibold">{x.systemName}</div>
                  <div className="flex justify-between mt-1"><span>Size</span><span>{x.size || "—"}</span></div>
                  <div className="flex justify-between mt-1"><span>Qty</span><span>{qty}</span></div>
                  <div className="flex justify-between mt-1"><span>Glazing</span><span>{x.glazing || "—"}</span></div>
                  <div className="flex justify-between mt-1"><span>Finish</span><span>{x.finish || "—"}</span></div>
                  <div className="flex justify-between mt-1 font-semibold"><span>Subtotal</span><span>R {lineSubtotal.toLocaleString()}</span></div>
                  <button onClick={() => removeItem(x.id)} className="mt-2 w-full px-2 py-1 bg-red-500 text-white rounded">Remove</button>
                </div>
              );
            })}
          </div>

          {/* Customer / Checkout Form */}
          <section className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
              <div className="font-semibold mb-3">Customer Details</div>
              <div className="space-y-3">
                <Input label="Full Name" value={customer.name} onChange={v => { setCustomer({ ...customer, name: v }); validateField("name", v); }} required error={customerErrors.name} />
                <Input label="Email" value={customer.email} onChange={v => { setCustomer({ ...customer, email: v }); validateField("email", v); }} required error={customerErrors.email} />
                <Input label="Phone" value={customer.phone} onChange={v => { setCustomer({ ...customer, phone: v }); validateField("phone", v); }} required error={customerErrors.phone} />
                <Input label="Street Address" value={customer.address || ""} onChange={v => { setCustomer({ ...customer, address: v }); validateField("address", v); }} required error={customerErrors.address} />
                <Input label="City" value={customer.city || ""} onChange={v => { setCustomer({ ...customer, city: v }); validateField("city", v); }} required error={customerErrors.city} />
                <Input label="Postal Code" value={customer.postalCode || ""} onChange={v => { setCustomer({ ...customer, postalCode: v }); validateField("postalCode", v); }} required error={customerErrors.postalCode} />
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <select className="w-full px-3 py-2 border rounded" value={customer.country || "South Africa"} onChange={v => { setCustomer({ ...customer, country: v.target.value }); validateField("country", v.target.value); }}>
                    <option value="South Africa">South Africa</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-5 bg-white h-max">
              <div className="font-semibold mb-3">Next Step</div>
              <button onClick={handleCheckout} className="w-full px-4 py-3 rounded-xl bg-zinc-900 text-white font-medium">Proceed to Checkout (EFT)</button>
              <p className="text-xs text-zinc-500 mt-3">Shipping will be quoted once address is confirmed and order is placed. Orders ship from Midrand Warehouse after manufacturing & payment.</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}