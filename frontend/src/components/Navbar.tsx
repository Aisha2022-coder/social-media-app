"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useRef } from "react";

export default function Navbar() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:3000/users/me", {
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
        setUnreadCount(res.data.filter((n: any) => !n.read).length);
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

  const renderNotification = (n: any) => {
    let icon = "";
    let text = "";
    let link = undefined;
    let fromUser = n.data?.fromUser;
    let fromUsername = n.data?.fromUsername;
    let fromProfilePicture = n.data?.fromProfilePicture;
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
            <img src={`http://localhost:3000${fromProfilePicture}`} alt={fromUsername} className="h-8 w-8 rounded-full object-cover border" />
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

  return (
    <nav className="w-full bg-white border-b shadow flex items-center justify-between px-6 py-3 mb-6">
      <div className="flex items-center gap-4">
        <Link href="/timeline" className="font-bold text-lg text-primary" aria-label="Timeline">Timeline</Link>
        <Link href="/create-post" className="text-primary" aria-label="Create Post">Create Post</Link>
        <Link href="/explore" className="text-primary" aria-label="Explore">Explore</Link>
        <Link href={userId ? `/profile/${userId}` : "/profile"} className="text-primary" aria-label="My Profile">My Profile</Link>
      </div>
      <div className="flex items-center gap-4">
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
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
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
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
} 