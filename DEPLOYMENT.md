# 🎃 HauntHub - Deployment Guide

## Quick Deploy to Netlify

### Step 1: Push to GitHub
```bash
git add .
git commit -m "HauntHub: Halloween Vintage Booth"
git push origin main
```

### Step 2: Deploy to Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Select GitHub → Choose haunthub repository
4. Click "Deploy site"

**Your site is live in 2-3 minutes!** 🚀

---

## Alternative Deployment Options

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Docker
```bash
docker build -t haunthub:latest .
docker run -p 3000:3000 haunthub:latest
```

---

## Features

✅ Upload image & select spirit  
✅ Possession phase with effects  
✅ Costume generation  
✅ 4 sticker variants (B&W, Dark, Light, Normal)  
✅ 4 mini-games with difficulty controls  
✅ Angel/Devil mode toggle  
✅ Responsive design  

---

## Build Info

- Production build: `dist/` folder
- CSS: 51.15 kB (gzipped: 8.82 kB)
- JavaScript: 217.81 kB (gzipped: 71 kB)
- Ready for production

---

For more details, see README.md
