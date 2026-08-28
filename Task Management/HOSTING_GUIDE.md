# 🌐 Tesseract 1-Click Free Hosting & Mobile Deployment Guide

Tesseract is an installable, 100% offline-first **Progressive Web App (PWA)**. You can host it for free in under 60 seconds with **Zero Server Maintenance**.

---

## ⚡ Option 1: Deploy with Vercel (Recommended - Fastest)

1. **Option A: Drag & Drop (No CLI needed)**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New Project"** → Drag & drop the `webapp` folder.
   - Click **Deploy** — your live link (e.g. `https://tesseract.vercel.app`) is generated in 10 seconds!

2. **Option B: Using Vercel CLI**:
   ```bash
   cd "d:\Antigravity\Task Management\webapp"
   npx vercel
   ```

---

## 🐙 Option 2: Deploy with GitHub Pages (100% Free Forever)

1. Push your repository to GitHub.
2. Go to your repository **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your branch), folder: `/Task Management/webapp` (or root if moved).
4. Click **Save**. In 1–2 minutes, your app is live at `https://<your-username>.github.io/<repo-name>/`.

---

## 📦 Option 3: Deploy with Netlify Drop (Instant Drag & Drop)

1. Open [app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
2. Drag and drop the `webapp` folder into the Netlify drop zone.
3. Your live link is generated instantly!

---

## 📱 How to Install on Your Mobile Phone

Once hosted on your custom URL:

### 🍏 On iPhone / iPad (Safari):
1. Open your link in **Safari**.
2. Tap the **Share** button (the square with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"** (`+`).
4. Tap **Add** in the top right.
5. Tesseract will now launch in full-screen **standalone app mode** directly from your iPhone home screen!

### 🤖 On Android (Chrome / Brave / Edge):
1. Open your link in **Chrome**.
2. Tap the **3 dots menu** (`⋮`) in the top right.
3. Tap **"Install App"** or **"Add to Home Screen"**.
4. The Tesseract icon is added to your app drawer and home screen.

---

## 🔄 Moving Your Data Between Devices (Until Cloud Sync is Active)

- **On PC**: Click the **`Download` (Export JSON)** icon in the left sidebar footer.
- **On Phone**: Send the small `.json` file to your phone (via WhatsApp, Telegram, AirDrop, or Email) → Open Tesseract on phone → Click the **`Upload` (Import JSON)** icon in the sidebar footer!
