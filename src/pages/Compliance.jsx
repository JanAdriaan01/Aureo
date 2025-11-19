import React from "react";

export default function Compliance() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Compliance & Care</h1>
      <p className="text-zinc-600 max-w-3xl">
        We adhere to manufacturer manuals during fabrication and installation and align glazing to SANS guidelines.
      </p>
      <ul className="list-disc list-inside space-y-1 text-zinc-700">
        <li>Fabrication from genuine aluminium profiles only.</li>
        <li>Joint sealing with compatible silicone.</li>
        <li>Performance certificates and manuals available on request.</li>
      </ul>
    </div>
  );
}