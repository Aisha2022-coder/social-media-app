"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import PostCard from "@/components/PostCard";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";

interface Post {
  _id: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  media?: { url: string; type: string }[];
  likes?: string[];
}

export default function TimelinePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || "Failed to load timeline."
        );
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner size={48} /></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-xl w-full mx-auto p-2 sm:p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Timeline</h1>
        {posts.length === 0 ? (
          <EmptyState message="No posts to show. Start following users or create a post!" />
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={{ ...post, media: post.media || [], likes: post.likes || [] }} />
          ))
        )}
      </div>
    </ProtectedRoute>
  );
} 