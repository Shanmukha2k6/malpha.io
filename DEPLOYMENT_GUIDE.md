
# 🚀 Hostinger / Vercel Deployment Guide (Frontend Only)

Great news! We have completely removed the backend requirement.
Your website is now **100% Frontend (Client-Side)**.
It uses the public **Cobalt API** to fetch video links directly.

This means you can host it on:
- **Hostinger** (Shared Hosting, VPS, or Website Builder)
- **Vercel**
- **Netlify**
- **GitHub Pages**
...or any static file host!

---

## 1️⃣ Build the Project

1.  Open your terminal in the `frontend` folder.
2.  Run these commands:
    ```bash
    npm install
    npm run build
    ```
3.  This will create a `dist` folder. This folder contains your **entire website**.

---

## 2️⃣ Deploy to Hostinger

1.  Log in to your **Hostinger hPanel**.
2.  Go to **File Manager** -> `public_html`.
3.  **Delete** the default files (like `default.php`).
4.  **Upload the CONTENTS of the `dist` folder**:
    *   Open the `frontend/dist` folder on your computer.
    *   Select ALL files (including `index.html`, `assets`, and `.htaccess`).
    *   Drag and drop them into Hostinger's `public_html`.

**Important**: Make sure the `.htaccess` file is uploaded! It handles the routing so pages like `/instagram-downloader` work when refreshed.

---

## 3️⃣ Push to GitHub (Optional)

If you want to save your code:

```bash
git add .
git commit -m "Converted to Frontend-Only architecture"
git push origin main
```

---

## ❓ FAQ

**Q: Do I need to run the Python backend?**
A: **NO.** You can delete the `backend` folder. It is no longer used.

**Q: Which API is it using?**
A: It is using `https://api.cobalt.tools`, a free and privacy-friendly API that supports Instagram, Facebook, TikTok, etc.

**Q: Why doesn't it download automatically?**
A: Browsers block automatic downloads from different domains. The app will try to download, but if blocked, it will open the video in a new tab where you can right-click -> "Save Video As".
