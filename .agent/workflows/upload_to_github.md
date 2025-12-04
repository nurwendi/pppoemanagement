---
description: How to upload the project to GitHub
---

# Upload to GitHub

Follow these steps to upload your project to GitHub.

## 1. Initialize Git (if not already done)

```bash
// turbo
git init
```

## 2. Configure Git (if needed)

If you haven't configured git on this machine:
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## 3. Stage and Commit Files

```bash
// turbo
git add .
git commit -m "Initial commit"
```

## 4. Create Repository on GitHub

1.  Go to [GitHub.com](https://github.com/new).
2.  Create a new repository (e.g., `user-management`).
3.  **Do not** initialize with README, .gitignore, or License (we already have them).

## 5. Push to GitHub

Replace `YOUR_USERNAME` and `REPO_NAME` with your details:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```
