import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LayoutDashboard, Package, BarChart2, ShoppingBag, Settings, HelpCircle, LogOut, ChevronUp, ChevronDown } from "lucide-react";

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
];


export default function Sidebar({ pathname, productDropdown, setProductDropdown }) {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

   const handleLogout = async () => {
    try {
      await fetch("http://localhost:3092/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login"); // or replace with home if needed
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
   const generalLinks = [
    { href: "/dashboard/settings", label: "Settings", icon: <Settings size={14} /> },
    { href: "/dashboard/help", label: "Help", icon: <HelpCircle size={14} /> },
    { label: "Logout", icon: <LogOut size={14} />, onClick: () => setShowLogoutModal(true) },

  ];
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl hidden md:flex flex-col justify-between z-30">
      <div>
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <Link href="/dashboard">
            <Image
              src="https://res.cloudinary.com/khalifrex/image/upload/v1751461356/navbarLogo_iw2ooa.jpg"
              alt="Khalifrex Logo"
              width={120}
              height={35}
              className="object-contain"
            />
          </Link>
        </div>

        <nav className="p-4">
          <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">Menu</h3>
          <div className="space-y-1">
            {menuLinks.map((link, idx) => (
              <div key={idx}>
                {!link.children ? (
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                      pathname === link.href ? "bg-[#1888CA] text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => setProductDropdown(!productDropdown)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition ${
                        pathname.startsWith("/dashboard/inventory") ? "bg-[#1888CA] text-white" : "hover:bg-gray-100"
                      }`}
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
                            className={`block px-3 py-2 text-sm rounded-md ${
                              pathname === sublink.href ? "bg-[#1888CA] text-white" : "hover:bg-gray-100"
                            }`}
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
          </div>

          <h3 className="text-xs uppercase font-semibold text-gray-500 mt-6 mb-2">General</h3>
          <div className="space-y-1">
            {generalLinks.map((link) => 
              link.href ? (
                <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                  pathname === link.href ? "bg-[#1888CA] text-white" : "hover:bg-gray-100"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
              ) : (
                <button
                key={link.label}
                onClick={link.onClick}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-left hover:bg-gray-100 transition"
        >
          {link.icon}
          <span>{link.label}</span>
        </button>
        )
            )}

              {/* Logout Confirmation Modal */}
  {showLogoutModal && (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] animate-fadeIn">
        <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to logout?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="px-4 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100"
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
                router.push("/login");
              } catch (err) {
                console.error("Logout failed", err);
              }
            }}
            className="px-4 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )}
          </div>
        </nav>
      </div>
    </aside>
  );
}
