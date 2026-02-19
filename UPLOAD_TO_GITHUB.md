# How to upload AURORA to GitHub

## 1. Create a repo on GitHub

- Go to https://github.com/new
- Repository name: `aurora` (or whatever you want)
- Leave it **empty** (no README, no .gitignore)
- Click **Create repository**

---

## 2. Open Terminal in your project folder

```bash
cd /Users/hassanazeem/Desktop/projects/aurora
```

---

## 3. If this folder is NOT a Git repo yet

```bash
git init
git add .
git commit -m "Initial commit: AURORA red team simulation + Electron"
git remote add origin https://github.com/YOUR_USERNAME/aurora.git
git branch -M main
git push -u origin main
```

Replace **YOUR_USERNAME** with your GitHub username (e.g. `hassanazeem2`).  
Replace **aurora** with your repo name if it’s different.

---

## 4. If it’s already a Git repo and you just want to push

```bash
git add .
git commit -m "Update AURORA project"
git push -u origin main
```

If `origin` is wrong, fix it:

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/aurora.git
git push -u origin main
```

---

## 5. If push fails with “Large files”

The project already has a `.gitignore` so `node_modules` and `venv` are not committed.  
If you still see a “file too large” error, run:

```bash
git rm -r --cached frontend/node_modules
git rm -r --cached venv
git rm -r --cached frontend/.next
git add .
git commit --amend -m "Initial commit: AURORA red team simulation + Electron"
git push -u origin main --force
```

---

## One-line copy-paste (after creating the repo)

Replace `YOUR_USERNAME` and `aurora`, then run:

```bash
cd /Users/hassanazeem/Desktop/projects/aurora && git remote remove origin 2>/dev/null; git remote add origin https://github.com/YOUR_USERNAME/aurora.git && git add . && git status
```

Then, if you have new changes to commit:

```bash
git commit -m "Update AURORA" && git push -u origin main
```

If you haven’t committed yet:

```bash
git init && git add . && git commit -m "Initial commit: AURORA" && git branch -M main && git push -u origin main
```
