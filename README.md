# Social Media App

A full-stack social media web application built for the SDE Internship Assessment, featuring authentication, post creation, following/unfollowing users, and a personalized timeline.  
Built with **NestJS**, **Next.js (App Router)**, **MongoDB**, and **shadcn/ui**.

---

## 🧱 Tech Stack

### Backend
- **NestJS** (Node.js framework)
- **MongoDB** (with Mongoose ODM)
- **JWT** Authentication (Passport.js)
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
  - Upload profile pictures

- **Follow/Unfollow**
  - Follow and unfollow other users
  - Followers and following lists

- **Post Creation**
  - Authenticated users can create posts (title, description)
  - Posts linked to user profiles

- **Timeline Feed**
  - See posts from users you follow, sorted by newest first

- **Suggested Users**
  - Get suggestions for new users to follow

- **Clean UI**
  - Responsive, modern design using shadcn/ui and Tailwind CSS

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
      main.ts
    uploads/    # Profile pictures & post images
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

- Start the frontend server:

  ```bash
  npm run dev
  ```

### 4. Open in Browser

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000) (or your configured port)

---

## 🧪 Testing

- Use Postman or Thunder Client to test backend APIs.
- Test frontend flows: login, signup, timeline, create post, follow/unfollow.

---

## ✅ Submission Checklist

- [x] Backend: JWT auth, MongoDB, all APIs
- [x] Frontend: Auth, timeline, post creation, follow/unfollow
- [x] Clean UI with shadcn/ui
- [x] All features tested and demo-ready

---

## 📄 License

This project is for educational/demo purposes.

---

**Feel free to fork, star, or contribute!**

