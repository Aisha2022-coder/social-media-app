"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import Image from "next/image";

interface NotificationData {
  fromUser?: string;
  fromUsername?: string;
  fromProfilePicture?: string;
  postId?: string;
}

interface Notification {
  _id: string;
  type: string;
  data: NotificationData;
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
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notifications`).then(res => {
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
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-read`);
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const renderNotification = (n: Notification) => {
    let icon = "";
    let text = "";
    let link = undefined;
    const data = n.data;
    const fromUser = data.fromUser;
    const fromUsername = data.fromUsername;
    const fromProfilePicture = data.fromProfilePicture;
    if (n.type === "like") {
      icon = "♥";
      text = fromUsername ? `${fromUsername} liked your post.` : "Someone liked your post.";
      link = data.postId ? `/timeline#${data.postId}` : undefined;
    }
    if (n.type === "comment") {
      icon = "💬";
      text = fromUsername ? `${fromUsername} commented on your post.` : "Someone commented on your post.";
      link = data.postId ? `/timeline#${data.postId}` : undefined;
    }
    if (n.type === "follow") {
      icon = "➕";
      text = fromUsername ? `${fromUsername} started following you!` : "You have a new follower!";
      link = fromUser ? `/profile/${fromUser}` : undefined;
    }
    return (
      <div
        key={n._id}
        className={`flex items-start gap-2 px-4 py-2 text-sm border-b last:border-b-0 cursor-pointer ${n.read ? "bg-white" : "bg-indigo-50 hover:bg-indigo-100"}`}
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
            <span className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-base" style={{minWidth:32}}>{fromUsername.charAt(0).toUpperCase()}</span>
          )
        )}
        <div className="flex-1">
          <div>{text}</div>
          <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
        </div>
      </div>
    );
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b shadow flex items-center justify-between px-6 py-3 mb-6">
      <div className="flex items-center gap-4">
        <Link href="/timeline" className="font-extrabold text-2xl text-indigo-600 tracking-tight mr-4 select-none">
          <span className="inline-block align-middle">🌐</span> SocialApp
        </Link>
        <div className="hidden md:flex gap-2 lg:gap-4">
          <Link href="/timeline" className="px-3 py-1 rounded-lg font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">Timeline</Link>
          <Link href="/create-post" className="px-3 py-1 rounded-lg font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">Create Post</Link>
          <Link href="/explore" className="px-3 py-1 rounded-lg font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">Explore</Link>
          <Link href={userId ? `/profile/${userId}` : "/profile"} className="px-3 py-1 rounded-lg font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">My Profile</Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="relative p-2 rounded-full hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            aria-label="Notifications"
          >
            <span className="text-2xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse shadow">{unreadCount}</span>
            )}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto notification-popup notification-popup-responsive animate-fade-in">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold">Notifications</span>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-indigo-600 hover:underline disabled:text-gray-400"
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
          className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold shadow hidden md:inline"
        >
          Logout
        </button>
        <button
          className="md:hidden ml-4 p-2 rounded-full hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          onClick={() => setShowMobileMenu((v) => !v)}
          aria-label="Open menu"
        >
          <span className="text-2xl">☰</span>
        </button>
      </div>
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end md:hidden animate-fade-in" onClick={() => setShowMobileMenu(false)}>
          <div
            className="w-72 h-full shadow-2xl flex flex-col pt-8 px-6 relative animate-slide-in rounded-l-2xl bg-gradient-to-b from-indigo-100 via-blue-100 to-violet-100"
            style={{ maxWidth: 320 }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-2xl focus:outline-none text-white"
              aria-label="Close menu"
              onClick={() => setShowMobileMenu(false)}
            >
              ×
            </button>
            <Link href="/timeline" className="py-2 text-lg text-indigo-900 font-bold rounded hover:bg-indigo-200 transition" onClick={() => setShowMobileMenu(false)}>Timeline</Link>
            <Link href="/create-post" className="py-2 text-lg text-indigo-900 font-bold rounded hover:bg-indigo-200 transition" onClick={() => setShowMobileMenu(false)}>Create Post</Link>
            <Link href="/explore" className="py-2 text-lg text-indigo-900 font-bold rounded hover:bg-indigo-200 transition" onClick={() => setShowMobileMenu(false)}>Explore</Link>
            <Link href={userId ? `/profile/${userId}` : "/profile"} className="py-2 text-lg text-indigo-900 font-bold rounded hover:bg-indigo-200 transition" onClick={() => setShowMobileMenu(false)}>My Profile</Link>
            <button
              onClick={() => { setShowMobileMenu(false); handleLogout(); }}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold shadow"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 