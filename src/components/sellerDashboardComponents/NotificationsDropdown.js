"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsDropdown({ notifOpen, setNotifOpen }) {
  const router = useRouter();
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [formattedNotifications, setFormattedNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const notifRef = useRef();

  useEffect(() => {
    let isMounted = true;

    const fetchCount = () => {
      fetch("http://localhost:3092/seller/notifications/count", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            setNotifCount(data.count || 0);
          }
        })
        .catch(() => {
          if (isMounted) setNotifCount(0);
        });
    };

    fetchCount();
    const interval = setInterval(fetchCount, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setNotifOpen]);

  const handleNotifToggle = () => {
    if (!notifOpen) {
      setNotifLoading(true);
      fetch("http://localhost:3092/seller/notifications", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data || []);
          const formatted = (data || []).map((note) => ({
            ...note,
            formattedDate: new Date(note.createdAt).toLocaleString(),
          }));
          setFormattedNotifications(formatted);
          setNotifLoading(false);
          setNotifCount(0);
          fetch("http://localhost:3092/seller/notifications/read", {
            method: "POST",
            credentials: "include",
          });
        })
        .catch(() => {
          setNotifications([]);
          setFormattedNotifications([]);
          setNotifLoading(false);
        });
    }
    setNotifOpen(!notifOpen);
  };

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={handleNotifToggle}
        className="relative p-2 rounded hover:bg-gray-100 transition"
      >
        <Bell size={16} />
        {notifCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {notifCount}
          </span>
        )}
      </button>
      {notifOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow z-50">
          <div className="p-3 border-b font-medium">Notifications</div>
          {notifLoading ? (
            <div className="p-4 text-sm text-gray-500">Loading...</div>
          ) : (
            <ul className="max-h-60 overflow-y-auto">
              {formattedNotifications.length === 0 ? (
                <li className="p-3 text-sm text-gray-500">No notifications</li>
              ) : (
                formattedNotifications.map((note, idx) => (
                  <li
                    key={note._id || idx}
                    className={`p-3 text-sm hover:bg-gray-50 cursor-pointer ${
                      note.read ? "text-gray-500" : "font-semibold"
                    }`}
                    onClick={() => {
                      if (note.link) router.push(note.link);
                      setNotifOpen(false);
                    }}
                  >
                    {note.message}
                    <div className="text-xs text-gray-400">
                      {note.formattedDate}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
