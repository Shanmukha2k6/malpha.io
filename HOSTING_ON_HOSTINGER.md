# Deploying to Hostinger

Since you have **Hostinger Premium Web Hosting**, you have a specific setup.

## 🛑 Important Restriction
Hostinger **Premium Web Hosting** (Shared Hosting) is designed for **PHP/Static** sites. It does **NOT** easily support long-running Python servers (like your backend) because you cannot run a persistent process (like `uvicorn`) or bind to custom ports.

**The Solution:** Use a **Hybrid Approach**.
1.  **Frontend:** Host on **Hostinger** (It's fast and uses your domain).
2.  **Backend:** Host on **Render** (Free) or a separate **Hostinger VPS** (if you want to pay for a VPS).

---

## Part 1: Deploy the Backend (Render)
*Do this first so you have a backend URL.*

1.  Follow the **Render** steps in the `DEPLOYMENT_GUIDE_FINAL.md`.
2.  Get your backend URL (e.g., `https://instasaver-backend.onrender.com`).
3.  **Note:** This is free and easiest. If you really want it on Hostinger, you must upgrade to a **VPS Plan** (Standard Web Hosting won't work).

---

## Part 2: Deploy the Frontend (Hostinger)

### 1. Prepare for Production
1.  Open your project in VS Code.
2.  Open `frontend/.env.local` (create it if missing).
3.  Add your Backend URL:
    ```
    VITE_API_URL=https://instasaver-backend.onrender.com
    ```
    *(Replace with your actual Render URL)*

### 2. Build the Project
1.  Open terminal in VS Code:
    ```powershell
    cd frontend
    npm run build
    ```
2.  This generates a `dist` folder in `frontend/dist`. These are your production files.

### 3. Upload to Hostinger
1.  Log in to your **Hostinger hPanel**.
2.  Go to **File Manager**.
3.  Navigate to `public_html`.
    *   *If you want it on a subdomain (e.g., `app.domain.com`), navigate there.*
4.  **Delete** the default `default.php` if present.
5.  **Upload** all files from your local `frontend/dist` folder to `public_html`.
    *   You should see `index.html` and an `assets` folder in `public_html`.

### 4. Fix Routing (Critical for React)
Since this is a Single Page App (SPA), refreshing the page on sub-pages (like `/instagram-downloader`) will give a 404 error unless you fix it.

1.  In Hostinger File Manager (`public_html`), create a new file named `.htaccess`.
2.  Paste this code inside:

    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteCond %{REQUEST_FILENAME} !-l
      RewriteRule . /index.html [L]
    </IfModule>
    ```
3.  Save the file.

### 5. Done!
Visit your domain. Your frontend is served by Hostinger, and it quietly talks to the secure backend on Render.
