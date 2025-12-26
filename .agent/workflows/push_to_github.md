---
description: How to push this project to GitHub
---

# Push to GitHub

Since `git` is not currently installed on your system, you first need to install it.

## 1. Install Git
Download and install Git from [git-scm.com](https://git-scm.com/downloads).
During installation, make sure to select "Git from the command line and also from 3rd-party software".

After installing, **restart your terminal/VS Code** to make sure the command is recognized.

## 2. Initialize and Commit
Run the following commands in your project root (`d:\voice_journal`):

```bash
git init
git add .
git commit -m "Initial commit"
```

## 3. Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Copy the URL of your new repository (e.g., `https://github.com/yourusername/voice-journal.git`).
3. Run:

```bash
git branch -M main
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```
