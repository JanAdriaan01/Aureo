import React from "react";
import Input from "../ui/Input";

export default function CustomerForm({ customer, setCustomer, errors, validateField }) {
  return (
    <div className="rounded-2xl border border-zinc-200 p-5 bg-white">
      <div className="font-semibold mb-3">Customer Details</div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Input
          label="Full Name"
          value={customer.name}
          onChange={(v) => {
            setCustomer({ ...customer, name: v });
            validateField("name", v);
          }}
          required
          error={errors.name}
        />
        <Input
          label="Email"
          value={customer.email}
          onChange={(v) => {
            setCustomer({ ...customer, email: v });
            validateField("email", v);
          }}
          required
          error={errors.email}
        />
        <Input
          label="Phone"
          value={customer.phone}
          onChange={(v) => {
            setCustomer({ ...customer, phone: v });
            validateField("phone", v);
          }}
          required
          error={errors.phone}
        />
        <Input
          label="Street Address"
          value={customer.street}
          onChange={(v) => setCustomer({ ...customer, street: v })}
          required
          error={errors.street}
        />
        <Input
          label="City / Suburb"
          value={customer.city}
          onChange={(v) => setCustomer({ ...customer, city: v })}
          required
          error={errors.city}
        />
        <Input
          label="Province / State"
          value={customer.province}
          onChange={(v) => setCustomer({ ...customer, province: v })}
          required
          error={errors.province}
        />
        <Input
          label="Postal / Zip Code"
          value={customer.postal}
          onChange={(v) => setCustomer({ ...customer, postal: v })}
          required
          error={errors.postal}
        />
        <Input
          label="Country"
          value={customer.country || "South Africa"}
          onChange={(v) => setCustomer({ ...customer, country: v })}
          required
          error={errors.country}
        />
      </div>
    </div>
  );
}