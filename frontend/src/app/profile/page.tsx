"use client";

import { useEffect, useState, useRef } from "react";
import axios from "@/lib/axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/Avatar";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";

interface User {
  _id: string;
  username: string;
  email: string;
  followers: string[];
  following: string[];
  profilePicture?: string;
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

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followerUsers, setFollowerUsers] = useState<User[]>([]);
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    axios
      .get("http://localhost:3000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        return axios.get(`http://localhost:3000/users/${res.data._id}/posts`);
      })
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load profile.");
        setLoading(false);
      });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await axios.post("/users/me/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser({ ...user, profilePicture: res.data.profilePicture });
      showToast("Profile picture updated!", "success");
    } catch (err) {
      showToast("Failed to upload profile picture.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const fetchUsersByIds = async (ids: string[]) => {
    if (!ids.length) return [];
    const res = await axios.get(`/users/by-ids?ids=${ids.join(',')}`);
    return res.data;
  };

  const handleShowFollowers = async () => {
    if (!user) return;
    setShowFollowers(true);
    setFollowerUsers(await fetchUsersByIds(user.followers));
  };
  const handleShowFollowing = async () => {
    if (!user) return;
    setShowFollowing(true);
    setFollowingUsers(await fetchUsersByIds(user.following));
  };

  if (loading) {
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
      <div className="max-w-xl w-full mx-auto p-2 sm:p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        {user && (
          <div className="border rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm hover:shadow-lg transition-shadow bg-white">
            <div className="relative">
              {user.profilePicture ? (
                <img
                  src={`http://localhost:3000${user.profilePicture}`}
                  alt="Profile"
                  className="rounded-full object-cover"
                  style={{ width: 48, height: 48 }}
                />
              ) : (
                <Avatar username={user.username} size={48} />
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="profile-picture-upload"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 text-xs shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Upload profile picture"
                disabled={uploading}
                style={{ fontSize: 10 }}
              >
                {uploading ? "..." : "✎"}
              </button>
            </div>
            <div className="text-center sm:text-left">
              <div className="font-semibold text-xl">{user.username}</div>
              <div>Email: {user.email}</div>
              <div>
                <button
                  className="text-blue-600 hover:underline focus:outline-none disabled:text-gray-400 disabled:cursor-not-allowed"
                  onClick={handleShowFollowers}
                  disabled={user.followers.length === 0}
                  title={user.followers.length === 0 ? "No followers yet" : "View followers"}
                >
                  Followers: {user.followers.length}
                </button>
                {showFollowers && (
                  <Modal title="Followers" onClose={() => setShowFollowers(false)}>
                    {followerUsers.length === 0 ? (
                      <div>No followers yet.</div>
                    ) : (
                      followerUsers.map((u) => (
                        <div key={u._id} className="flex items-center gap-2 mb-2">
                          <Avatar username={u.username} size={28} />
                          <span>{u.username}</span>
                        </div>
                      ))
                    )}
                  </Modal>
                )}
              </div>
              <div>
                <button
                  className="text-blue-600 hover:underline focus:outline-none disabled:text-gray-400 disabled:cursor-not-allowed"
                  onClick={handleShowFollowing}
                  disabled={user.following.length === 0}
                  title={user.following.length === 0 ? "Not following anyone yet" : "View following"}
                >
                  Following: {user.following.length}
                </button>
                {showFollowing && (
                  <Modal title="Following" onClose={() => setShowFollowing(false)}>
                    {followingUsers.length === 0 ? (
                      <div>Not following anyone yet.</div>
                    ) : (
                      followingUsers.map((u) => (
                        <div key={u._id} className="flex items-center gap-2 mb-2">
                          <Avatar username={u.username} size={28} />
                          <span>{u.username}</span>
                        </div>
                      ))
                    )}
                  </Modal>
                )}
              </div>
            </div>
          </div>
        )}
        <h2 className="text-xl font-semibold mb-2">Your Posts</h2>
        {posts.length === 0 ? (
          <EmptyState message="No posts yet." />
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={{ ...post, media: post.media || [], likes: post.likes || [] }} />
          ))
        )}
      </div>
    </ProtectedRoute>
  );
} 