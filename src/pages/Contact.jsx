import React, { useState } from "react";
import Input from "../components/ui/Input";

export default function Contact() {
  const [msg, setMsg] = useState({ name: "", email: "", phone: "", message: "" });

  const submit = (e) => {
    e.preventDefault();
    alert("Thanks! We’ll get back to you.");
    setMsg({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-3xl font-bold">Contact</h1>
        <p className="text-zinc-600 mt-1">Send a message or call us to discuss your project.</p>
        <div className="mt-6 space-y-2 text-zinc-700">
          <div><span className="font-medium">Phone:</span> +27 (0) 61 193 3931</div>
          <div><span className="font-medium">Email:</span> orders@modahaus.co.za</div>
          <div><span className="font-medium">Hours:</span> Mon–Sun 08:00–17:00</div>
        </div>
      </div>
      <form onSubmit={submit} className="rounded-2xl border border-zinc-200 p-5 bg-white">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input label="Full name" value={msg.name} onChange={(v) => setMsg({ ...msg, name: v })} />
          <Input label="Email" value={msg.email} onChange={(v) => setMsg({ ...msg, email: v })} />
          <Input label="Phone" value={msg.phone} onChange={(v) => setMsg({ ...msg, phone: v })} />
        </div>
        <label className="flex flex-col gap-1 mt-3">
          <span className="text-sm text-zinc-600">Message</span>
          <textarea
            value={msg.message}
            onChange={(e) => setMsg({ ...msg, message: e.target.value })}
            className="px-4 py-2 rounded-xl border border-zinc-300 min-h-[120px]"
          />
        </label>
        <div className="mt-4">
          <button className="px-5 py-3 rounded-2xl bg-zinc-900 text-white">Send</button>
        </div>
      </form>
    </div>
  );
}