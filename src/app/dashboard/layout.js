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

  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const res = await fetch("http://localhost:3092/seller/store-info", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch seller info");
        const data = await res.json();
        setSellerInfo(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSellerInfo();
  }, []);

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
      />

      <div className="md:ml-64 flex flex-col min-h-screen">
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
          />
        )}

        <main className="flex-1 pl-3 mt-16">{children}</main>
      </div>
    </>
  );
}
