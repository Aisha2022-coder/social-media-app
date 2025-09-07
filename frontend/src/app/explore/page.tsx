"use client";
import React, { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Post, User } from "@/types/social";
import Modal from "@/components/Modal";

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [suggested, setSuggested] = useState<User[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const [following, setFollowing] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  const fetchPosts = async (pageNum = 1, initial = false) => {
    if (!initial) setLoadingMore(true);
    try {
      const axios = (await import("@/lib/axios")).default;
      const res = await axios.get(`/posts?page=${pageNum}&limit=10`);
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
    fetchPosts(nextPage);
  };

  useEffect(() => {
    async function fetchSuggested() {
      setSuggestedLoading(true);
      try {
        const axios = (await import("@/lib/axios")).default;
        const res = await axios.get("/users/suggested");
        setSuggested(res.data);
      } catch {
        setSuggested([]);
      } finally {
        setSuggestedLoading(false);
      }
    }
    fetchSuggested();
  }, []);

  useEffect(() => {
    async function fetchMe() {
      try {
        const axios = (await import("@/lib/axios")).default;
        const res = await axios.get("/users/me");
        setFollowing(res.data.following || []);
      } catch {
        setFollowing([]);
      }
    }
    fetchMe();
  }, []);

  const handleFollow = async (userIdToFollow: string) => {
    setFollowLoading(userIdToFollow);
    try {
      const axios = (await import("@/lib/axios")).default;
      await axios.post(`/users/${userIdToFollow}/follow`);
      setFollowing((prev) => [...prev, userIdToFollow]);
    } catch {
    }
    setFollowLoading(null);
  };

  const handleUnfollow = async (userIdToUnfollow: string) => {
    setFollowLoading(userIdToUnfollow);
    try {
      const axios = (await import("@/lib/axios")).default;
      await axios.post(`/users/${userIdToUnfollow}/unfollow`);
      setFollowing((prev) => prev.filter((id) => id !== userIdToUnfollow));
    } catch {
    }
    setFollowLoading(null);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleClosePost = () => {
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-8 px-2">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold text-indigo-700 mb-4 text-center">Explore</h1>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-bold text-indigo-700 mb-4">Suggested Users to Follow</h2>
          {suggestedLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : suggested.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No suggested users right now.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {suggested.map((user) => {
                const isFollowing = following.includes(user._id);
                return (
                  <li key={user._id} className="flex items-center gap-4 py-3">
                    <Avatar username={user.username} size={40} />
                    <span className="font-medium text-gray-800 flex-1">{user.username}</span>
                    {isFollowing ? (
                      <Button
                        variant="outline"
                        onClick={() => handleUnfollow(user._id)}
                        disabled={followLoading === user._id}
                      >
                        {followLoading === user._id ? "Unfollowing..." : "Unfollow"}
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => handleFollow(user._id)}
                        disabled={followLoading === user._id}
                      >
                        {followLoading === user._id ? "Following..." : "Follow"}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-lg">No posts to explore yet. Create a post or follow users to see more!</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <div key={post._id} className="hover:scale-[1.025] transition-transform">
                  <PostCard post={post} onOpenDetail={() => handlePostClick(post)} />
                </div>
              ))}
            </div>
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
      </div>
      
      {/* Post Detail Modal */}
      {selectedPost && (
        <PostCard 
          post={selectedPost} 
          isModal={true} 
          onCloseDetail={handleClosePost}
        />
      )}
    </div>
  );
} 