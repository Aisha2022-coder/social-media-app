import React, { useState, useEffect } from "react";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import axios from "@/lib/axios";
import { useToast } from "@/components/Toast";

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    description: string;
    author: string;
    createdAt: string;
    media?: { url: string; type: string }[];
    likes?: string[]; // array of user IDs
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [likeLoading, setLikeLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const { showToast } = useToast ? useToast() : { showToast: () => {} };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await axios.get(`/posts/${post._id}/comments`);
      setComments(res.data);
    } catch {
      setComments([]);
    }
    setCommentsLoading(false);
  };

  useEffect(() => {
    if (showDetail) fetchComments();
  }, [showDetail]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUserId) return;
    setCommentSubmitting(true);
    try {
      await axios.post(`/posts/${post._id}/comments`, { text: commentText });
      setCommentText("");
      fetchComments();
      showToast && showToast("Comment added!", "success");
    } catch {
      showToast && showToast("Failed to add comment.", "error");
    }
    setCommentSubmitting(false);
  };

  useEffect(() => {
    axios.get("/users/me").then(res => setCurrentUserId(res.data._id)).catch(() => setCurrentUserId(null));
  }, []);

  const hasMedia = post.media && post.media.length > 0;
  const hasLiked = currentUserId ? likes.includes(currentUserId) : false;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;
    setLikeLoading(true);
    try {
      const res = await axios.post(`/posts/${post._id}/like`);
      if (res.data.liked) {
        setLikes(prev => [...prev, currentUserId]);
      } else {
        setLikes(prev => prev.filter(id => id !== currentUserId));
      }
    } catch {}
    setLikeLoading(false);
  };

  return (
    <div
      className="border rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-lg transition-shadow bg-white w-full cursor-pointer"
      onClick={() => setShowDetail(true)}
      tabIndex={0}
      role="button"
      aria-label="View post details"
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setShowDetail(true); }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <Avatar username={post.author} size={28} />
        <span className="font-semibold text-base sm:text-lg">{post.author}</span>
      </div>
      {hasMedia && post.media![0].type === "image" && (
        <img
          src={`http://localhost:3000${post.media![0].url}`}
          alt="Post media"
          className="max-h-64 w-full object-contain rounded mb-2"
        />
      )}
      {hasMedia && post.media![0].type === "video" && (
        <video
          src={`http://localhost:3000${post.media![0].url}`}
          controls
          className="max-h-64 w-full object-contain rounded mb-2"
        />
      )}
      {hasMedia && post.media![0].type === "gif" && (
        <img
          src={`http://localhost:3000${post.media![0].url}`}
          alt="Post gif"
          className="max-h-64 w-full object-contain rounded mb-2"
        />
      )}
      <h2 className="text-base sm:text-lg font-semibold">{post.title}</h2>
      <p className="text-gray-700 mb-2 text-sm sm:text-base">{post.description}</p>
      <div className="flex items-center gap-3 mt-2 mb-1">
        <button
          onClick={handleLike}
          disabled={likeLoading || !currentUserId}
          className={`flex items-center gap-1 px-2 py-1 rounded transition text-sm ${hasLiked ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
          aria-label={hasLiked ? "Unlike post" : "Like post"}
        >
          <span>{hasLiked ? "♥" : "♡"}</span>
          <span>{likes.length}</span>
        </button>
      </div>
      <div className="text-xs text-gray-500">
        {new Date(post.createdAt).toLocaleString()}
      </div>
      {showDetail && (
        <Modal title="Post Details" onClose={() => setShowDetail(false)}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Avatar username={post.author} size={32} />
              <span className="font-semibold text-lg">{post.author}</span>
            </div>
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p className="text-gray-700 mb-2">{post.description}</p>
            <div className="text-xs text-gray-500 mb-2">
              {new Date(post.createdAt).toLocaleString()}
            </div>
            {hasMedia && (
              <div>
                <div className="flex gap-2 mb-2 justify-center">
                  {post.media!.map((m, idx) => (
                    <button
                      key={idx}
                      className={`border rounded p-1 ${activeMediaIdx === idx ? 'border-blue-500' : 'border-gray-300'}`}
                      onClick={e => { e.stopPropagation(); setActiveMediaIdx(idx); }}
                      aria-label={`Show media ${idx + 1}`}
                    >
                      {m.type === "image" || m.type === "gif" ? (
                        <img src={`http://localhost:3000${m.url}`} alt="thumb" className="h-10 w-10 object-cover rounded" />
                      ) : m.type === "video" ? (
                        <video src={`http://localhost:3000${m.url}`} className="h-10 w-10 object-cover rounded" />
                      ) : null}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  {post.media![activeMediaIdx].type === "image" || post.media![activeMediaIdx].type === "gif" ? (
                    <img
                      src={`http://localhost:3000${post.media![activeMediaIdx].url}`}
                      alt="Post media large"
                      className="max-h-80 w-full object-contain rounded"
                    />
                  ) : post.media![activeMediaIdx].type === "video" ? (
                    <video
                      src={`http://localhost:3000${post.media![activeMediaIdx].url}`}
                      controls
                      autoPlay
                      className="max-h-80 w-full object-contain rounded"
                    />
                  ) : null}
                </div>
              </div>
            )}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Comments</h3>
              {commentsLoading ? (
                <div className="text-gray-500 text-sm">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-gray-400 text-sm">No comments yet.</div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {comments.map((c, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Avatar username={c.author?.username || "?"} size={28} />
                      <div>
                        <div className="font-semibold">{c.author?.username || "Unknown"}</div>
                        <div>{c.text}</div>
                        <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  disabled={commentSubmitting || !currentUserId}
                  aria-label="Add a comment"
                />
                <button
                  type="submit"
                  disabled={commentSubmitting || !commentText.trim() || !currentUserId}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                  aria-label="Submit comment"
                >
                  {commentSubmitting ? "..." : "Post"}
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PostCard; 