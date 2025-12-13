# Deployment Guide: InstaSaver

This guide will walk you through hosting your application for free using **Vercel** (for the frontend) and **Render** (for the backend).

## Prerequisites

1.  **GitHub Account:** You need a GitHub account to host your code.
2.  **Git Installed:** Make sure git is installed on your computer.

---

## Step 1: Push Your Code to GitHub

1.  Create a new repository on [GitHub](https://github.com/new) (e.g., `instasaver-app`).
2.  Open your terminal in the project folder (`c:\Users\shanm\Downloads\New folder`) and run:

    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/instasaver-app.git
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` with your actual GitHub username)*

---

## Step 2: Deploy Backend (Render)

We will use Render to host the Python backend because it supports the necessary system libraries (like ffmpeg) easier than Vercel does for free.

1.  **Sign Up/Login:** Go to [render.com](https://render.com) and log in with GitHub.
2.  **New Web Service:** Click **"New +"** -> **"Web Service"**.
3.  **Connect Repo:** Select your `instasaver-app` repository.
4.  **Configure Settings:**
    *   **Name:** `instasaver-backend` (or similar)
    *   **Region:** Choose the one closest to you (e.g., Singapore, Oregon).
    *   **Branch:** `main`
    *   **Root Directory:** `backend` (Important!)
    *   **Runtime:** `Python 3`
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
    *   **Instance Type:** **Free**
5.  **Environment Variables (Optional):**
    *   If you have a `cookies.txt` file, you might need to add it differently or commit it to your repo (beware of security). For this app, simply ensuring `cookies.txt` is in the `backend` folder in GitHub is the easiest way for now.
6.  **Deploy:** Click **Create Web Service**.
7.  **Wait:** It will take a few minutes. Once done, copy the URL provided (e.g., `https://instasaver-backend.onrender.com`).
    *   *Note: The free tier spins down after inactivity, so the first request might take 50 seconds to load.*

---

## Step 3: Deploy Frontend (Vercel)

1.  **Sign Up/Login:** Go to [vercel.com](https://vercel.com) and log in with GitHub.
2.  **Add New Project:** Click **"Add New..."** -> **"Project"**.
3.  **Import Repo:** Find your `instasaver-app` repo and click **Import**.
4.  **Configure Project:**
    *   **Framework Preset:** `Vite` (It should detect this automatically).
    *   **Root Directory:** Click "Edit" and select `frontend`.
5.  **Environment Variables:**
    *   Expand the "Environment Variables" section.
    *   **Key:** `VITE_API_URL`
    *   **Value:** Paste your Render Backend URL from Step 2 (e.g., `https://instasaver-backend.onrender.com`). **Do not add a trailing slash.**
6.  **Deploy:** Click **Deploy**.
7.  **Done!** Vercel will build your site and give you a live URL (e.g., `https://instasaver-app.vercel.app`).

---

## Troubleshooting

*   **Backend Error 500 / Extraction Failed:**
    *   Check the Render logs.
    *   Ensure `cookies.txt` is present in the server if required for the specific link.
*   **CORS Error (Frontend can't verify):**
    *   Only if you changed the CORS settings in `main.py`. Currently, it allows all (`*`), so it should work immediately.
