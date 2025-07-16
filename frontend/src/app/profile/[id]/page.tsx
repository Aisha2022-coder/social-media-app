"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostCard from "@/components/PostCard";
import Modal from "@/components/Modal";
import Avatar from "@/components/Avatar";

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

export default function OtherUserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followerUsers, setFollowerUsers] = useState<User[]>([]);
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  const fetchUsersByIds = async (ids: string[]) => {
    if (!ids.length) return [];
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/by-ids?ids=${ids.join(',')}`);
      return res.data;
    } catch {
      return [];
    }
  };

  const handleShowFollowers = async () => {
    if (!user) return;
    setFollowersLoading(true);
    const users = await fetchUsersByIds(user.followers);
    setFollowerUsers(users);
    setFollowersLoading(false);
    setShowFollowers(true);
  };
  const handleShowFollowing = async () => {
    if (!user) return;
    setFollowingLoading(true);
    const users = await fetchUsersByIds(user.following);
    setFollowingUsers(users);
    setFollowingLoading(false);
    setShowFollowing(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`).then(res => {
      setCurrentUserId(res.data._id);
    }).catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCurrentUserId(res.data.userId);
        return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
      })
      .then((res) => {
        setUser(res.data);
        setIsFollowing(res.data.followers.includes(currentUserId));
        return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/posts`);
      })
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, [id, currentUserId]);

  useEffect(() => {
    if (user && currentUserId) {
      setIsFollowing(user.followers.includes(currentUserId));
    }
  }, [user, currentUserId]);

  const handleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/unfollow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/follow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
      setUser(res.data);
    } catch {
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-screen">Loading profile...</div>
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

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-2">{user.username}&apos;s Profile</h1>
        <div className="border rounded-lg p-4 mb-4">
          <div className="font-semibold">Username: {user.username}</div>
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
                {followersLoading ? (
                  <div>Loading...</div>
                ) : followerUsers.length === 0 ? (
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
                {followingLoading ? (
                  <div>Loading...</div>
                ) : followingUsers.length === 0 ? (
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
          {currentUserId && user._id !== currentUserId && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`mt-2 px-4 py-1 rounded text-white transition ${isFollowing ? "bg-gray-400 hover:bg-gray-500" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              {followLoading
                ? isFollowing
                  ? "Unfollowing..."
                  : "Following..."
                : isFollowing
                ? "Unfollow"
                : "Follow"}
            </button>
          )}
        </div>
        <h2 className="text-xl font-semibold mb-2">Posts</h2>
        {posts.length === 0 ? (
          <div>No posts yet.</div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={{ ...post, media: post.media || [], likes: post.likes || [] }} />
          ))
        )}
      </div>
    </ProtectedRoute>
  );
} 