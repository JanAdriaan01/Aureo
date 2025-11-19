import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shell from "./components/Shell";
import { OrderProvider } from "./context/OrderContext";
import CartDrawer from "./components/CartDrawer";
import ChatButton from "./components/ChatButton";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Compliance from "./pages/Compliance";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Order from "./components/order/Order"; // Correct path

function App() {
  return (
    <BrowserRouter>
      <OrderProvider>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:code" element={<ProductDetails />} />
            <Route path="/order" element={<Order />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>

          {/* Side cart drawer / handle */}
          <CartDrawer />
          <ChatButton number="27611933931" message="Hi, I need help with a product." />
        </Shell>
      </OrderProvider>
    </BrowserRouter>
  );
}

export default App;