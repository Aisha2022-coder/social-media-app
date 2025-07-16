# Social Media App

A full-stack social media web application built for the SDE Internship Assessment, featuring authentication, post creation with media uploads, following/unfollowing users, and a personalized timeline.  
Built with **NestJS**, **Next.js (App Router)**, **MongoDB**, **Cloudinary**, and **shadcn/ui**.

---

## 🧱 Tech Stack

### Backend
- **NestJS** (Node.js framework)
- **MongoDB** (with Mongoose ODM)
- **JWT** Authentication (Passport.js)
- **Cloudinary** (for media storage and optimization)
- **Multer** (for file uploads)

### Frontend
- **Next.js** (App Router)
- **shadcn/ui** (UI components)
- **Tailwind CSS**
- **Axios** (API requests)
- **jwt-decode** (JWT handling)

---

## ✨ Features

- **User Authentication**
  - Signup & Login with JWT
  - Password hashing (bcrypt)
  - Route protection with Passport-JWT

- **User Profiles**
  - View user profiles
  - Upload profile pictures (stored on Cloudinary)

- **Follow/Unfollow**
  - Follow and unfollow other users
  - Followers and following lists

- **Post Creation**
  - Authenticated users can create posts with text and media
  - Support for images and videos (stored on Cloudinary)
  - Media optimization and transformation

- **Timeline Feed**
  - See posts from users you follow, sorted by newest first
  - Display media content with optimized loading

- **Suggested Users**
  - Get suggestions for new users to follow

- **Clean UI**
  - Responsive, modern design using shadcn/ui and Tailwind CSS
  - Optimized image loading with Next.js Image component

---

## 📁 Folder Structure

```
social-media-app/
  backend/      # NestJS API (users, auth, posts, feed)
    src/
      auth/
      users/
      posts/
      feed/
      config/
        cloudinary.ts  # Cloudinary configuration
      main.ts
  frontend/     # Next.js (App Router)
    src/
      app/
        login/
        signup/
        timeline/
        create-post/
        profile/
      components/
        PostCard.tsx
        Navbar.tsx
        ...
      lib/
        axios.ts
        utils.ts
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Aisha2022-coder/social-media-app.git
cd social-media-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

- Create a `.env` file in `backend/`:

  ```
  MONGODB_URI=mongodb://localhost:27017/social-media
  JWT_SECRET=your_jwt_secret
  JWT_EXPIRATION=1h
  CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
  CLOUDINARY_API_KEY=your_cloudinary_api_key
  CLOUDINARY_API_SECRET=your_cloudinary_api_secret
  ```

- Start the backend server:

  ```bash
  npm run start:dev
  ```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npx shadcn-ui@latest init
```

- Create a `.env.local` file in `frontend/`:

  ```
  NEXT_PUBLIC_API_URL=http://localhost:5000
  ```

- Start the frontend server:

  ```bash
  npm run dev
  ```

### 4. Cloudinary Setup

1. **Create a Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com) and sign up
   - Get your Cloud Name, API Key, and API Secret from the dashboard

2. **Configure Environment Variables**
   - Add your Cloudinary credentials to the backend `.env` file
   - The app will automatically create a `social-media-app` folder in your Cloudinary account

3. **Media Upload Features**
   - Profile pictures are uploaded to Cloudinary
   - Post media (images/videos) are stored and optimized on Cloudinary
   - Automatic image transformations (resize, crop) are applied

### 5. Open in Browser

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000) (or your configured port)

---

## 🧪 Testing

- Use Postman or Thunder Client to test backend APIs.
- Test frontend flows: login, signup, timeline, create post with media, follow/unfollow.
- Test media uploads: profile pictures and post media.

---

## ✅ Submission Checklist

- [x] Backend: JWT auth, MongoDB, Cloudinary integration, all APIs
- [x] Frontend: Auth, timeline, post creation with media, follow/unfollow
- [x] Clean UI with shadcn/ui
- [x] Media upload and optimization with Cloudinary
- [x] All features tested and demo-ready

---

## 📄 License

This project is for educational/demo purposes.

---

**Feel free to fork, star, or contribute!**

