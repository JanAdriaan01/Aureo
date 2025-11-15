import { useState } from "react";
import { useOrder } from "../context/OrderProvider";
import Input from "../components/Input";

// ---------- ORDER COMPONENT ----------
function Order() {
  console.log("Order component rendering");
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

  // ---------------- VALIDATION ----------------
  const validateCustomer = (customer) => {
    const errors = [];

    if (!customer.name?.trim()) errors.push("Full name is required");

    if (!customer.email?.trim()) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.push("Valid email address is required");
    }

    if (!customer.phone?.trim()) {
      errors.push("Phone number is required");
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(customer.phone.replace(/\s/g, ""))) {
      errors.push("Valid phone number is required");
    }

    if (!customer.siteAddress?.trim()) {
      errors.push("Site address is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validateField = (field, value) => {
    const errors = { ...customerErrors };

    const setErr = (msg) => (errors[field] = msg);
    const clearErr = () => delete errors[field];

    switch (field) {
      case "email":
        if (!value.trim()) setErr("Email is required");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) setErr("Valid email is required");
        else clearErr();
        break;

      case "phone":
        if (!value.trim()) setErr("Phone is required");
        else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value.replace(/\s/g, "")))
          setErr("Valid phone number is required");
        else clearErr();
        break;

      case "name":
        if (!value.trim()) setErr("Full name is required");
        else clearErr();
        break;

      case "siteAddress":
        if (!value.trim()) setErr("Site address is required");
        else clearErr();
        break;

      default:
        if (!value.trim()) setErr(`${field} is required`);
        else clearErr();
    }

    setCustomerErrors(errors);
  };

  // ---------------- HANDLE CHECKOUT ----------------
  const handleCheckout = () => {
    const validation = validateCustomer(customer);

    if (!validation.isValid) {
      alert(`Please fix the following errors:\n\n• ${validation.errors.join("\n• ")}`);
      return;
    }

    const id = `ORD-${Date.now().toString().slice(-6)}`;
    setOrderId(id);
    setStage("confirm");
  };

  // ---------------- SEND ORDER EMAILS ----------------
  const confirmPayment = async () => {
    const lines = items.map((x, i) => {
      return `${i + 1}. ${x.systemName} (${x.size}) × ${x.quantity}
- Glazing: ${x.glazing}
- Finish: ${x.finish}
- Line total: R ${x.subtotal.toLocaleString()}`;
    });

    const bankingDetails = `
Bank Details:
- Account Name: Modahaus (Pty) Ltd
- Bank: Standard Bank
- Account Number: 10256640074
- Branch Code: 4906
- SWIFT Code: SBZAZAJJ
- Reference: ${orderId}
`;

    const message = `
Dear ${customer.name},

Thank you for placing your order with Modahaus.

Order Number: ${orderId}
Date: ${new Date().toLocaleString()}

Customer Details:
- Name: ${customer.name}
- Email: ${customer.email}
- Phone: ${customer.phone}
- Site / Shipping Address:
  ${customer.siteAddress}

Order Items:
${lines.join("\n\n")}

Subtotal: R ${total.toLocaleString()}
Shipping: R ${shipping.toLocaleString()}
Total: R ${grandTotal.toLocaleString()}

${bankingDetails}

Please make payment via EFT within 72 hours using your order number as reference.
Once payment reflects, we will confirm and proceed with manufacturing and delivery.

Kind regards,
Modahaus
`;

    try {
      // ---- Send to CUSTOMER ----
      await fetch("https://modahaus-backend.vercel.app/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customer.name,
          email: customer.email,
          subject: `Modahaus Order ${orderId}`,
          message,
        }),
      });

      // ---- Send to ADMIN ----
      await fetch("https://modahaus-backend.vercel.app/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customer.name,
          email: "sales@modahaus.co.za", // ← your admin email
          subject: `NEW ORDER RECEIVED: ${orderId}`,
          message,
        }),
      });
    } catch (err) {
      console.error("Email send error:", err);
      alert("Order saved, but email failed. We will still receive the order manually.");
    }

    setStage("success");
    clearOrder();
  };

  // ---------------- SUCCESS PAGE ----------------
  if (stage === "success") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold">Order Placed</h1>
        <p className="text-zinc-600">
          Your order <b>{orderId}</b> has been received and is awaiting payment.
        </p>
        <p className="text-zinc-600">
          Please make payment via <b>EFT within 72 hours</b> using your order number.
        </p>

        <div className="rounded-2xl border border-zinc-200 p-6 bg-white text-left inline-block mt-4">
          <h2 className="font-semibold mb-2">Bank Details</h2>
          <div className="text-sm text-zinc-700 leading-relaxed">
            <div><b>Account Name:</b> Modahaus (Pty) Ltd</div>
            <div><b>Bank:</b> Standard Bank</div>
            <div><b>Account Number:</b> 10256640074</div>
            <div><b>Branch Code:</b> 4906</div>
            <div><b>SWIFT Code:</b> SBZAZAJJ</div>
            <div><b>Reference:</b> {orderId}</div>
          </div>
        </div>

        <a href="/products" className="inline-block mt-6 px-6 py-3 rounded-2xl bg-zinc-900 text-white">
          Back to Shop
        </a>
      </div>
    );
  }

  // ---------------- CONFIRM PAGE ----------------
  if (stage === "confirm") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Confirm Order</h1>

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
                <div>{x.systemName} ({x.size}) × {x.quantity}</div>
                <div>R {x.subtotal.toLocaleString()}</div>
              </li>
            ))}
          </ul>

          <div className="mt-4 text-right font-semibold">Subtotal: R {total.toLocaleString()}</div>
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

  // ---------------- REVIEW PAGE ----------------
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Order</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 p-6 bg-white">
          <div className="text-zinc-600">
            No line items yet. Visit{" "}
            <a href="/products" className="underline">Products</a> to add windows.
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50">
                <tr className="text-left">
                  {["#", "System", "Size", "Qty", "Glazing", "Finish", "UnitPrice", "Total", ""].map(
                    (h, i) => (
                      <th key={i} className="px-3 py-2 font-medium">{h}</th>
                    )
                  )}
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
                    validateField("name", v);
                  }}
                  required
                  error={customerErrors.name}
                />

                <Input
                  label="Email"
                  value={customer.email}
                  onChange={(v) => {
                    setCustomer({ ...customer, email: v });
                    validateField("email", v);
                  }}
                  required
                  error={customerErrors.email}
                />

                <Input
                  label="Phone"
                  value={customer.phone}
                  onChange={(v) => {
                    setCustomer({ ...customer, phone: v });
                    validateField("phone", v);
                  }}
                  required
                  error={customerErrors.phone}
                />

                <Input
                  label="Site address"
                  value={customer.siteAddress}
                  onChange={(v) => {
                    setCustomer({ ...customer, siteAddress: v });
                    validateField("siteAddress", v);
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
                Shipping will be quoted once address is confirmed. Orders ship
                from Midrand Warehouse after manufacturing & payment.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Order;