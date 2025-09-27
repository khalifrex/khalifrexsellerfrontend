"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Package,
  BarChart2,
  ShoppingBag,
  Settings,
  HelpCircle,
  LogOut,
  Truck,
} from "lucide-react";

const menuLinks = [
  { href: "/dashboard", label: "Home", icon: <LayoutDashboard size={18} /> },
  {
    label: "Products",
    icon: <Package size={18} />,
    children: [
      { href: "/dashboard/inventory", label: "All Products" },
      { href: "/dashboard/create", label: "Add Product" },
    ],
  },
  { href: "/dashboard/orders", label: "My Orders", icon: <ShoppingBag size={18} /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
  { href: "/dashboard/shipping-zones", label: "Shipping Zones", icon: <Truck size={18} /> },
];

export default function HamburgerMenu({ pathname, productDropdown, setProductDropdown, setMenuOpen }) {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-white z-40 animate-slideInLeft flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="font-bold text-lg text-[#1888CA]">Menu</p>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 relative">
          {menuLinks.map((link, idx) => (
            <div key={idx}>
              {!link.children ? (
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 text-base font-medium px-4 py-3 rounded ${
                    pathname === link.href ? "text-[#1888CA]" : "text-gray-800 hover:bg-gray-100"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => setProductDropdown(!productDropdown)}
                    className="flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      {link.icon}
                      <span>{link.label}</span>
                    </div>
                    {productDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {productDropdown && (
                    <div className="ml-6 mt-1 space-y-1">
                      {link.children.map((sublink) => (
                        <Link
                          key={sublink.href}
                          href={sublink.href}
                          className={`block px-3 py-2 text-sm rounded ${
                            pathname === sublink.href ? "text-[#1888CA]" : "hover:bg-gray-100"
                          }`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {sublink.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <h3 className="text-xs uppercase font-semibold text-gray-500 mt-6 mb-2">General</h3>
          {/* Other General Links */}
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 text-base font-medium px-4 py-3 rounded ${
              pathname === "/dashboard/settings"
                ? "text-[#1888CA]"
                : "text-gray-800 hover:bg-gray-100"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            <Settings size={14} />
            <span>Settings</span>
          </Link>

          <Link
            href="/dashboard/help"
            className={`flex items-center gap-3 text-base font-medium px-4 py-3 rounded ${
              pathname === "/dashboard/help"
                ? "text-[#1888CA]"
                : "text-gray-800 hover:bg-gray-100"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            <HelpCircle size={14} />
            <span>Help</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 text-base font-medium px-4 py-3 rounded text-gray-800 hover:bg-gray-100 w-full text-left"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>

          {/* Logout Confirmation Modal - positioned in center without overlay */}
          {showLogoutModal && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-[300px] p-5 animate-fadeIn">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Confirm Logout</h2>
                <p className="text-sm text-gray-600 mb-4">Are you sure you want to logout?</p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await fetch("http://localhost:3092/logout", {
                          method: "POST",
                          credentials: "include",
                        });
                        setShowLogoutModal(false);
                        router.push("/signin");
                      } catch (err) {
                        console.error("Logout failed", err);
                      }
                    }}
                    className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}