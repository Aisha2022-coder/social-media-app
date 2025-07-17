"use client";
import React, { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";

export default function TimelinePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  useEffect(() => {
    fetchTimeline(1, true);
  }, []);

  const fetchTimeline = async (pageNum = 1, initial = false) => {
    if (!initial) setLoadingMore(true);
    try {
      const axios = (await import("@/lib/axios")).default;
      const res = await axios.get(`/posts/timeline?page=${pageNum}&limit=10`);
      if (res.data.length < 10) setHasMore(false);
      setPosts(prev => initial ? res.data : [...prev, ...res.data]);
    } catch {
      if (initial) setPosts([]);
    } finally {
      if (initial) setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTimeline(nextPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-8 px-2">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold text-indigo-700 mb-4 text-center">Timeline</h1>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-lg">No posts yet. Follow users or create a post to see your timeline!</div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard key={post._id} post={post} onOpenDetail={() => setSelectedPost(post)} />
            ))}
            {hasMore && (
              <button
                className="mx-auto mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            )}
          </>
        )}
        {selectedPost && (
          <PostCard
            post={selectedPost}
            isModal
            onCloseDetail={() => setSelectedPost(null)}
          />
        )}
      </div>
    </div>
  );
} 