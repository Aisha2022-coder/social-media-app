"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import { useRef } from "react";

export default function CreatePostPage() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setMediaFiles(files);
    setMediaPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleRemoveMedia = (index: number) => {
    const newFiles = [...mediaFiles];
    const newPreviews = [...mediaPreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      mediaFiles.forEach(file => {
        formData.append("media", file);
      });
      await axios.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Post created!", "success");
      router.push("/timeline");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to create post.", "error");
    } finally {
      setLoading(false);
      setMediaFiles([]);
      setMediaPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <div className="flex justify-center items-center h-screen"><Spinner size={48} /></div>
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-white p-2 sm:p-4">
          <div className="w-full max-w-md space-y-4 border p-4 sm:p-6 rounded-xl shadow-sm bg-white">
            <h2 className="text-2xl font-semibold">Create a Post</h2>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
            <Input
              id="title"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
            />
            <label htmlFor="description" className="block text-sm font-medium mb-1 mt-2">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded p-2 min-h-[80px]"
            />
            <label htmlFor="media" className="block text-sm font-medium mb-1 mt-2">Media (image, video, or GIF, up to 5 files)</label>
            <div className="flex gap-2 items-center">
              {/* Hidden file input */}
              <input
                id="media"
                name="media"
                type="file"
                accept="image/*,video/*,.gif"
                ref={fileInputRef}
                onChange={handleMediaChange}
                className="hidden"
                multiple
                aria-label="Select media files"
              />
              {/* Custom button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 focus:outline-none"
                aria-label="Choose Files"
              >
                Choose Files
              </button>
              {/* File name display */}
              <div className="flex-1 min-w-0 bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm truncate">
                {mediaFiles.length > 0
                  ? mediaFiles.map(f => f.name).join(", ")
                  : "No file chosen"}
              </div>
            </div>
            {mediaPreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {mediaPreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    {mediaFiles[idx] && mediaFiles[idx].type.startsWith("image/") ? (
                      <img src={preview} alt="Preview" className="max-h-32 rounded w-full object-cover" />
                    ) : mediaFiles[idx] && mediaFiles[idx].type.startsWith("video/") ? (
                      <video src={preview} controls className="max-h-32 rounded w-full object-cover" />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 focus:outline-none"
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button onClick={handleSubmit} disabled={loading} className="w-full" aria-label="Create Post">
              {loading ? "Posting..." : "Create Post"}
            </Button>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
} 