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
  data-site-id="44990"
></script>

<!-- Cross-Domain Integration (recommended) -->
<script
  src="https://your-dashboard.vercel.app/script.js"
  data-proxy="https://your-dashboard.vercel.app"
  data-site-id="44990"
></script>
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

| Attribute       | Required | Description                                  | Example                         |
| --------------- | -------- | -------------------------------------------- | ------------------------------- |
| `data-site-id`  | **Yes**  | Unique identifier for your website           | `"44990"`                       |
| `data-proxy`    | No       | Your dashboard URL for cross-domain tracking | `"https://your-app.vercel.app"` |
| `data-domain`   | No       | Override automatic domain detection          | `"example.com"`                 |
| `data-storage`  | No       | Storage method for session data              | `"localStorage"`                |
| `data-custom-*` | No       | Custom tracking attributes                   | `data-custom-plan="pro"`        |

### Storage Options

- `cookie` (default) - Browser cookies
- `localStorage` - Persistent local storage
- `sessionStorage` - Session-only storage

## Multi-Tenant Support

This analytics system supports multi-tenancy through site ID filtering. Each customer/organization can have their own isolated analytics data by using a unique `site_id`.

### Configuration

#### Environment Variables

Add the following environment variable to your dashboard configuration:

```env
NEXT_PUBLIC_SITE_ID=your-unique-site-id
```

#### Tracking Script

Include the `data-site-id` attribute in your tracking script:

```html
<script src="/script.js" data-site-id="your-unique-site-id"></script>
```

#### URL Parameters

You can also pass the site ID as a URL parameter:

```
https://your-dashboard.com?site_id=your-unique-site-id
```

### How It Works

1. **Data Ingestion**: All events are stored with a `site_id` field in the `analytics_events_api` datasource
2. **Data Filtering**: All tinybird pipes filter data by the provided `site_id` parameter
3. **Dashboard Isolation**: Each dashboard instance only shows data for the configured site ID
4. **API Isolation**: All API endpoints require a site_id parameter for data access

### Deployment for SaaS

For SaaS deployments where each customer needs their own analytics:

1. Deploy the tinybird data project once
2. Deploy separate dashboard instances for each customer with their unique `NEXT_PUBLIC_SITE_ID`
3. Provide each customer with a tracking script containing their unique `data-site-id`
4. All customer data will be automatically isolated by site ID

## 🚀 Query Optimization

### Consolidated Dashboard Endpoints

To optimize costs and reduce query load, the system includes consolidated dashboard endpoints that combine multiple data sources into single API calls:

#### Before Optimization

- **18+ separate API calls** for dashboard data
- Each widget section made individual requests to different pipes
- High QPS (Queries Per Second) usage on Tinybird

#### After Optimization

- **Only 2 API calls** for entire dashboard
- `dashboard_summary.pipe` - All widget data in one response
- `dashboard_trends.pipe` - All time-series data in one response
- Significant cost reduction and improved performance

#### Using Optimized Components

```typescript
// Old approach - multiple API calls
import Widgets from "../components/Widgets";

// New approach - consolidated API calls
import OptimizedWidgets from "../components/OptimizedWidgets";

function Dashboard() {
  return <OptimizedWidgets />;
}
```

#### Consolidated Endpoints

**dashboard_summary.pipe** returns:

- Top pages, entry pages, exit pages
- Top sources, browsers, OS, devices
- Top locations, regions, cities, languages
- Top channels, mediums, campaigns
- Custom events and conversion goals

**dashboard_trends.pipe** returns:

- KPI trends (visits, pageviews, bounce rate, session duration)
- Real-time visitor activity (last 30 minutes)

#### Benefits

- **Cost Optimization**: Reduce Tinybird QPS charges by 90%
- **Performance**: Faster dashboard loading with fewer network requests
- **Scalability**: Better performance under high traffic
- **Maintenance**: Easier to manage fewer endpoint dependencies

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
UMNTR.trackEvent("button_click", {
  button: "subscribe",
  location: "header",
});

// Track eCommerce events
UMNTR.trackEvent("add_to_cart", {
  product_id: "ABC123",
  price: 29.99,
  quantity: 1,
});

// Track form submissions
UMNTR.trackEvent("form_submit", {
  form_name: "contact",
  lead_source: "organic",
});
```

### Multi-Site Tracking

Track multiple websites with unique site IDs:

```html
<!-- Website A -->
<script
  defer
  src="https://web-analytics-dashboard-lime.vercel.app/script.js"
  data-site-id="44990"
  data-proxy="https://web-analytics-dashboard-lime.vercel.app"
></script>

<!-- Website B -->
<script
  src="https://your-dashboard.vercel.app/script.js"
  data-site-id="55001"
  data-proxy="https://your-dashboard.vercel.app"
></script>
```

### Custom Attributes

Add custom data to all tracking events:

```html
<script
  src="https://your-dashboard.vercel.app/script.js"
  data-site-id="44990"
  data-custom-plan="premium"
  data-custom-version="2.1"
  data-custom-segment="enterprise"
></script>
```

### API Integration

Send events directly via API:

```javascript
fetch("https://your-dashboard.vercel.app/api/track", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "custom_event",
    site_id: "44990",
    timestamp: new Date().toISOString(),
    session_id: "user_session_id",
    // ... additional event data
  }),
});
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

| Feature            | Traditional Analytics | UMNTR Analytics      |
| ------------------ | --------------------- | -------------------- |
| **Privacy**        | Third-party cookies   | First-party only     |
| **Data Ownership** | Vendor controlled     | You own everything   |
| **Performance**    | External dependencies | Self-hosted          |
| **Customization**  | Limited               | Fully customizable   |
| **Real-time**      | Delayed reporting     | Instant insights     |
| **Cost**           | Per-event pricing     | Fixed infrastructure |

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

## 🔍 Advanced Filtering System

This analytics system includes a comprehensive filtering system inspired by Pirsch Analytics, allowing you to segment and analyze your data across multiple dimensions.

### Available Filters

#### **📍 Location & Path Filters**

- **Hostname**: Filter by specific domains or subdomains
- **Page Path**: Filter by exact page paths with support for pattern matching
- **Entry/Exit Pages**: Filter by pages where users enter or leave your site
- **Path Patterns**: Use regex patterns for advanced path matching (e.g., `^/products/.*`)

#### **🌍 Geographic Filters**

- **Country**: Filter by ISO country codes (e.g., US, GB, DE)
- **Region**: Filter by geographic regions within countries
- **City**: Filter by specific cities
- **Language**: Filter by ISO language codes (e.g., en, es, fr)

#### **💻 Technology Filters**

- **Operating System**: Filter by OS (Windows, macOS, Linux, etc.)
- **Browser**: Filter by browser (Chrome, Firefox, Safari, etc.)
- **Device Type**: Filter by device category (desktop, mobile, tablet)
- **Screen Class**: Filter by screen size categories

#### **📊 Traffic Source Filters**

- **Referrer**: Filter by full referrer URLs
- **Referrer Name**: Filter by referrer display names
- **Channel**: Filter by traffic channels (organic, direct, social, etc.)

#### **🎯 UTM Parameter Filters**

- **UTM Source**: Filter by campaign source (google, facebook, etc.)
- **UTM Medium**: Filter by campaign medium (cpc, email, social, etc.)
- **UTM Campaign**: Filter by specific campaign names
- **UTM Content**: Filter by campaign content variations
- **UTM Term**: Filter by campaign keywords/terms

#### **⚡ Event & Custom Data Filters**

- **Event Names**: Filter by custom event names
- **Event Metadata**: Filter by event metadata keys and values
- **Custom Tags**: Filter by custom tag key-value pairs

### Filter Features

#### **🚫 Negation Support**

Add `!` prefix to exclude values:

- `!Chrome` - Exclude Chrome browser traffic
- `!mobile` - Exclude mobile device traffic
- `!US` - Exclude traffic from the United States

#### **🔍 Pattern Matching**

Use regex patterns for advanced path filtering:

- `^/products/.*` - All product pages
- `^/blog/\d{4}/.*` - Blog posts with year in URL
- `.*\.(pdf|doc)$` - File downloads

#### **💾 Filter Presets**

Save commonly used filter combinations:

- Save current filters as a named preset
- Quickly apply saved filter combinations
- Share filter presets across team members

#### **🔗 URL Persistence**

Filters are automatically saved in the URL:

- Share filtered views with colleagues
- Bookmark specific filter combinations
- Browser back/forward maintains filter state

### Using Filters

#### **Dashboard Interface**

1. Click the **"Filters"** button in the dashboard header
2. Browse filter categories in the side panel
3. Search for specific values within each filter type
4. Click values to add them to your active filters
5. Use the negation toggle (`!`) to exclude values
6. View active filters as chips below the header
7. Save frequently used combinations as presets

#### **URL Parameters**

Filters can be applied directly via URL parameters:

```
?country=US,GB&browser=Chrome&utm_source=google
```

#### **API Integration**

All Tinybird pipes support filter parameters:

```bash
curl "https://api.tinybird.co/v0/pipes/top_pages.json?token=YOUR_TOKEN&site_id=YOUR_SITE&country=US&browser=Chrome"
```

### Implementation for SaaS

#### **Multi-Tenant Filtering**

All filters automatically respect site boundaries:

- Filter options show only values available for your site
- Data is automatically isolated by `site_id`
- No cross-tenant data leakage

#### **Performance Optimization**

- Filter options are cached for 5 minutes
- Common filters are preloaded automatically
- Optimized queries with proper indexing
- Efficient combination of multiple filters

#### **Developer Integration**

Use the filter system in your custom components:

```typescript
import { useFilters } from "@/lib/hooks/use-filters";
import { FilterField } from "@/lib/types/filters";

function MyComponent() {
  const { addFilter, removeFilter, activeFilters } = useFilters();

  // Add a country filter
  const filterByUS = () => addFilter(FilterField.COUNTRY, "US");

  // Remove a specific filter
  const removeFilter = () => removeFilter(FilterField.COUNTRY, "US");

  // Check active filters
  const hasCountryFilter = activeFilters.country?.length > 0;
}
```

### Filter Validation

The system includes comprehensive validation:

- **Required combinations**: Some filters require others (e.g., event metadata requires event name)
- **Regex validation**: Path patterns are validated before application
- **Date range validation**: Ensures logical date ranges
- **Type validation**: Ensures correct data types for all filter values

### Best Practices

#### **Performance**

- Use specific filters to reduce data processing
- Combine complementary filters for targeted analysis
- Avoid overly broad regex patterns
- Use presets for frequently accessed segments

#### **Analysis**

- Start with broad filters and narrow down
- Use negation to exclude outliers or test traffic
- Combine geographic and technology filters for device targeting
- Use UTM filters to measure campaign effectiveness

#### **Team Collaboration**

- Create descriptive names for filter presets
- Share filtered dashboard URLs for specific insights
- Document common filter combinations for recurring reports
- Use consistent naming conventions for custom events and tags

This comprehensive filtering system provides the granular control needed for professional web analytics while maintaining the performance and ease of use expected in modern analytics platforms.
