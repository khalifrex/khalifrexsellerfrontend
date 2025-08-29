"use client";

import { useState, useRef } from "react";
import { Menu } from "lucide-react";
import SearchBar from "./SearchBar";
import NotificationsDropdown from "./NotificationsDropdown";
import ProfileDropdown from "./ProfileDropdown";

export default function Topbar({ menuOpen, setMenuOpen, sellerInfo }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 h-16">
      {/* Hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 rounded hover:bg-gray-100 transition md:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1 flex justify-center"></div>

      <div className="flex items-center gap-3 relative">
        <SearchBar
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
        />
        <NotificationsDropdown
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
        />
        {sellerInfo && (
          <ProfileDropdown
            sellerInfo={sellerInfo}
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
          />
        )}
      </div>
    </header>
  );
}
