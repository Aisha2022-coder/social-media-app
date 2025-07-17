"use client";
import React, { useEffect, useState, use as usePromise } from "react";
import Avatar from "@/components/Avatar";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";
import { User, Post } from "@/types/social";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = usePromise(params);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState<null | "followers" | "following">(null);
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const router = useRouter();

  const handleOpenModal = async (type: "followers" | "following") => {
    setShowModal(type);
    setModalLoading(true);
    try {
      const axios = (await import("@/lib/axios")).default;
      const ids = (user?.[type] || []).join(",");
      if (!ids) {
        setModalUsers([]);
      } else {
        const res = await axios.get(`/users/by-ids?ids=${ids}`);
        setModalUsers(res.data);
      }
    } catch {
      setModalUsers([]);
    }
    setModalLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(null);
    setModalUsers([]);
  };

  const handleEditProfile = () => {
    setEditUsername(user?.username || "");
    setEditError("");
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const axios = (await import("@/lib/axios")).default;
      const res = await axios.patch("/users/me", { username: editUsername });
      setUser(res.data);
      setEditModalOpen(false);
    } catch (err: any) {
      setEditError(err?.response?.data?.message || "Failed to update username");
    }
    setEditLoading(false);
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const axios = (await import("@/lib/axios")).default;
        const userRes = await axios.get(`/users/${unwrappedParams.id}`);
        setUser(userRes.data);
        const postsRes = await axios.get(`/users/${unwrappedParams.id}/posts`);
        setPosts(postsRes.data);
      } catch (err: any) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [unwrappedParams.id]);

  return (
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
                  <div className="text-center cursor-pointer" onClick={() => handleOpenModal("followers") }>
                    <div className="font-bold text-indigo-700 text-lg">{user.followers ? user.followers.length : 0}</div>
                    <div className="text-xs text-gray-400">Followers</div>
                  </div>
                  <div className="text-center cursor-pointer" onClick={() => handleOpenModal("following") }>
                    <div className="font-bold text-indigo-700 text-lg">{user.following ? user.following.length : 0}</div>
                    <div className="text-xs text-gray-400">Following</div>
                  </div>
                </div>
                <Button className="mt-4 w-32" variant="primary" onClick={handleEditProfile}>Edit Profile</Button>
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
          {showModal && (
            <Modal title={showModal === "followers" ? "Followers" : "Following"} onClose={handleCloseModal}>
              {modalLoading ? (
                <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>
              ) : modalUsers.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No users found.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {modalUsers.map(u => (
                    <li key={u._id} className="flex items-center gap-3 py-3">
                      <Avatar username={u.username} size={40} />
                      <span className="font-medium text-gray-800">{u.username}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Modal>
          )}
          {editModalOpen && (
            <Modal title="Edit Profile" onClose={() => setEditModalOpen(false)}>
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                <label className="font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  className="border rounded px-3 py-2"
                  required
                />
                {editError && <div className="text-red-500 text-sm">{editError}</div>}
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition font-semibold"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save"}
                </button>
              </form>
            </Modal>
          )}
          </>
        ) : (
          <div className="text-center text-gray-400 py-12 text-lg">User not found.</div>
        )}
      </div>
    </div>
  );
} 