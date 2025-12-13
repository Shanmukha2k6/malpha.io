# How to Upload Your Project to GitHub

## Prerequisites
1.  **Git Installed:** Make sure you have Git installed on your computer.
2.  **GitHub Account:** You need an account at [github.com](https://github.com).

## Step 1: Create a Repository on GitHub
1.  Go to [GitHub.com](https://github.com) and sign in.
2.  Click the **+** icon in the top right and select **New repository**.
3.  **Repository name:** Enter a name (e.g., `instasaver-app`).
4.  **Public/Private:** Choose "Public" (easier for free hosting) or "Private".
5.  **Initialize:** Do **NOT** check "Add a README", ".gitignore", or "license". We want an empty repository.
6.  Click **Create repository**.
7.  Copy the URL provided (it looks like `https://github.com/YOUR_USERNAME/instasaver-app.git`).

## Step 2: Initialize Git Locally
Open your **Command Prompt** or **Terminal** in the project folder (`c:\Users\shanm\Downloads\New folder`) and run these commands one by one:

```bash
# 1. Initialize git
git init

# 2. Add all files to the staging area
git add .

# 3. Commit the files
git commit -m "Initial commit of InstaSaver app"

# 4. Rename the branch to main (best practice)
git branch -M main

# 5. Connect to your GitHub repository
# REPLACE THE URL below with the one you copied in Step 1!
git remote add origin https://github.com/YOUR_USERNAME/instasaver-app.git

# 6. Push your code
git push -u origin main
```

## Common Issues & Fixes
*   **"remote origin already exists":**
    *   Run: `git remote remove origin`
    *   Then try the `git remote add ...` command again.
*   **Authentication Failed:**
    *   GitHub no longer accepts passwords. When it prompts for a password, you might need a **Personal Access Token** or just sign in via the browser pop-up window if using modern Git.

## Step 3: Verify
Go back to your GitHub repository page in the browser and refresh. You should see all your files listed there!
