"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useCart } from "@/context/CartContext";


export default function ProductCard({ product }) {

  const [animatedPrice, setAnimatedPrice] = useState(parseFloat(product.price));
  const startPriceRef = useRef(parseFloat(product.price));



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





  return (
    <div
      className="group relative cursor-pointer border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 bg-white dark:bg-neutral-900 transition hover:shadow-lg hover:-translate-y-1"
      style={{ width: "313px", height: "500px" }}
    >

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

        </div>
      </div>
    </div>
  );
}