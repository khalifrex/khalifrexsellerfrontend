"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Image from "next/image";

export default function ProfileDropdown({ sellerInfo, profileOpen, setProfileOpen }) {
  const router = useRouter();
  const profileRef = useRef();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setProfileOpen]);

  return (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setProfileOpen(!profileOpen)}
        className="flex items-center gap-2"
      >
        <Image
          src={sellerInfo.storePic || "/avatar-placeholder.png"}
          alt="User"
          width={26}
          height={26}
          className="rounded-full"
        />
        <span className="font-medium text-sm text-gray-800 hidden md:block">
          {sellerInfo.storeName || "My Khalifrex Store"}
        </span>
      </button>

      {profileOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow z-50">
          <div className="flex items-center gap-3 p-3 border-b">
            <Image
              src={sellerInfo.storePic || "/avatar-placeholder.png"}
              alt="User"
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <p className="font-medium">{sellerInfo.storeName || "My Khalifrex Store"}</p>
              <p className="text-xs text-gray-500">{sellerInfo.email || "seller@example.com"}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
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
                    router.push("/signin");
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
  );
}
