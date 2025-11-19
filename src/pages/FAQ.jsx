import React from "react";

export default function FAQ() {
  const faqs = [
    { q: "How are orders priced?", a: "Live prices for standard sizes (clear glass & white frame). Extras adjust on PDP." },
    { q: "Lead time?", a: "Typically 10–20 working days after deposit and site measure." },
    { q: "Do you install?", a: "Yes. Our trained teams install to best practice." },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">FAQs</h1>
      <div className="mt-4 grid gap-4">
        {faqs.map((f, i) => (
          <details key={i} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <summary className="font-medium cursor-pointer">{f.q}</summary>
            <div className="text-zinc-700 mt-2">{f.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}