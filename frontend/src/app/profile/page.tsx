"use client";
import React, { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MyProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userRes = await (await import("@/lib/axios")).default.get("/users/me");
        setUser(userRes.data);
        // Fetch posts for this user
        const postsRes = await (await import("@/lib/axios")).default.get(`/users/${userRes.data._id}/posts`);
        setPosts(postsRes.data);
      } catch (err: any) {
        // If error is 401, axios will redirect, so just show spinner
        if (err?.response?.status === 401) {
          setError(null);
        } else {
          setError("User not found.");
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-8 px-2">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : user ? (
            <>
              <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col sm:flex-row items-center gap-6">
                <Avatar username={user.username} size={96} />
                <div className="flex-1 flex flex-col gap-2 items-center sm:items-start">
                  <h1 className="text-2xl font-extrabold text-indigo-700">{user.username}</h1>
                  <p className="text-gray-500 text-center sm:text-left">{user.bio}</p>
                  <div className="flex gap-4 mt-2">
                    <div className="text-center">
                      <div className="font-bold text-indigo-700 text-lg">{user.followers}</div>
                      <div className="text-xs text-gray-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-indigo-700 text-lg">{user.following}</div>
                      <div className="text-xs text-gray-400">Following</div>
                    </div>
                  </div>
                  <Button className="mt-4 w-32" variant="primary">Edit Profile</Button>
                </div>
              </div>
              <div className="mt-8">
                <h2 className="text-xl font-bold text-indigo-700 mb-4">Posts</h2>
                {posts.length === 0 ? (
                  <div className="text-center text-gray-400 py-12 text-lg">No posts yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {posts.map(post => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : error ? (
            <div className="text-center text-gray-400 py-12 text-lg">{error}</div>
          ) : (
            // If no user and no error, show spinner (likely redirecting)
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 