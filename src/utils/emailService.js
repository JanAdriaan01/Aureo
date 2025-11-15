const API_URL = import.meta.env.VITE_API_URL;

export async function sendOrderEmail(data) {
  const res = await fetch(`${API_URL}/api/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}