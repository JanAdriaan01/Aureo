// src/components/WhatsAppChat.jsx
import React from "react";

export default function WhatsAppChat({
  number = "27611933931", // e.g. "27811933931" (country code + number)
  message = "Hi! I need help with a product",
}) {
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg"
      style={{ background: "#25D366" }}
    >
      <svg
        className="w-7 h-7 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        {/* Simple WhatsApp icon path */}
        <path d="M20.52 3.48A11.95 11.95 0 0012 0C5.373 0 .01 5.373.01 12 0 14.12.53 16.14 1.5 17.9L0 24l6.33-1.65A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.18-3.48-8.52zM12 21.5c-1.4 0-2.77-.34-3.98-.99l-.28-.14-3.77.98.99-3.69-.16-.3A9.503 9.503 0 012.5 12c0-5.25 4.25-9.5 9.5-9.5S21.5 6.75 21.5 12 17.25 21.5 12 21.5zM17.7 14.6c-.28-.14-1.65-.8-1.9-.89-.25-.09-.43-.14-.62.14-.19.28-.75.89-.92 1.07-.17.19-.33.21-.61.07-.28-.14-1.18-.43-2.24-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.33.42-.5.14-.17.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.06-.22-.54-.45-.47-.62-.48-.16 0-.35-.01-.54-.01-.19 0-.5.07-.76.35-.25.28-.97.95-.97 2.32 0 1.37 1 2.7 1.14 2.89.14.19 1.97 3.01 4.8 4.22 3.19 1.36 3.19 0 3.56-.98.37-.98.37-1.82.26-1.98-.12-.16-.44-.25-.75-.39z" />
      </svg>
    </a>
  );
}