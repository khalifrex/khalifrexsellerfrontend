"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SellerSearchPage() {
  const params = useSearchParams();
  const q = useMemo(() => params.get("q") || "", [params]);

  const [results, setResults] = useState({ products: [], orders: [], customers: [] });
  const [loading, setLoading] = useState(false);
  const [formattedOrders, setFormattedOrders] = useState([]);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`http://localhost:3092/seller/search?q=${encodeURIComponent(q)}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setResults(data || { products: [], orders: [], customers: [] });
        const formatted = (data.orders || []).map(order => ({
          ...order,
          formattedDate: new Date(order.createdAt).toLocaleString(),
        }));
        setFormattedOrders(formatted);
      })
      .catch(() => {
        setResults({ products: [], orders: [], customers: [] });
        setFormattedOrders([]);
      })
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">Search Results for: {q}</h1>
      {loading && <p>Loading...</p>}
      {!loading && (
        <>
          <section>
            <h2 className="font-medium mb-2">Products</h2>
            {results.products.length === 0 ? (
              <p className="text-gray-500">No products found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {results.products.map(product => (
                  <Link key={product._id} href={`/dashboard/products/edit/${product._id}`}>
                    <div className="flex items-center gap-3 border rounded p-2 hover:bg-gray-50">
                      <Image
                        src={product.images?.[0]?.url || "/placeholder.jpg"}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="rounded"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">${product.price}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="font-medium mb-2">Orders</h2>
            {formattedOrders.length === 0 ? (
              <p className="text-gray-500">No orders found.</p>
            ) : (
              <ul className="mb-6">
                {formattedOrders.map(order => (
                  <li key={order.orderId} className="border rounded p-2 mb-2">
                    <div>Order Ref: {order.orderReference}</div>
                    <div>Buyer: {order.buyerDetails?.firstName} {order.buyerDetails?.lastName}</div>
                    <div>Date: {order.formattedDate}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="font-medium mb-2">Customers</h2>
            {results.customers.length === 0 ? (
              <p className="text-gray-500">No customers found.</p>
            ) : (
              <ul>
                {results.customers.map(cust => (
                  <li key={cust._id} className="border rounded p-2 mb-2">
                    <div>{cust.firstName} {cust.lastName}</div>
                    <div>{cust.email}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
