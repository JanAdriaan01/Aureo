import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

// Simple localStorage state helper
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue];
}

// ---------- CONTEXT SETUP ----------
const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  // Cart line items
  const [items, setItems] = useLocalStorage("order:items", []);

  // Customer info
  const [customer, setCustomer] = useLocalStorage("order:customer", {
    name: "",
    email: "",
    phone: "",
    siteAddress: "",
  });

  // Add item to order
  const addItem = (item) => {
    setItems((prev) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString();

      return [...prev, { id, ...item }];
    });
  };

  // Remove item by id
  const removeItem = (id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  // Clear order (used after success)
  const clearOrder = () => {
    setItems([]);
    // You can keep customer details if you like, so we don't wipe them:
    // setCustomer({ name: "", email: "", phone: "", siteAddress: "" });
  };

  const value = {
    items,
    addItem,
    removeItem,
    clearOrder,
    customer,
    setCustomer,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

// Hook used in App.jsx (Order, ProductDetails, cart drawer, etc.)
export function useOrder() {
  return useContext(OrderContext);
}