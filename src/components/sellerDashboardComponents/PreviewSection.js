import ProductCard from "@/components/ProductCard";

export default function PreviewSection({ form, imagePreviews, hasMounted }) {
  const previewProduct = hasMounted
    ? {
        _id: "preview",
        name: form.name || "Product Name",
        description: form.description || "Product description...",
        price: form.price || "0.00",
        rating: 4,
        image: imagePreviews[0] || "/placeholder.png",
      }
    : null;

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
      <div className="flex justify-center">
        <div className="w-[351px] h-[499px] border rounded shadow overflow-hidden">
          {previewProduct && <ProductCard product={previewProduct} />}
          {imagePreviews.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Using placeholder image until you add photos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}