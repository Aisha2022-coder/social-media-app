import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import { Post, User } from "@/types/social";

interface PostCardProps {
  post: Post;
  onOpenDetail?: () => void;
  isModal?: boolean;
  onCloseDetail?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onOpenDetail, isModal = false, onCloseDetail }) => {
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [likeLoading, setLikeLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [detailComments, setDetailComments] = useState<Array<{ _id: string; author: User; text: string; createdAt: string }>>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [likesUsers, setLikesUsers] = useState<User[]>([]);
  const [likesUsersLoading, setLikesUsersLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const axios = (await import("@/lib/axios")).default;
        const res = await axios.get("/users/me");
        setCurrentUserId(res.data._id);
      } catch {
        setCurrentUserId(null);
      }
    })();
  }, []);

  const hasMedia = post.media && post.media.length > 0;
  const hasLiked = currentUserId ? likes.includes(currentUserId) : false;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;
    setLikeLoading(true);
    try {
      const axios = (await import("@/lib/axios")).default;
      const res = await axios.post(`/posts/${post._id}/like`);
      if (res.data.liked) {
        setLikes(prev => [...prev, currentUserId]);
      } else {
        setLikes(prev => prev.filter(id => id !== currentUserId));
      }
    } catch {
      setLikeLoading(false);
    }
  };

  function getMediaUrl(url: string) {
    return url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  }

  // For modal: fetch comments when opened
  useEffect(() => {
    if (isModal) {
      (async () => {
        setDetailLoading(true);
        try {
          const axios = (await import("@/lib/axios")).default;
          const res = await axios.get(`/posts/${post._id}/comments`);
          setDetailComments(res.data);
        } catch {
          setDetailComments([]);
        }
        setDetailLoading(false);
      })();
    }
  }, [isModal, post._id]);

  const openLikesModal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikesUsersLoading(true);
    try {
      const axios = (await import("@/lib/axios")).default;
      const ids = (likes || []).join(",");
      if (!ids) {
        setLikesUsers([]);
      } else {
        const res = await axios.get(`/users/by-ids?ids=${ids}`);
        setLikesUsers(res.data);
      }
    } catch {
      setLikesUsers([]);
    }
    setLikesUsersLoading(false);
  };

  const closeLikesModal = () => {
    setLikesUsers([]);
  };

  // Card view
  if (!isModal) {
    return (
      <div
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-3 w-full max-w-full hover:shadow-2xl transition-shadow cursor-pointer border border-indigo-50"
        onClick={onOpenDetail}
        tabIndex={0}
        role="button"
        aria-label="View post details"
        onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && onOpenDetail) onOpenDetail(); }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Avatar username={typeof post.author === 'string' ? post.author : post.author.username} size={36} />
          <div>
            <span className="font-semibold text-indigo-700 text-base sm:text-lg">{typeof post.author === 'string' ? post.author : post.author.username}</span>
            <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </div>
        {hasMedia && post.media![0].type === "image" && (
          <Image
            src={getMediaUrl(post.media![0].url)}
            alt="Post media"
            className="rounded-xl object-cover w-full max-h-72 mb-2 border"
            width={600}
            height={300}
          />
        )}
        {hasMedia && post.media![0].type === "video" && (
          <video
            src={getMediaUrl(post.media![0].url)}
            controls
            className="rounded-xl object-cover w-full max-h-72 mb-2 border"
          />
        )}
        {hasMedia && post.media![0].type === "gif" && (
          <Image
            src={getMediaUrl(post.media![0].url)}
            alt="Post gif"
            className="rounded-xl object-cover w-full max-h-72 mb-2 border"
            width={600}
            height={300}
          />
        )}
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 break-words">{post.title}</h2>
        <p className="text-gray-700 mb-2 text-sm sm:text-base break-words">{typeof post.description === "string" && post.description.trim() !== "" ? post.description : "No description"}</p>
        <Button
          onClick={handleLike}
          disabled={likeLoading || !currentUserId}
          variant={hasLiked ? "primary" : "outline"}
          leftIcon={<span>{hasLiked ? "♥" : "♡"}</span>}
          className="px-3 py-1 text-sm"
          aria-label={hasLiked ? "Unlike post" : "Like post"}
        >
          <span onClick={openLikesModal} className="underline cursor-pointer mr-1">{likes.length}</span>
        </Button>
        <Button
          variant="secondary"
          leftIcon={<span>💬</span>}
          className="px-3 py-1 text-sm"
        >
          Comment
        </Button>
        <div className="text-xs text-gray-400 break-words">
          {new Date(post.createdAt).toLocaleString()}
        </div>
      </div>
    );
  }

  // Modal view
  return (
    <Modal title="Post Details" onClose={onCloseDetail ?? (() => {})}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <Avatar username={typeof post.author === 'string' ? post.author : post.author.username} size={36} />
          <div>
            <span className="font-semibold text-indigo-700 text-base sm:text-lg">{typeof post.author === 'string' ? post.author : post.author.username}</span>
            <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </div>
        {hasMedia && post.media![0].type === "image" && (
          <Image
            src={getMediaUrl(post.media![0].url)}
            alt="Post media"
            className="rounded-xl object-cover w-full max-h-72 mb-2 border"
            width={600}
            height={300}
          />
        )}
        {hasMedia && post.media![0].type === "video" && (
          <video
            src={getMediaUrl(post.media![0].url)}
            controls
            className="rounded-xl object-cover w-full max-h-72 mb-2 border"
          />
        )}
        {hasMedia && post.media![0].type === "gif" && (
          <Image
            src={getMediaUrl(post.media![0].url)}
            alt="Post gif"
            className="rounded-xl object-cover w-full max-h-72 mb-2 border"
            width={600}
            height={300}
          />
        )}
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 break-words">{post.title}</h2>
        <p className="text-gray-700 mb-2 text-sm sm:text-base break-words">{typeof post.description === "string" && post.description.trim() !== "" ? post.description : "No description"}</p>
        <Button
          onClick={handleLike}
          disabled={likeLoading || !currentUserId}
          variant={hasLiked ? "primary" : "outline"}
          leftIcon={<span>{hasLiked ? "♥" : "♡"}</span>}
          className="px-3 py-1 text-sm"
          aria-label={hasLiked ? "Unlike post" : "Like post"}
        >
          <span onClick={openLikesModal} className="underline cursor-pointer mr-1">{likes.length}</span>
        </Button>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Comments</h3>
          {detailLoading ? (
            <div className="flex justify-center py-4"><div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : detailComments.length === 0 ? (
            <div className="text-gray-400 text-sm">No comments yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {detailComments.map((c) => (
                <li key={c._id} className="py-2 flex items-center gap-2">
                  <Avatar username={c.author?.username || "?"} size={28} />
                  <span className="font-medium text-gray-800">{c.author?.username || "Unknown"}</span>
                  <span className="text-xs text-gray-400 ml-2">{new Date(c.createdAt).toLocaleString()}</span>
                  <span className="ml-2 text-gray-700">{c.text}</span>
                </li>
              ))}
            </ul>
          )}
          <form
            className="flex gap-2 mt-4"
            onSubmit={async e => {
              e.preventDefault();
              if (!currentUserId || !commentText.trim()) return;
              setCommentSubmitting(true);
              try {
                const axios = (await import("@/lib/axios")).default;
                await axios.post(`/posts/${post._id}/comments`, { text: commentText });
                setCommentText("");
                setDetailLoading(true);
                const res = await axios.get(`/posts/${post._id}/comments`);
                setDetailComments(res.data);
                setDetailLoading(false);
              } catch {}
              setCommentSubmitting(false);
            }}
          >
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2 text-sm"
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              disabled={commentSubmitting || !currentUserId}
              maxLength={300}
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition font-semibold text-sm"
              disabled={commentSubmitting || !currentUserId || !commentText.trim()}
            >
              {commentSubmitting ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
        <Modal title="Liked by" onClose={closeLikesModal}>
          {likesUsersLoading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : likesUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No users found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {likesUsers.map(u => (
                <li key={u._id} className="flex items-center gap-3 py-3">
                  <Avatar username={u.username} size={40} />
                  <span className="font-medium text-gray-800">{u.username}</span>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      </div>
    </Modal>
  );
};

export default PostCard; 