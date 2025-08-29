"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { PlusIcon, MinusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { SparklesIcon as SparklesSolid } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function ProductCard({ product }) {
  const router = useRouter();
  const [animatedPrice, setAnimatedPrice] = useState(parseFloat(product.price));
  const startPriceRef = useRef(parseFloat(product.price));
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { incrementCartCount } = useCart();

  // Fetch wishlist status on mount
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const res = await fetch("http://localhost:3092/buyer/wishlist", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        // Always use parent ID for wishlist check
        const productIdToCheck = product.parentId || product._id;
        const exists = data.some((item) => item._id === productIdToCheck);
        if (exists) {
          setWishlisted(true);
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };
    checkWishlist();
  }, [product._id, product.parentId]);

  useEffect(() => {
    const targetPrice = parseFloat(product.price);
    const duration = 500;
    const frameRate = 30;
    const totalFrames = Math.round(duration / (1000 / frameRate));
    let frame = 0;
    const diff = targetPrice - startPriceRef.current;

    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      setAnimatedPrice(startPriceRef.current + diff * progress);
      if (frame >= totalFrames) {
        setAnimatedPrice(targetPrice);
        clearInterval(interval);
        startPriceRef.current = targetPrice;
      }
    }, 1000 / frameRate);

    return () => clearInterval(interval);
  }, [product.price]);

  const handleClick = () => {
    // Determine if this is a parent or child product
    if (product.parentId) {
      // This is a variant (child) - navigate to parent with variant selected
      router.push(`/product/${product.parentId}?variant=${product._id}`);
    } else {
      // This is a parent product - navigate to parent page
      router.push(`/product/${product._id}`);
    }
    
    console.log('Navigation logic:', {
      isVariant: !!product.parentId,
      parentId: product.parentId || product._id,
      variantId: product.parentId ? product._id : null
    });
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAdding) return;

    setIsAdding(true);
    try {
      // For cart, always use the actual product ID (variant ID if it's a variant)
      const productIdForCart = product._id;
      
      const res = await fetch("http://localhost:3092/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: productIdForCart,
          quantity: quantity,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to add to cart", { position: "top-center" });
      } else {
        toast.success("Added to your cart!", { position: "top-center" });
        incrementCartCount(quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 800);
      }
    } catch (err) {
      toast.error("Something went wrong.", { position: "top-center" });
      console.error("Error adding to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (isWishlisting) return;

    setIsWishlisting(true);
    const apiURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3092";
    
    // For wishlist, always use parent ID (we want to save the product family, not specific variant)
    const productIdForWishlist = product.parentId || product._id;

    try {
      if (wishlisted) {
        // Remove from wishlist
        const res = await fetch(`${apiURL}/buyer/wishlist/${productIdForWishlist}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData?.error || "Failed to remove from wishlist", { position: "top-center" });
        } else {
          toast.success("Removed from wishlist", { position: "top-center" });
          setWishlisted(false);
        }
      } else {
        // Add to wishlist
        const res = await fetch(`${apiURL}/buyer/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: productIdForWishlist }),
        });

        const resData = await res.json();

        if (!res.ok) {
          toast.error(resData?.error || "Failed to add to wishlist", { position: "top-center" });
        } else {
          setWishlisted(true);

          // Save guest sessionId if provided
          if (resData.sessionId) {
            localStorage.setItem("guestSessionId", resData.sessionId);
          }

          toast.custom((t) => (
            <div
              className="
                bg-white dark:bg-neutral-900
                border border-neutral-200 dark:border-neutral-700
                rounded-lg shadow-lg p-4 flex items-center gap-4
              "
            >
              <span className="text-sm font-medium">Added to wishlist!</span>
              <button
                onClick={() => {
                  router.push("/wishlist");
                  toast.dismiss(t.id);
                }}
                className="
                  text-xs font-medium
                  bg-blue-500 hover:bg-blue-600
                  text-white px-2 py-1 rounded
                "
              >
                View My Wishlist
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="ml-auto text-neutral-500 hover:text-neutral-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ));
        }
      }
    } catch (err) {
      toast.error("Something went wrong.", { position: "top-center" });
      console.error("Wishlist error:", err);
    } finally {
      setIsWishlisting(false);
    }
  };

  const increaseQuantity = (e) => {
    e.stopPropagation();
    setQuantity((q) => q + 1);
  };

  const decreaseQuantity = (e) => {
    e.stopPropagation();
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  };

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 bg-white dark:bg-neutral-900 transition hover:shadow-lg hover:-translate-y-1"
      style={{ width: "313px", height: "500px" }}
    >
      {/* COMPLETELY FIXED IMAGE CONTAINER */}
      <div 
        className="relative w-full bg-white dark:bg-neutral-50 rounded-lg overflow-hidden"
        style={{ height: "240px" }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative" style={{ width: "200px", height: "200px" }}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="200px"
              priority={false}
            />
          </div>
        </div>

        {/* Wishlist Icon */}
        <div className="absolute top-2 right-2">
          <motion.button
            onClick={handleWishlist}
            whileTap={{ scale: 0.8 }}
            className="
              group/tooltip
              opacity-100 sm:opacity-0 sm:group-hover:opacity-100
              transition-opacity
              bg-white dark:bg-neutral-800
              border border-neutral-200 dark:border-neutral-700
              rounded-full p-2 shadow-sm
              hover:bg-neutral-100 dark:hover:bg-neutral-700
              relative
            "
          >
            {wishlisted ? (
              <SparklesSolid className="w-5 h-5 text-amber-500" />
            ) : (
              <SparklesIcon className="w-5 h-5 text-neutral-500" />
            )}
            {/* Tooltip */}
            <span
              className="
                absolute -top-8 left-1/2 -translate-x-1/2
                whitespace-nowrap
                text-xs text-white bg-neutral-800
                rounded px-2 py-1
                opacity-0 group-hover/tooltip:opacity-100
                pointer-events-none
                transition-opacity
              "
            >
              Save for later grabs
            </span>
          </motion.button>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {product.name}
        </h3>

        {/* Show variant attributes if it's a variant */}
        {product.parentId && product.variantAttributes && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(product.variantAttributes).map(([key, value]) => (
              <span key={key} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {key}: {value}
              </span>
            ))}
          </div>
        )}
        
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
            {product.brand}
          </p>
        )}
        
        <div className="flex items-center mt-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <svg
              key={index}
              className={`w-4 h-4 ${
                index < product.rating
                  ? "text-yellow-400"
                  : "text-neutral-300 dark:text-neutral-600"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.075 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.273-3.955z" />
            </svg>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-medium text-neutral-900 dark:text-neutral-100">
            ${animatedPrice.toFixed(2)}
          </span>
          <motion.button
            onClick={handleAddToCart}
            disabled={isAdding}
            whileTap={{ scale: 0.9 }}
            animate={added ? { scale: 1.1, backgroundColor: "#22c55e" } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full transition ${
              isAdding
                ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed"
                : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white"
            }`}
          >
            <PlusIcon className="w-4 h-4" />
            {isAdding ? "Grabbing..." : "Grab"}
          </motion.button>
        </div>
        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            onClick={decreaseQuantity}
            className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <MinusIcon className="w-4 h-4" />
          </button>
          <span className="text-sm">{quantity}</span>
          <button
            onClick={increaseQuantity}
            className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}