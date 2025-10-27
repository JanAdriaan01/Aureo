// src/components/OrderContext.jsx
import React, { useState, useEffect, useMemo } from "react";

const OrderContext = React.createContext(null);

export function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

export function OrderProvider({ children }) {
  const [items, setItems] = useLocalStorage("order-items", []);
  const [customer, setCustomer] = useLocalStorage("order-customer", {
    name: "",
    email: "",
    phone: "",
    siteAddress: "",
  });

  const addItem = (item) =>
    setItems((prev) => [...prev, { id: crypto.randomUUID(), ...item }]);
  const removeItem = (id) => setItems((prev) => prev.filter((x) => x.id !== id));
  const clearOrder = () => setItems([]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, clearOrder, customer, setCustomer }),
    [items, customer]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = React.useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
