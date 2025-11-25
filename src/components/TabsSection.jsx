// src/components/TabsSection.jsx
import React, { useState } from "react";

export default function TabsSection({ description, additional, features }) {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Detailed Information", content: description },
    { id: "additional", label: "Additional Information", content: additional },
    { id: "features", label: "Features", content: features },
  ];

  return (
    <div className="mt-10">
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6 text-zinc-700 space-y-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={activeTab === tab.id ? "block" : "hidden"}
            dangerouslySetInnerHTML={{ __html: tab.content || "No information available." }}
          />
        ))}
      </div>
    </div>
  );
}
