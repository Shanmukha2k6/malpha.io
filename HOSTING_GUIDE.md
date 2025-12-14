
# 🚀 How to Host Your Website (Malpha.io)

This guide will help you host your **React Frontend** and **FastAPI Backend** for free (or very cheap) using modern cloud platforms.

---

## 🏗️ Architecture Overview

- **Frontend (React)**: Hosted on **Vercel** (Global CDN, fast, free).
- **Backend (FastAPI)**: Hosted on **Render** (Supports Docker & FFmpeg, has a free tier).

---

## 1️⃣ Prerequisite: Push to GitHub

Before hosting, you need to upload your code to GitHub.

1.  Create a new repository on [GitHub](https://github.com/new).
2.  Open your terminal in the project root (`instasaver.site`).
3.  Run these commands:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

---

## 2️⃣ Backend Hosting (Render)

We use Render because your backend needs **FFmpeg** (for video processing), which Vercel Serverless Functions do not easily support. We have created a `Dockerfile` that Render will use automatically.

1.  **Create Account**: Go to [render.com](https://render.com/) and sign up with GitHub.
2.  **New Web Service**:
    *   Click **"New +"** -> **"Web Service"**.
    *   Select **"Build and deploy from a Git repository"**.
    *   Connect your GitHub repository.
3.  **Configure Service**:
    *   **Name**: `malpha-backend`
    *   **Region**: Choose one close to you (e.g., Singapore or Oregon).
    *   **Branch**: `main`
    *   **Root Directory**: `backend` (Important! Tell Render the code is in the backend folder).
    *   **Runtime**: Select **Docker**.
    *   **Instance Type**: **Free**.
4.  **Deploy**: Click **"Create Web Service"**.
    *   Render will read your `Dockerfile`, install FFmpeg and Python dependencies, and start the server.
    *   **Wait**: It may take 5-10 minutes.
    *   **Copy URL**: Once done, you will get a URL like `https://malpha-backend.onrender.com`. **Copy this URL.**

---

## 3️⃣ Frontend Hosting (Vercel)

Now we host the React frontend and connect it to your new Backend URL.

1.  **Create Account**: Go to [vercel.com](https://vercel.com/) and sign up with GitHub.
2.  **Add New Project**:
    *   Click **"Add New..."** -> **"Project"**.
    *   Import your GitHub repository.
3.  **Configure Project**:
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Environment Variables**:
        *   Expand "Environment Variables".
        *   Add a new variable:
            *   **Key**: `VITE_API_URL`
            *   **Value**: `https://malpha-backend.onrender.com` (The URL you copied from Render).
                *   *Note: Do NOT add a trailing slash `/` at the end.*
4.  **Deploy**: Click **"Deploy"**.
    *   Vercel will build your site and give you a live URL (e.g., `https://malpha.vercel.app`).

---

## 4️⃣ Final Verification

1.  Open your new Vercel URL.
2.  Try to download a video.
3.  **Troubleshooting**:
    *   If the backend sleeps (Free tier on Render spins down after inactivity), the first request might take ~50 seconds to verify. This is normal for the free tier. Upgrading to the cheapest paid plan ($7/mo) fixes this.

---

## ✅ Done!
Your site is now live on the internet!
