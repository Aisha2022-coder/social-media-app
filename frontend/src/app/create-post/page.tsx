"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/Toast";
import Image from "next/image";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMedia(files);
    setMediaPreview(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const axios = (await import("@/lib/axios")).default;
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      for (const file of media) {
        formData.append("media", file);
      }
      await axios.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setTitle("");
      setDescription("");
      setMedia([]);
      setMediaPreview([]);
      showToast("Post created successfully!", "success");
    } catch {
      setError("Failed to create post. Please try again.");
      showToast("Failed to create post.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-extrabold text-indigo-700 text-center">Create Post</h1>
        <p className="text-gray-500 text-center">Share your thoughts, photos, or videos with the community</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm text-base"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="What's on your mind?"
            className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm text-base min-h-[100px] resize-none"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">Media (optional)</label>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={handleMediaChange}
            />
            {mediaPreview.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                {mediaPreview.map((preview, idx) => (
                  media[idx]?.type.startsWith("image/") ? (
                    <Image key={idx} src={preview} alt="Preview" className="max-h-32 rounded-xl border shadow" width={128} height={128} />
                  ) : (
                    <video key={idx} src={preview} controls className="max-h-32 rounded-xl border shadow" />
                  )
                ))}
              </div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </form>
      </div>
    </div>
  );
} 