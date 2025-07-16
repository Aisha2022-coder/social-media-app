"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "@/lib/axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import Avatar from "@/components/Avatar";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import PostCard from "@/components/PostCard";

interface User {
  _id: string;
  username: string;
  email: string;
  followers: string[];
  following: string[];
}

interface Post {
  _id: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  media?: { url: string; type: string }[];
  likes?: string[];
}

export default function ExplorePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const { showToast } = useToast();
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

  // Fetch current user ID and users list
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`)
      .then((res) => {
        setCurrentUserId(res.data._id);
        return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`);
      })
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load users.");
        setLoading(false);
      });
  }, []);

  // Fetch trending posts and suggested users
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setTrendingLoading(true);
    setSuggestedLoading(true);
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/trending`).then(res => {
      setTrendingPosts(res.data);
      setTrendingLoading(false);
    }).catch(() => setTrendingLoading(false));
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/suggested`).then(res => {
      setSuggestedUsers(res.data);
      setSuggestedLoading(false);
    }).catch(() => setSuggestedLoading(false));
  }, []);

  // Handle follow/unfollow and update users list immediately
  const handleFollow = async (userId: string, isFollowing: boolean) => {
    if (!currentUserId) return;
    setFollowLoading(userId);
    try {
      if (isFollowing) {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/unfollow`, {});
        showToast("Unfollowed user.", "success");
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/follow`, {});
        showToast("Followed user.", "success");
        // Remove from suggested users if present
        setSuggestedUsers((prev) => prev.filter((u) => u._id !== userId));
      }
      // Update users list locally for instant feedback
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? {
                ...u,
                followers: isFollowing
                  ? u.followers.filter((id) => id !== currentUserId)
                  : [...u.followers, currentUserId],
              }
            : u
        )
      );
    } catch (err) {
      showToast("Failed to update follow status.", "error");
    } finally {
      setFollowLoading(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!currentUserId) return [];
    return users.filter((u) =>
      u._id !== currentUserId &&
      u.username &&
      u.username.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [users, search, currentUserId]);

  // Only render users when currentUserId is set
  if (loading || !currentUserId) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-screen"><Spinner size={48} /></div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-xl w-full mx-auto p-2 sm:p-4 space-y-8">
        <h1 className="text-2xl font-bold mb-4">Explore</h1>
        {/* Trending Posts */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-lg sm:text-xl font-semibold">Trending Posts</span>
            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold flex items-center">🔥 Trending</span>
          </div>
          {trendingLoading ? (
            <Spinner size={32} />
          ) : trendingPosts.length === 0 ? (
            <EmptyState message="No trending posts found." />
          ) : (
            <div className="flex overflow-x-auto pb-2 snap-x snap-mandatory">
              {trendingPosts.map(post => (
                <div key={post._id} className="w-full min-w-0 max-w-full sm:min-w-[320px] sm:max-w-xs flex-shrink-0 snap-center px-0.5">
                  <PostCard post={{ ...post, media: post.media || [], likes: post.likes || [] }} />
                </div>
              ))}
            </div>
          )}
        </div>
        <hr className="my-4 sm:my-6 border-gray-200" />
        {/* Suggested Users */}
        <div>
          <span className="text-lg sm:text-xl font-semibold mb-2 block">Suggested Users</span>
          {suggestedLoading ? (
            <Spinner size={32} />
          ) : suggestedUsers.length === 0 ? (
            <EmptyState message="No suggested users found." />
          ) : (
            <div className="flex flex-col gap-2">
              {suggestedUsers.map((user) => (
                <div key={user._id} className="border rounded-lg p-2 sm:p-4 flex flex-col items-center bg-white shadow-sm hover:shadow-lg transition-shadow w-full max-w-full">
                  <Avatar username={user.username} size={32} />
                  <Link href={`/profile/${user._id}`} className="font-semibold hover:underline mt-2 mb-1 text-center w-full truncate text-xs sm:text-base">
                    {user.username}
                  </Link>
                  <div className="text-xs text-gray-500 mb-2 text-center w-full truncate">{user.email}</div>
                  <button
                    onClick={() => handleFollow(user._id, false)}
                    disabled={followLoading === user._id}
                    className="w-full px-2 py-1 rounded text-xs sm:text-sm text-white transition bg-blue-500 hover:bg-blue-600 mt-1"
                    aria-label={`Follow ${user.username}`}
                  >
                    {followLoading === user._id ? "Following..." : "Follow"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <hr className="my-4 sm:my-6 border-gray-200" />
        {/* User Search (existing) */}
        <div>
          <span className="text-lg sm:text-xl font-semibold mb-2 block">Search Users</span>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded p-2 pl-9 text-xs sm:text-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
          </div>
          {filteredUsers.length === 0 ? (
            <EmptyState message="No users found." />
          ) : (
            <div className="flex flex-col gap-2">
              {filteredUsers.map((user) => {
                const isFollowing = user.followers.includes(currentUserId);
                return (
                  <div key={user._id} className="border rounded-lg p-2 sm:p-4 mb-2 flex flex-col items-center sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 w-full shadow-sm hover:shadow-lg transition-shadow bg-white cursor-pointer max-w-full">
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <Avatar username={user.username} size={28} />
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${user._id}`} className="font-semibold hover:underline break-words text-xs sm:text-base">
                          {user.username}
                        </Link>
                        <div className="text-xs text-gray-500 break-words">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(user._id, isFollowing)}
                      disabled={followLoading === user._id}
                      className={`w-full sm:w-auto mt-2 sm:mt-0 px-2 py-1 rounded text-xs sm:text-sm text-white transition ${isFollowing ? "bg-gray-400 hover:bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
                      aria-label={isFollowing ? `Unfollow ${user.username}` : `Follow ${user.username}`}
                    >
                      {followLoading === user._id
                        ? isFollowing
                          ? "Unfollowing..."
                          : "Following..."
                        : isFollowing
                        ? "Unfollow"
                        : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 