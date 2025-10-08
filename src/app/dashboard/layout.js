"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../../components/sellerDashboardComponents/Sidebar";
import Topbar from "../../components/sellerDashboardComponents/Topbar";
import HamburgerMenu from "../../components/sellerDashboardComponents/HamburgerMenu";

export default function SellerDashboardLayout({ children }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [productDropdown, setProductDropdown] = useState(false);
  const searchRef = useRef();
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerInfo();
  }, []);

  const fetchSellerInfo = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seller/store-info`, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch seller info");
      }
      
      const data = await res.json();
      setSellerInfo(data);
    } catch (err) {
      console.error("Error fetching seller info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <Sidebar
        pathname={pathname}
        productDropdown={productDropdown}
        setProductDropdown={setProductDropdown}
        sellerInfo={sellerInfo}
      />

      <div className="md:ml-64 flex flex-col min-h-screen bg-slate-50">
        <Topbar
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          searchRef={searchRef}
          sellerInfo={sellerInfo}
        />

        {menuOpen && (
          <HamburgerMenu
            pathname={pathname}
            productDropdown={productDropdown}
            setProductDropdown={setProductDropdown}
            setMenuOpen={setMenuOpen}
            sellerInfo={sellerInfo}
          />
        )}

        <main className="flex-1 mt-16 p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-600 font-medium">Loading...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </>
  );
}