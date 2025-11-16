import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
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
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [items, setItems] = useLocalStorage("order:items", []);
  const [customer, setCustomer] = useLocalStorage("order:customer", {
    name: "",
    email: "",
    phone: "",
    siteAddress: "",
  });

  const addItem = (item) => {
    setItems((prev) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString();
      return [...prev, { id, ...item }];
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const clearOrder = () => {
    setItems([]);
  };

  // FIX: memoize the value so it stops causing double-renders
  
  const value = React.useMemo(
  () => ({
    items,
    addItem,
    removeItem,
    clearOrder,
    customer,
    setCustomer,
  }),
  [items, customer]
);

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}