// src/pages/ProductDetails.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ACW_CATALOGUE } from "../data/acw-catalogue.js";
import { useOrder } from "../context/OrderContext.jsx";

import ProductDetailsInfo from "../components/ProductDetailsInfo";
import ProductImagesGallery from "../components/ProductImagesGallery";
import TabsSection from "../components/TabsSection";
import ReviewsList from "../components/ReviewsList";
import RelatedProductsGrid from "../components/RelatedProductsGrid";

export default function ProductDetails() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { addItem } = useOrder();

  const product = useMemo(() => {
    if (!ACW_CATALOGUE) return null;
    return (
      ACW_CATALOGUE[code] ||
      Object.values(ACW_CATALOGUE).find((p) => p.codePrefix === code || p.title === code) ||
      null
    );
  }, [code]);

  useEffect(() => window.scrollTo({ top: 0, left: 0 }), [code]);

  if (!product)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-zinc-600">No product for code: {code}</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded"
        >
          Back to Products
        </button>
      </div>
    );

  const colourOptions = (Object.keys(product.imagesByColour || {}).length > 0
    ? Object.keys(product.imagesByColour).map((c) => ({
        code: c,
        name: c,
        images: product.imagesByColour[c] || [product.image || "/placeholder.png"],
      }))
    : [{ code: "DEF", name: "Default", images: [product.image || "/placeholder.png"] }]
  );

  const [selectedColour, setSelectedColour] = useState(colourOptions[0]?.code || "DEF");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(
    colourOptions[0]?.images?.[0] || product.image || "/placeholder.png"
  );

  // Sync selectedImage when selectedColour changes
  useEffect(() => {
    const opts = colourOptions.find((o) => o.code === selectedColour) || colourOptions[0];
    const firstImg = (opts && Array.isArray(opts.images) && opts.images[0]) || product.image || "/placeholder.png";
    setSelectedImage(firstImg);
  }, [selectedColour, JSON.stringify(colourOptions), product.image]);

  // Quantity handlers
  const handleQuantityChange = (value) => {
    const qty = Number(value);
    setQuantity(qty < 1 || isNaN(qty) ? 1 : qty);
  };

  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const incrementQuantity = () => setQuantity((prev) => prev + 1);

  const handleAddToOrder = () => {
    const qtyNum = Number(quantity) || 1;
    const basePrice = Number(product.basePrice) || 0;

    addItem({
      code: product.codePrefix || code,
      title: product.title || product.codePrefix || code,
      quantity: qtyNum,
      price: basePrice,
      subtotal: basePrice * qtyNum,
      image: selectedImage,
      timestamp: new Date().toISOString(),
      size: `${product.dimensions?.width || 1200} x ${product.dimensions?.height || 1500} mm`,
      glazing: product.metadata?.glazing || "10mm Clear Float",
      tint: product.metadata?.tinting || "Standard Tint",
      finish: selectedColour,
      colour: selectedColour,
    });

    window.dispatchEvent(new Event("cart:open"));
  };

  const shareLinks = [
    { label: "🔗 Share", href: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}` },
    { label: "🐦 Tweet", href: `https://twitter.com/intent/tweet?text=${product.title}&url=${window.location.href}` },
    { label: "💬 WhatsApp", href: `https://wa.me/?text=${product.title} ${window.location.href}` },
  ];

  const relatedProducts = Object.entries(ACW_CATALOGUE)
    .map(([k, p]) => ({ code: k, ...p }))
    .filter(
      (p) =>
        p.code !== (product.codePrefix || code) &&
        (p.category === product.category || p.codePrefix === product.codePrefix)
    )
    .slice(0, 6);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10 overflow-x-hidden">
      <div className="grid md:grid-cols-2 gap-8">
        <ProductImagesGallery
          colourOptions={colourOptions}
          selectedColour={selectedColour}
          setSelectedColour={(c) => setSelectedColour(c)}
          onImageSelect={(img) => img && setSelectedImage(img)}
        />

        <ProductDetailsInfo
          title={product.title}
          description={product.shortDescription || product.description}
          sizeLabel={`${product.dimensions?.width || 1200} x ${product.dimensions?.height || 1500} mm`}
          glazing={product.metadata?.glazing || "10mm Clear Float"}
          tint={product.metadata?.tinting || "Standard Tint"}
          finish={selectedColour}
          selectedColour={selectedColour}
          onColourChange={(c) => setSelectedColour(c)}
          colourOptions={colourOptions}
          quantity={quantity}
          setQuantity={handleQuantityChange}
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
          unitPrice={Number(product.basePrice)}
          handleAddToOrder={handleAddToOrder}
          shareLinks={shareLinks}
          navigateBack={() => navigate(-1)}
        />
      </div>

      <TabsSection
        description={product.description}
        additional={product.additionalInformation}
        features={product.features}
      />

      <ReviewsList reviews={product.reviews} />
      <RelatedProductsGrid products={relatedProducts} />
    </div>
  );
}