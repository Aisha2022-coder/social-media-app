"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "@/lib/axios";
import Image from "next/image";

// TODO: Define Notification type properly
interface Notification {
  _id: string;
  type: string;
  data: any;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUserId(data.userId || data._id))
      .catch(() => setUserId(null));
  }, []);

  useEffect(() => {
    if (showDropdown) {
      axios.get("/notifications").then(res => {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: Notification) => !n.read).length);
      });
    }
  }, [showDropdown]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleMarkAllRead = async () => {
    await axios.post("/notifications/mark-read");
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const renderNotification = (n: Notification) => {
    let icon = "";
    let text = "";
    let link = undefined;
    const fromUser = n.data?.fromUser;
    const fromUsername = n.data?.fromUsername;
    const fromProfilePicture = n.data?.fromProfilePicture;
    if (n.type === "like") {
      icon = "♥";
      text = fromUsername ? `${fromUsername} liked your post.` : "Someone liked your post.";
      link = n.data?.postId ? `/timeline#${n.data.postId}` : undefined;
    }
    if (n.type === "comment") {
      icon = "💬";
      text = fromUsername ? `${fromUsername} commented on your post.` : "Someone commented on your post.";
      link = n.data?.postId ? `/timeline#${n.data.postId}` : undefined;
    }
    if (n.type === "follow") {
      icon = "➕";
      text = fromUsername ? `${fromUsername} started following you!` : "You have a new follower!";
      link = fromUser ? `/profile/${fromUser}` : undefined;
    }
    return (
      <div
        key={n._id}
        className={`flex items-start gap-2 px-4 py-2 text-sm border-b last:border-b-0 cursor-pointer ${n.read ? "bg-white" : "bg-blue-50 hover:bg-blue-100"}`}
        onClick={() => link && router.push(link)}
        tabIndex={0}
        role="button"
        aria-label={text}
        onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && link) router.push(link); }}
      >
        <span className="text-lg mt-0.5">{icon}</span>
        {fromUsername && (
          fromProfilePicture ? (
            <Image src={`${process.env.NEXT_PUBLIC_API_URL}${fromProfilePicture}`} alt={fromUsername} className="h-8 w-8 rounded-full object-cover border" width={32} height={32} />
          ) : (
            <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-base" style={{minWidth:32}}>{fromUsername.charAt(0).toUpperCase()}</span>
          )
        )}
        <div className="flex-1">
          <div>{text}</div>
          <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
        </div>
      </div>
    );
  };

  // Responsive breakpoint: 646px width or 698px height
  // Tailwind: use max-w-[646px] and max-h-[698px] for custom breakpoints
  // We'll use sm:hidden (default sm=640px) and add a custom style for 646px/698px

  return (
    <nav className="w-full bg-white border-b shadow flex items-center justify-between px-6 py-3 mb-6 relative">
      {/* Hamburger for small screens */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden block focus:outline-none mr-2"
          aria-label="Open menu"
          onClick={() => setShowMobileMenu((v) => !v)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
        <Link href="/timeline" className="font-bold text-lg text-primary hidden md:inline" aria-label="Timeline">Timeline</Link>
        <Link href="/create-post" className="text-primary hidden md:inline" aria-label="Create Post">Create Post</Link>
        <Link href="/explore" className="text-primary hidden md:inline" aria-label="Explore">Explore</Link>
        <Link href={userId ? `/profile/${userId}` : "/profile"} className="text-primary hidden md:inline" aria-label="My Profile">My Profile</Link>
      </div>
      <div className="flex items-center gap-4 notification-bell-group">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            aria-label="Notifications"
          >
            <span className="text-2xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto notification-popup notification-popup-responsive">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold">Notifications</span>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:underline disabled:text-gray-400"
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">No notifications yet.</div>
              ) : (
                notifications.map(renderNotification)
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition hidden md:inline"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end md:hidden" onClick={() => setShowMobileMenu(false)}>
          <div
            className="w-64 bg-white h-full shadow-lg flex flex-col pt-8 px-6 relative animate-slide-in"
            style={{ maxWidth: 320 }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-2xl focus:outline-none"
              aria-label="Close menu"
              onClick={() => setShowMobileMenu(false)}
            >
              ×
            </button>
            <Link href="/timeline" className="py-2 text-lg text-primary font-bold" onClick={() => setShowMobileMenu(false)}>Timeline</Link>
            <Link href="/create-post" className="py-2 text-lg text-primary" onClick={() => setShowMobileMenu(false)}>Create Post</Link>
            <Link href="/explore" className="py-2 text-lg text-primary" onClick={() => setShowMobileMenu(false)}>Explore</Link>
            <Link href={userId ? `/profile/${userId}` : "/profile"} className="py-2 text-lg text-primary" onClick={() => setShowMobileMenu(false)}>My Profile</Link>
            <button
              onClick={() => { setShowMobileMenu(false); handleLogout(); }}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
      <style jsx global>{`
        @media (max-width: 646px), (max-height: 698px) {
          nav > div > a, nav > div > button.bg-red-500 { display: none !important; }
          nav > div > button.md\:hidden { display: block !important; }
        }
        @media (min-width: 647px) and (min-height: 699px) {
          nav > div > a, nav > div > button.bg-red-500 { display: inline !important; }
          nav > div > button.md\:hidden { display: none !important; }
        }
        @media (max-width: 291px) {
          nav .notification-bell-group {
            position: absolute;
            right: 0;
            top: 0;
            height: 100%;
            background: white;
            display: flex;
            align-items: center;
            padding-right: 1.5rem;
            z-index: 10;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.2s ease;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 368px) {
          .notification-popup,
          .notification-popup-responsive {
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            top: 56px !important;
            width: 100vw !important;
            min-width: 0 !important;
            max-width: 100vw !important;
            border-radius: 0 0 12px 12px !important;
            margin-top: 0 !important;
            padding: 0 !important;
            font-size: 13px !important;
            z-index: 9999 !important;
          }
          .notification-popup .px-4, .notification-popup-responsive .px-4 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
          .notification-popup .py-2, .notification-popup-responsive .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        }
      `}</style>
    </nav>
  );
} 