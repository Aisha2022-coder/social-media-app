import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    return {
      folder: 'social-media-app',
      allowed_formats: [
        'jpg', 'jpeg', 'png', 'webp', 'gif',
        'mp4', 'mov', 'avi', 'webm', 'mkv',
      ],
      resource_type: 'auto',
      ...(isImage && { transformation: [{ width: 800, height: 800, crop: 'limit' }] }),
    };
  },
});
