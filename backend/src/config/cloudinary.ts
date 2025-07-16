import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'social-media-app', // Folder in your Cloudinary account
    allowed_formats: [
      'jpg', 'jpeg', 'png', 'webp', 'gif', // images
      'mp4', 'mov', 'avi', 'webm', 'mkv', // videos
    ],
    resource_type: 'auto', // Allow both images and videos
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  }),
});
