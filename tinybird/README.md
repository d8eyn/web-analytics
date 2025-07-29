# Tinybird Analytics - Enterprise Analytics Platform

This Tinybird configuration provides comprehensive web analytics tracking with enterprise-grade capabilities, including geographic intelligence, device detection, bot protection, and advanced attribution.

## 🚀 Features

### Core Analytics
- **Page View Tracking**: Complete page analytics with metadata
- **Session Analytics**: Session-level insights with bounce detection  
- **Custom Events**: Flexible business event tracking
- **Traffic Attribution**: Advanced referrer and UTM tracking
- **Real-time Analytics**: Live visitor tracking and trend analysis
- **Conversion Goals**: Custom event-based conversion tracking

### Intelligence & Enrichment
- **Device Detection**: Mobile, tablet, desktop classification
- **Browser Intelligence**: Chrome, Firefox, Safari, Edge detection
- **Geographic Data**: Country, region, city tracking
- **Bot Protection**: Comprehensive bot detection and filtering
- **UTM Campaign Tracking**: Full campaign attribution
- **Traffic Source Classification**: Automatic channel categorization

### Performance & Scale
- **Materialized Views**: Pre-aggregated analytics for fast queries
- **Efficient Storage**: Optimized partitioning and indexing
- **Real-time Processing**: Stream processing for immediate insights
- **Data Lifecycle**: Automatic TTL and retention management

## 📊 Data Sources

### Primary Landing Tables

#### `analytics_events_api`
**Primary analytics events datasource** - Main landing table for all tracking data
- **Purpose**: Collects all raw analytics events (page views, custom events)
- **Schema**: 43 fields including user identification, geographic data, device intelligence, UTM parameters
- **Key Features**: Comprehensive tracking with bot detection and event metadata
- **Retention**: 60 days
- **Partitioning**: By month (`toYYYYMM(timestamp)`)

#### `analytics_page_views`
**Processed page view events** - Clean, processed page view data with full enrichment
- **Purpose**: Stores processed page views with enrichment and tagging
- **Schema**: 29 fields including user context, geographic data, UTM parameters, page tagging
- **Key Features**: Bot-filtered, enriched with device/browser data, supports tagging
- **Retention**: 60 days


#### `analytics_custom_events`
**Business events** - Custom events with flexible metadata
- **Purpose**: Tracks custom business events with key-value metadata
- **Schema**: 29 fields including event metadata arrays, full user context
- **Key Features**: Flexible metadata, full user context preservation
- **Use Cases**: Conversions, interactions, custom business metrics

#### `analytics_requests`
**Raw request tracking** - Request-level data with bot detection
- **Purpose**: Security tracking and comprehensive bot detection
- **Schema**: 13 fields including IP, user agent, bot classification
- **Key Features**: Enhanced bot detection, security monitoring
- **Retention**: 1 month

### Materialized Views

#### `analytics_pages_mv`
**Page performance metrics** - Pre-aggregated page analytics
- **Purpose**: Fast page performance queries with comprehensive dimensions
- **Aggregations**: Visits (uniq), hits (count), duration (sum), bounces (countIf)
- **Dimensions**: Date, hostname, pathname, device, browser, OS, geographic data, UTM parameters
- **Use Cases**: Top pages, page performance analysis, geographic breakdown

#### `analytics_sessions_mv`
**Session insights** - Pre-aggregated session analytics
- **Purpose**: Session-level metrics and patterns
- **Aggregations**: Page views (count), session duration (sum), bounce detection
- **Dimensions**: Date, session ID, device, browser, OS, geographic data, channel
- **Use Cases**: Session analysis, user behavior patterns, device performance

#### `analytics_sources_mv_new`
**Traffic source attribution** - Pre-aggregated traffic source data
- **Purpose**: Traffic attribution and campaign performance
- **Aggregations**: Visits (uniq), hits (count), duration (sum), bounces (countIf)
- **Dimensions**: Date, hostname, device, channel, referrer, UTM parameters
- **Use Cases**: Traffic source analysis, campaign performance, attribution modeling

#### `analytics_custom_events_mv`
**Custom events metrics** - Pre-aggregated business events
- **Purpose**: Custom event analytics with metadata flattening
- **Aggregations**: Unique users (uniq), event count (count), duration (sum)
- **Dimensions**: Date, hostname, event name, metadata key/value pairs
- **Use Cases**: Conversion tracking, feature usage, business metrics

## 🔧 Processing Pipes

### Core Data Processing

#### `analytics_hits`
**Enhanced event processing** - Main analytics processing pipeline
- **Purpose**: Processes raw events with comprehensive enrichment
- **Features**: Device detection, browser detection, OS classification, traffic source categorization
- **Token**: `dashboard` (READ)
- **Output**: Fully enriched analytics data with intelligence
- **Key Enrichments**: Bot detection, device classification, geographic processing

#### `process_page_views`
**Page view materialization** - Processes page views to materialized table
- **Purpose**: Filters and enriches page view events for analytics_page_views
- **Features**: Bot filtering, device/browser detection, traffic classification
- **Token**: `dashboard` (READ)
- **Output**: Clean page view data in analytics_page_views
- **Processing**: Real-time materialization with enrichment

#### `process_custom_events`
**Custom event processing** - Processes business events with metadata
- **Purpose**: Enriches custom events with full user context
- **Features**: Metadata processing, device enrichment, channel classification
- **Token**: `dashboard` (READ)
- **Output**: Processed custom events in analytics_custom_events
- **Use Cases**: Business event tracking, conversion processing

#### `process_requests`
**Request processing** - Advanced bot detection and request classification
- **Purpose**: Comprehensive bot detection and security monitoring
- **Features**: Enhanced bot patterns, suspicious traffic detection
- **Token**: `dashboard` (READ)
- **Output**: Request classification in analytics_requests
- **Security**: Bot pattern matching, anomaly detection

### Analytics Endpoints

#### Core KPIs and Trends

##### `kpis`
**Key Performance Indicators** - Main dashboard KPIs with trend data
- **Purpose**: Provides core metrics (visits, pageviews, bounce rate, session duration)
- **Features**: Time series data, hourly/daily granularity, session-level calculations
- **Parameters**: `date_from`, `date_to`
- **Token**: `dashboard` (READ)
- **Output**: Date-indexed KPI time series
- **Use Cases**: Main dashboard charts, KPI totals, trend analysis

##### `trend`
**Real-time user activity** - Live visitor tracking for last 30 minutes
- **Purpose**: Shows real-time user activity in 5-minute intervals
- **Features**: Real-time data, session-based counting, time interval grouping
- **Parameters**: None (fixed 30-minute window)
- **Token**: `dashboard` (READ)
- **Output**: Time-indexed visitor counts
- **Use Cases**: Real-time dashboard widget, live activity monitoring

#### Page Analytics

##### `top_pages`
**Most visited pages** - Page popularity ranking
- **Purpose**: Shows most popular pages by visits and hits
- **Features**: Pagination support, date filtering, visit/hit metrics
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_pages_mv`

##### `entry_pages`
**Top entry pages** - Most common session entry points
- **Purpose**: Analyzes where users enter the site
- **Features**: Session-based entry page tracking
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_sessions_mv`

##### `exit_pages`
**Top exit pages** - Most common session exit points
- **Purpose**: Analyzes where users leave the site
- **Features**: Session-based exit page tracking
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_sessions_mv`

##### `top_hostnames`
**Hostname analytics** - Traffic breakdown by hostname
- **Purpose**: Multi-domain analytics and hostname performance
- **Features**: Cross-domain tracking, hostname-level metrics
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_pages_mv`

##### `top_channels`
**Channel analytics** - Traffic breakdown by channel type
- **Purpose**: Analyzes traffic by channel (Direct, Search, Social, etc.)
- **Features**: Automatic channel classification, performance metrics
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_pages_mv`

#### Traffic Sources and Attribution

##### `top_sources`
**Traffic source ranking** - Top referral domains
- **Purpose**: Shows top referral sources excluding direct traffic
- **Features**: Domain extraction, visit/hit metrics, external link handling
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_sources_mv_new`

##### `top_mediums`
**UTM medium analytics** - Campaign medium performance
- **Purpose**: Analyzes traffic by UTM medium (CPC, social, email, etc.)
- **Features**: UTM parameter analysis, "Direct / None" handling
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_sources_mv_new`

##### `top_campaigns`
**UTM campaign analytics** - Campaign performance tracking
- **Purpose**: Shows performance of specific UTM campaigns
- **Features**: Campaign-level attribution, ROI tracking data
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_sources_mv_new`

#### Geographic Analytics

##### `top_locations`
**Country analytics** - Geographic traffic distribution
- **Purpose**: Shows traffic breakdown by country
- **Features**: Country-level geographic analysis
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_pages_mv`

##### `top_regions`
**Regional analytics** - State/province level traffic
- **Purpose**: Regional traffic breakdown within countries
- **Features**: State/province level geographic data
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_pages_mv`

##### `top_cities`
**City analytics** - Metropolitan area traffic
- **Purpose**: City-level traffic analysis
- **Features**: Metropolitan area breakdown, urban analytics
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_pages_mv`

##### `top_languages`
**Language analytics** - User language preferences
- **Purpose**: Shows traffic breakdown by user language/locale
- **Features**: Language preference analysis, localization insights
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_pages_mv`

#### Technology Analytics

##### `top_devices`
**Device usage patterns** - Device type analytics
- **Purpose**: Shows traffic breakdown by device type (desktop, mobile, tablet)
- **Features**: Device classification, mobile vs desktop analysis
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_sessions_mv`

##### `top_browsers`
**Browser distribution** - Browser usage analytics
- **Purpose**: Shows traffic breakdown by browser type
- **Features**: Browser detection (Chrome, Firefox, Safari, Edge, etc.)
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_sessions_mv`

##### `top_os`
**Operating system analytics** - OS usage patterns
- **Purpose**: Shows traffic breakdown by operating system
- **Features**: OS detection (Windows, macOS, iOS, Android, Linux)
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_sessions_mv`

#### Business Analytics

##### `top_custom_events`
**Custom events ranking** - Business event analytics
- **Purpose**: Shows top custom events by frequency and user engagement
- **Features**: Event name analysis, user engagement metrics, duration tracking
- **Parameters**: `date_from`, `date_to`, `skip`, `limit`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_custom_events`
- **Metrics**: Unique users, event count, average duration

##### `conversion_goals`
**Conversion tracking** - Goal completion analytics
- **Purpose**: Tracks conversion events and goal completions
- **Features**: Predefined conversion events, goal-based filtering
- **Parameters**: `date_from`, `date_to`
- **Token**: `dashboard` (READ)
- **Data Source**: `analytics_custom_events`
- **Goal Events**: signup, purchase, download, form_submit, newsletter_signup

### Aggregation Pipes

#### `analytics_pages`
**Page aggregation** - Materializes page-level metrics
- **Purpose**: Aggregates page data with comprehensive tracking metrics
- **Type**: MATERIALIZED
- **Target**: `analytics_pages_mv`
- **Features**: Bounce calculation, duration aggregation, visit counting

#### `analytics_sessions_agg`
**Session aggregation** - Materializes session-level data
- **Purpose**: Aggregates session data from analytics events
- **Type**: MATERIALIZED
- **Target**: `analytics_sessions_mv`
- **Features**: Entry/exit page tracking, session duration, bounce detection

#### `analytics_custom_events_agg`
**Custom events aggregation** - Materializes business event metrics
- **Purpose**: Aggregates custom events with flattened metadata
- **Type**: MATERIALIZED
- **Target**: `analytics_custom_events_mv`
- **Features**: Metadata flattening, user engagement metrics

## 🎯 Quick Start

### 1. Deploy Schema
```bash
# Deploy all datasources and pipes
tb deploy --cloud

# Or use legacy command with force
tb push --force
```

### 2. Generate Test Data
```bash
# Generate comprehensive test data
tb datasource generate analytics_events_api --count 10000
```

### 3. Query Analytics
```bash
# Test core endpoints
tb pipe data kpis --limit 10
tb pipe data top_pages --limit 10  
tb pipe data top_sources --limit 10
tb pipe data conversion_goals --limit 10
```

## 📈 Sample Queries

### KPI Analysis
```sql
-- Get daily KPIs for last week
SELECT 
    date,
    visits,
    pageviews,
    bounce_rate,
    avg_session_sec
FROM kpis
WHERE date >= today() - 7
ORDER BY date DESC
```

### Page Performance
```sql
-- Top performing pages with engagement metrics
SELECT 
    pathname,
    sumMerge(hits) as page_views,
    uniqMerge(visits) as unique_visitors,
    avgMerge(total_duration) as avg_time_on_page,
    (sumMerge(bounces) * 100.0 / sumMerge(hits)) as bounce_rate
FROM analytics_pages_mv 
WHERE date >= today() - 7
GROUP BY pathname
ORDER BY page_views DESC
LIMIT 20
```

### Traffic Attribution
```sql
-- Traffic source performance with conversion data
SELECT 
    channel,
    referrer,
    sumMerge(hits) as hits,
    uniqMerge(visits) as visitors,
    (sumMerge(bounces) * 100.0 / sumMerge(hits)) as bounce_rate
FROM analytics_sources_mv_new
WHERE date >= today() - 30
GROUP BY channel, referrer
ORDER BY visitors DESC
LIMIT 25
```

### Geographic Analysis
```sql
-- Geographic breakdown with engagement
SELECT 
    country_code,
    region,
    city,
    uniqMerge(visits) as visitors,
    sumMerge(hits) as page_views,
    avgMerge(total_duration) as avg_session_duration
FROM analytics_pages_mv
WHERE date >= today() - 7
  AND country_code != ''
GROUP BY country_code, region, city
ORDER BY visitors DESC
LIMIT 50
```

### Conversion Analysis
```sql
-- Conversion funnel analysis
SELECT 
    event_name as conversion_goal,
    count() as conversions,
    uniq(visitor_id) as converting_users,
    avg(duration_seconds) as avg_time_to_convert
FROM analytics_custom_events
WHERE toDate(timestamp) >= today() - 30
  AND event_name IN ('signup', 'purchase', 'download')
GROUP BY event_name
ORDER BY conversions DESC
```

### Device and Technology Analysis
```sql
-- Technology stack performance
SELECT 
    device,
    browser,
    os,
    uniq(session_id) as sessions,
    countMerge(page_views) as page_views,
    avg(latest_hit - first_hit) as avg_session_duration
FROM analytics_sessions_mv
WHERE date >= today() - 7
GROUP BY device, browser, os
ORDER BY sessions DESC
LIMIT 30
```

## 🤖 Bot Detection

The system includes comprehensive bot detection patterns:

### Search Engine Bots
- **Google**: Googlebot, Google-InspectionTool
- **Bing**: Bingbot, BingPreview
- **Yahoo**: Yahoo Slurp
- **DuckDuckGo**: DuckDuckBot
- **Yandex**: YandexBot
- **Baidu**: Baiduspider

### Social Media Crawlers
- **Facebook**: FacebookExternalHit
- **Twitter**: Twitterbot
- **LinkedIn**: LinkedInBot
- **WhatsApp**: WhatsApp crawler
- **Telegram**: TelegramBot

### SEO and Security Tools
- **Ahrefs**: AhrefsBot
- **SemRush**: SemrushBot  
- **Security Scanners**: Various security tools
- **Generic Patterns**: bot, crawler, spider, wget, curl

Bot traffic is automatically flagged and filtered from analytics pipelines.

## 🌍 Geographic Intelligence

Automatic geographic enrichment:
- **Country Code**: ISO 2-letter country codes (US, GB, DE, etc.)
- **Region**: State/province level data
- **City**: Metropolitan area tracking
- **Language**: User locale detection (en-US, fr-FR, etc.)

## 📱 Device & Browser Detection

Advanced classification engine:

### Device Types
- **Desktop**: Traditional computers and laptops
- **Mobile**: Smartphones (iOS, Android)
- **Tablet**: Tablets and large mobile devices
- **Bot**: Automated crawlers and bots

### Browsers
- **Chrome**: Google Chrome and Chromium variants
- **Firefox**: Mozilla Firefox
- **Safari**: Apple Safari
- **Edge**: Microsoft Edge
- **Opera**: Opera browser
- **Legacy**: Internet Explorer and others

### Operating Systems
- **Windows**: All versions including Windows 10, 11
- **macOS**: Apple desktop operating system
- **iOS**: Apple mobile operating system
- **Android**: Google mobile operating system  
- **Linux**: Various Linux distributions

## 🔗 Traffic Attribution

### Channel Classification
- **Direct**: Users arriving directly to the site
- **Search**: Organic search traffic from search engines
- **Social**: Social media platform referrals
- **Email**: Email campaign traffic
- **Campaign**: UTM-tagged paid campaigns
- **Referral**: External website referrals

### UTM Parameter Support
- **utm_source**: Campaign source (google, facebook, newsletter)
- **utm_medium**: Campaign medium (cpc, social, email)
- **utm_campaign**: Campaign name (summer-sale, product-launch)
- **utm_content**: Ad content identifier (banner-ad, text-link)
- **utm_term**: Paid search keywords (analytics, dashboard)

## 🎛️ Configuration

### Environment Variables
```bash
TINYBIRD_TOKEN=your_tracker_token_here
TINYBIRD_HOST=https://api.tinybird.co
TB_TOKEN=your_dashboard_token_here
```

### Token Permissions
- **tracker**: Append data to analytics_events_api
- **dashboard**: Read access for all analytics queries and pipes

### Deployment Commands
```bash
# Deploy to cloud
tb deploy --cloud

# Deploy specific pipes
tb pipe push tinybird/pipes/kpis.pipe --cloud

# Generate test data
tb datasource generate analytics_events_api --count 50000
```

## 🔧 Local Development

### 1. Install Tinybird CLI
```bash
# Install via curl
curl https://install.tinybird.co | bash

# Or via pip
pip install tinybird-cli
```

### 2. Configure Authentication
```bash
# Login to your workspace
tb auth login

# Or set tokens manually
export TB_TOKEN=your_dashboard_token
export TINYBIRD_TOKEN=your_tracker_token
```

### 3. Deploy Schema
```bash
# Deploy all datasources and pipes
tb deploy --cloud

# Verify deployment
tb workspace ls
```

### 4. Generate Test Data
```bash
# Generate realistic test data
tb datasource generate analytics_events_api --count 25000

# Generate custom events
tb datasource generate analytics_custom_events --count 5000
```

### 5. Test Queries
```bash
# Test main KPIs
tb pipe data kpis --params="date_from=2024-01-01&date_to=2024-01-31"

# Test page analytics
tb pipe data top_pages --params="limit=20"

# Test conversion tracking
tb pipe data conversion_goals
```

## 📊 Dashboard Integration

This analytics platform integrates with the React dashboard:

### Required Pipes for Dashboard
- `kpis` - Main KPI chart and metrics
- `trend` - Real-time user activity widget
- `top_pages`, `entry_pages`, `exit_pages` - Pages section
- `top_sources`, `top_mediums`, `top_campaigns` - Referrers section
- `top_locations`, `top_regions`, `top_cities`, `top_languages` - Geographic section
- `top_devices`, `top_browsers`, `top_os` - Technology section
- `top_custom_events` - Events section
- `conversion_goals` - Conversion tracking

### Dashboard Features
- **Tabbed Widgets**: Multi-dimensional analytics in single widgets
- **Real-time Updates**: Live data refresh every 2 minutes
- **Date Filtering**: Flexible date range selection
- **Responsive Layout**: Optimized for desktop and mobile
- **Export Capabilities**: CSV and JSON data export

## 🚨 Data Quality & Monitoring

### Built-in Quality Features
- **Bot Filtering**: Automatic exclusion of non-human traffic
- **Data Validation**: Schema enforcement and type checking
- **Performance Monitoring**: Query optimization and caching
- **Error Tracking**: Processing error detection and alerting

### Monitoring Queries
```sql
-- Check data freshness
SELECT max(timestamp) as last_event 
FROM analytics_events_api;

-- Monitor bot detection rates
SELECT 
    bot,
    count() as events,
    count() * 100.0 / (SELECT count() FROM analytics_events_api) as percentage
FROM analytics_events_api 
GROUP BY bot;

-- Performance monitoring
SELECT 
    action,
    count() as events,
    avg(server_timestamp - timestamp) as processing_delay_seconds
FROM analytics_events_api
WHERE timestamp >= now() - interval 1 hour
GROUP BY action;
```

## 🔒 Privacy & Compliance

### Privacy Features
- **IP Hashing**: Optional IP address hashing for privacy
- **Data Retention**: Configurable TTL policies (60 days default)
- **User Consent**: Support for consent management integration
- **Data Export**: GDPR-compliant data export capabilities
- **Anonymization**: Bot filtering and user anonymization options

### Compliance Tools
```sql
-- User data export (GDPR)
SELECT *
FROM analytics_events_api
WHERE visitor_id = {user_visitor_id}
ORDER BY timestamp DESC;

-- Data deletion (Right to be forgotten)
DELETE FROM analytics_events_api 
WHERE visitor_id = {user_visitor_id};
```

## 📋 Migration and Maintenance

### Schema Updates
When updating schema or adding new pipes:
1. Test locally with mock data
2. Deploy to staging environment
3. Validate data integrity
4. Deploy to production
5. Monitor performance metrics

### Performance Optimization
- **Partitioning**: Monthly partitions for optimal performance
- **Indexing**: Optimized sorting keys for common queries  
- **Materialized Views**: Pre-aggregated data for fast dashboards
- **TTL Management**: Automatic data lifecycle management

---

**Enterprise Analytics Platform** - Comprehensive web analytics with Tinybird
*Real-time insights, privacy-first design, enterprise scale*

# Tinybird Analytics Architecture

This directory contains the Tinybird implementation for the web analytics system, providing real-time data processing and querying capabilities.

## Overview

The system uses a hybrid approach that combines:
- **Optimized materialized views** for fast aggregated queries
- **Detailed individual records** for granular drill-down analysis

## Enhanced Architecture with Detailed Page Views

### New Enhancement: Detailed Page Views Storage

The system now includes **individual page view storage** alongside the existing optimized materialized views:

#### **📊 Datasources**
- `analytics_page_views_detailed` - Individual page view records with full enrichment
- `analytics_pages_mv` - Aggregated page data (existing)
- `analytics_sessions_mv` - Session-level aggregation (existing)
- `analytics_sources_mv_new` - Traffic source aggregation (existing)
- `analytics_custom_events` - Custom events (existing)

#### **🔄 Processing**
- `process_page_views_detailed` - Materializes individual page views from `analytics_hits`
- Provides 90-day retention for detailed analysis
- Filters out bots and invalid sessions

#### **🎯 Query Capabilities**
- `page_views_detailed` - Query individual page view records with comprehensive filtering
- Supports all filters: hostname, path, geography, technology, traffic sources, UTM parameters
- Configurable limits and date ranges
- Real-time filtering on stored records

### Benefits of This Approach

#### **✅ Fast Aggregated Queries (Existing MVs)**
- Pre-computed aggregations for dashboard widgets
- Sub-second response times for summary data
- Optimized storage and query performance

#### **✅ Granular Analysis (New Detailed Storage)**
- Individual page view records for drill-down analysis
- Complete user journey reconstruction
- Flexible filtering on any dimension
- Raw data access for custom analysis

### Usage Examples

#### **Dashboard Widgets (Use existing MVs)**
```sql
-- Fast aggregated data
SELECT uniqMerge(visits), countMerge(hits) 
FROM analytics_pages_mv 
WHERE date >= '2024-01-01'
```

#### **Detailed Analysis (Use new detailed storage)**
```sql
-- Individual page view records
SELECT timestamp, visitor_id, path, duration_seconds, device
FROM page_views_detailed
WHERE path = '/pricing' 
  AND device = 'mobile'
  AND date_from = '2024-01-01'
LIMIT 1000
```

#### **User Journey Analysis**
```sql
-- Reconstruct complete user sessions
SELECT visitor_id, session_id, path, timestamp, title
FROM page_views_detailed 
WHERE visitor_id = 123456
ORDER BY timestamp
```

### Implementation Details

#### **Storage Optimization**
- **Materialized Views**: ~70% less storage, optimized for aggregations
- **Detailed Storage**: Individual records, 90-day TTL
- **Partitioning**: Monthly partitions for efficient querying
- **Sampling**: Visitor-based sampling for large datasets

#### **Query Patterns**
- **Summary Data**: Use existing materialized view pipes (`dashboard_summary`, `top_pages`, etc.)
- **Drill-down Analysis**: Use `page_views_detailed` pipe
- **Custom Analysis**: Query `analytics_page_views_detailed` directly

### Filter Support

All filters work consistently across both aggregated and detailed views:
- Geographic: `country_code`, `region`, `city`
- Technology: `browser`, `os`, `device`
- Traffic: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- Navigation: `hostname`, `path`, `referrer`, `referrer_name`
- Behavioral: `language`, `channel`

This hybrid architecture provides the best of both worlds - fast dashboard performance with flexible drill-down capabilities.
