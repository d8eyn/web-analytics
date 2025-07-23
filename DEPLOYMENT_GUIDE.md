# 🚀 UMNTR Web Analytics Deployment Guide

## 📁 Simple Next.js Setup

This project uses a **clean Next.js architecture** where all files live directly in the dashboard project for maximum simplicity.

### 🎯 File Structure
```
dashboard/
├── public/
│   └── script.js            # 🎯 UMNTR Tracking Script
├── pages/api/
│   └── track.js             # 🛡️ Enhanced API Endpoint
└── pages/
    └── index.tsx            # 📊 Analytics Dashboard
```

## ✅ How It Works

1. **Tracking script** is a static file in `public/`
2. **API endpoint** is a Next.js API route
3. **Dashboard** is the main Next.js application
4. **Everything deploys together** as a single Next.js project

## 🛠️ Management Commands

```bash
# Verify files exist
npm run verify

# Build for deployment
npm run build

# Run in development
npm run dev

# Start production server
npm start
```

## 🌐 Deployment Endpoints

After deploying to Vercel:

```
https://your-dashboard.vercel.app/                    # 📊 Analytics Dashboard
https://your-dashboard.vercel.app/script.js          # 📈 Tracking Script
https://your-dashboard.vercel.app/api/track          # 🔗 API Endpoint
```

## 📋 Website Integration

### ✅ **Simplified Configuration**
The tracking script now **only uses your project's API** - no external dependencies!

```html
<!-- Basic Integration (same domain) -->
<script 
  src="https://your-dashboard.vercel.app/script.js"
  data-site-id="44990">
</script>

<!-- Cross-Domain Integration (recommended) -->
<script 
  src="https://your-dashboard.vercel.app/script.js"
  data-proxy="https://your-dashboard.vercel.app"
  data-site-id="44990">
</script>

<!-- Advanced Configuration -->
<script 
  src="https://your-dashboard.vercel.app/script.js"
  data-proxy="https://your-dashboard.vercel.app"
  data-site-id="44990"
  data-domain="example.com"
  data-storage="localStorage"
  data-custom-category="ecommerce">
</script>
```

### 🔧 **Configuration Options**
- `data-site-id` - Unique identifier for the website (e.g., "44990")
- `data-proxy` - Your dashboard URL (for cross-domain tracking)
- `data-domain` - Override domain detection
- `data-storage` - `cookie`, `localStorage`, or `sessionStorage`
- `data-custom-*` - Add custom tracking attributes

### 🛡️ **Privacy & Security**
✅ **No external API calls** - everything goes through your API  
✅ **No third-party tokens** - no Tinybird tokens in client code  
✅ **Full control** - you own the entire data pipeline  
✅ **GDPR friendly** - all data flows through your infrastructure

## 🔧 Making Updates

### ✏️ Editing Tracking Script
```bash
# Edit the static file directly
vim dashboard/public/script.js

# Deploy changes
npm run build && git add . && git commit -m "Update tracking script" && git push
```

### ✏️ Editing API Endpoint
```bash
# Edit the API route directly
vim dashboard/pages/api/track.js

# Deploy changes
npm run build && git add . && git commit -m "Update API endpoint" && git push
```

## 📦 Deployment Process

1. **Edit files** directly in `dashboard/`
2. **Build project** (optional - Vercel builds automatically)
3. **Commit changes** to git
4. **Push to main branch** - Vercel auto-deploys

```bash
# Optional local build to test
npm run build

# Commit and deploy
git add dashboard/
git commit -m "Update UMNTR tracking"
git push origin main
```

## 🔍 Verifying Setup

Test that files exist and are working:
```bash
# Check files exist
ls -la dashboard/public/script.js
ls -la dashboard/pages/api/track.js

# Should show regular files (not links)
```

Test deployment:
```bash
# Test tracking script loads
curl https://your-dashboard.vercel.app/script.js

# Test API endpoint  
curl -X POST https://your-dashboard.vercel.app/api/track \
  -H "Content-Type: application/json" \
  -d '{"test": "data", "timestamp": "2024-01-01T00:00:00Z", "action": "page_view", "session_id": "test"}'
```

## ⚠️ Important Notes

- **Files are directly in the dashboard project** - no symlinks or complex setup
- **Standard Next.js structure** - follows Next.js conventions
- **Static tracking script** - served directly from `public/` folder
- **API routes** - standard Next.js API endpoints

## 🎉 Benefits

✅ **Simple architecture** - standard Next.js project  
✅ **Easy maintenance** - all files in one place  
✅ **Fast deployment** - single Next.js build  
✅ **Developer friendly** - familiar Next.js patterns  
✅ **Reliable hosting** - works with any Next.js hosting platform 