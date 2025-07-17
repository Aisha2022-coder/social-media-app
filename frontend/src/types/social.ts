export interface User {
  _id: string;
  username: string;
  email?: string;
  profilePicture?: string;
  followers?: string[];
  following?: string[];
}

export interface Media {
  url: string;
  type: string; // "image" | "video" | "gif" | "other"
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  author: string | User;
  media?: Media[];
  likes: string[];
  createdAt: string;
} 