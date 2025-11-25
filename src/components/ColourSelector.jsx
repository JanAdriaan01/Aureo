// src/components/ColourSelector.jsx
import React from "react";

export default function ColourSelector({ options, selectedColour, onChange }) {
  return (
    <select
      value={selectedColour}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg"
    >
      {options.map((o) => (
        <option key={o.code} value={o.code}>
          {o.name} ({o.code})
        </option>
      ))}
    </select>
  );
}