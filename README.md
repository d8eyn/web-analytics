# UMNTR Web Analytics Platform

A **privacy-first, self-hosted web analytics platform** built with [Tinybird](https://www.tinybird.co/) and Next.js. This platform provides real-time website analytics while maintaining complete control over your data pipeline.

🎯 **Key Features:**
- ✅ **Privacy-first** - No external API calls, all data flows through your infrastructure
- ✅ **Self-contained** - Single Next.js deployment serves dashboard, tracking script, and API
- ✅ **Generic branding** - Tracking script uses generic `script.js` name for discretion
- ✅ **Multi-site support** - Track multiple websites with unique site IDs
- ✅ **Real-time analytics** - Powered by Tinybird for instant insights
- ✅ **Custom events** - Track custom interactions and conversions
- ✅ **GDPR compliant** - Full data ownership and control

![UMNTR Web Analytics Dashboard](./dashboard-template.png)

## 🚀 Quick Start

### 1. Set up Tinybird Backend

Deploy the analytics schema to Tinybird:

```bash
curl -sSL https://tinybird.co | bash
tb login
cd tinybird
tb --cloud deploy
```

This creates all necessary Data Sources, Materialized Views, and API Endpoints in your Tinybird workspace.

### 2. Deploy to Vercel

Deploy the dashboard and tracking infrastructure:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/web-analytics&project-name=umntr-analytics&repository-name=umntr-analytics&root-directory=dashboard)

**Environment Variables:**
- `TINYBIRD_TOKEN` - Your Tinybird API token
- `CORS_ALLOW_ORIGIN` - Set to `*` or your specific domains

### 3. Add Tracking to Your Website

Add the tracking script to your website's `<head>` section:

```html
<!-- Basic Integration -->
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
```

**Replace:**
- `your-dashboard.vercel.app` with your actual Vercel domain
- `44990` with your unique site ID

That's it! Your website will now send analytics data to your self-hosted platform.

### 4. View Your Analytics

Access your analytics dashboard at:
```
https://your-dashboard.vercel.app/
```

The dashboard provides real-time insights including:
- 📊 **Page views and unique visitors**
- 🌍 **Geographic distribution** 
- 📱 **Device and browser analytics**
- 🔗 **Traffic sources and referrers**
- ⏱️ **Real-time visitor tracking**
- 📈 **Custom event tracking**

## 📋 Configuration Options

### Tracking Script Attributes

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `data-site-id` | **Yes** | Unique identifier for your website | `"44990"` |
| `data-proxy` | No | Your dashboard URL for cross-domain tracking | `"https://your-app.vercel.app"` |
| `data-domain` | No | Override automatic domain detection | `"example.com"` |
| `data-storage` | No | Storage method for session data | `"localStorage"` |
| `data-custom-*` | No | Custom tracking attributes | `data-custom-plan="pro"` |

### Storage Options

- `cookie` (default) - Browser cookies
- `localStorage` - Persistent local storage
- `sessionStorage` - Session-only storage

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Run dashboard in development
npm run dev

# Build for production
npm run build

# Verify setup
npm run verify
```

### Project Structure

```
dashboard/                  # Next.js application
├── public/
│   └── script.js          # 📊 Generic tracking script
├── pages/
│   ├── api/
│   │   └── track.js       # 🛡️ Analytics API endpoint
│   └── index.tsx          # 📈 Analytics dashboard
tinybird/                  # Tinybird schema & pipes
├── datasources/           # Data source definitions
├── pipes/                 # SQL processing pipelines
└── README.md             # Tinybird deployment guide
```


## 📊 Advanced Features

### Custom Events

Track custom interactions and conversions:

```javascript
// Track button clicks
UMNTR.trackEvent('button_click', {
  button: 'subscribe',
  location: 'header'
})

// Track eCommerce events
UMNTR.trackEvent('add_to_cart', {
  product_id: 'ABC123',
  price: 29.99,
  quantity: 1
})

// Track form submissions
UMNTR.trackEvent('form_submit', {
  form_name: 'contact',
  lead_source: 'organic'
})
```

### Multi-Site Tracking

Track multiple websites with unique site IDs:

```html
<!-- Website A -->
<script 
  src="https://your-dashboard.vercel.app/script.js"
  data-site-id="44990"
  data-proxy="https://your-dashboard.vercel.app">
</script>

<!-- Website B -->
<script 
  src="https://your-dashboard.vercel.app/script.js"
  data-site-id="55001"
  data-proxy="https://your-dashboard.vercel.app">
</script>
```

### Custom Attributes

Add custom data to all tracking events:

```html
<script 
  src="https://your-dashboard.vercel.app/script.js"
  data-site-id="44990"
  data-custom-plan="premium"
  data-custom-version="2.1"
  data-custom-segment="enterprise">
</script>
```

### API Integration

Send events directly via API:

```javascript
fetch('https://your-dashboard.vercel.app/api/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'custom_event',
    site_id: '44990',
    timestamp: new Date().toISOString(),
    session_id: 'user_session_id',
    // ... additional event data
  })
})
```

## 🔒 Privacy & Security

### GDPR Compliance
- ✅ **No external API calls** - all data stays within your infrastructure
- ✅ **No third-party cookies** - first-party tracking only
- ✅ **Data ownership** - you control all analytics data
- ✅ **IP anonymization** - server-side IP processing
- ✅ **Configurable storage** - respect user preferences

### Security Features
- ✅ **Rate limiting** - 1000 requests/minute/IP protection
- ✅ **Bot detection** - server and client-side filtering
- ✅ **Data validation** - comprehensive input sanitization
- ✅ **CORS protection** - configurable cross-origin policies

## 🎯 Key Benefits

| Feature | Traditional Analytics | UMNTR Analytics |
|---------|----------------------|-----------------|
| **Privacy** | Third-party cookies | First-party only |
| **Data Ownership** | Vendor controlled | You own everything |
| **Performance** | External dependencies | Self-hosted |
| **Customization** | Limited | Fully customizable |
| **Real-time** | Delayed reporting | Instant insights |
| **Cost** | Per-event pricing | Fixed infrastructure |

## 📚 Documentation

- 📖 [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Detailed setup instructions
- 🏗️ [Tinybird Schema](./tinybird/README.md) - Database schema and pipes
- 📊 [Dashboard Guide](./dashboard/README.md) - Dashboard customization

## 🤝 Support

- 💬 [Tinybird Community Slack](https://www.tinybird.co/join-our-slack-community)
- 📖 [Tinybird Documentation](https://docs.tinybird.co/)
- 🐛 [GitHub Issues](https://github.com/your-repo/issues)

---

**Built with ❤️ for privacy-conscious analytics**
