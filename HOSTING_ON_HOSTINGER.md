
# 🚀 How to Host on Hostinger (Frontend) + Render (Backend)

Since you have **Hostinger**, we will host your React Frontend there.
However, because your Backend requires **FFmpeg** and **Python**, it generally cannot run on standard Hostinger Shared Hosting. We will stick with **Render** for the backend (it's free and better suited for this).

---

## 1️⃣ Deploy Backend (Render)
**Do this first!** You need the backend URL to make the frontend work.

1.  **Push Code to GitHub** (See Step 3 below if not done).
2.  Go to [render.com](https://render.com/).
3.  Create **New Web Service** -> Connect your Repo.
4.  **Root Directory**: `backend`
5.  **Runtime**: Docker
6.  **Deploy**.
7.  **Copy the URL** (e.g., `https://malpha-backend.onrender.com`).

---

## 2️⃣ Deploy Frontend (Hostinger)

1.  **Update Configuration**:
    *   Open `frontend/.env` (create it if missing).
    *   Add: `VITE_API_URL=https://malpha-backend.onrender.com` (Replace with your actual Render URL).

2.  **Build the Project**:
    *   Open terminal in `frontend` folder.
    *   Run: `npm run build`
    *   This creates a `dist` folder with your website files.

3.  **Upload to Hostinger**:
    *   Log in to **Hostinger hPanel**.
    *   Go to **File Manager** -> `public_html`.
    *   **Delete default files** (like default.php).
    *   **Upload contents of `dist` folder**:
        *   Take all files *inside* `frontend/dist` (`index.html`, `assets` folder, `.htaccess`, etc.) and drag them into `public_html`.
    *   **Important**: Ensure `.htaccess` is uploaded! (I created this for you in `public/` so it should be in `dist/` after build). This makes pages like `/instagram-downloader` work when refreshed.

---

## 3️⃣ Push to GitHub

Run these commands in your project root to save everything to your repository:

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/Shanmukha2k6/malpha.io.git
git push -u origin main
```

---

## 🔍 Troubleshooting Hostinger
*   **404 on Refresh**: If you go to a page and refresh and get a 404, it means the `.htaccess` file is missing. Check Step 2.
*   **Backend Error**: If the download doesn't start, check the Console (F12). If it says "Connection Refused", your Backend URL in `.env` might be wrong or the backend is sleeping (give it 1 minute to wake up).

