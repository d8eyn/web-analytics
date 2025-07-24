# Tinybird Analytics Schema Migration Guide

## Overview

This document outlines the comprehensive migration from a basic analytics tracking system to an enterprise-grade analytics platform that matches the capabilities of the reference Go-based analytics system.

## Migration Summary

### Before: Basic Tracking
- Simple event collection with minimal fields
- Basic device detection
- Limited aggregations
- No geographic intelligence
- No bot detection
- No UTM tracking

### After: Enterprise Analytics
- Comprehensive user tracking with rich metadata
- Advanced device and browser detection
- Geographic intelligence (country, region, city)
- Sophisticated bot detection and classification
- Full UTM campaign tracking
- Custom event support with metadata
- Session-level analytics with bounce detection
- Traffic source attribution

## New Data Sources

### 1. Enhanced Analytics Events (`analytics_events`)
**Primary landing table for all tracking data**

#### Key Fields Added:
- **User Identification**: `client_id`, `visitor_id`, `session_id`
- **Geographic Data**: `country_code`, `region`, `city`
- **Device Intelligence**: `os`, `os_version`, `browser`, `browser_version`, `desktop`, `mobile`, `screen_class`
- **Referrer Intelligence**: `referrer`, `referrer_name`, `referrer_icon`
- **UTM Campaign Tracking**: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- **Content Metadata**: `hostname`, `path`, `title`, `language`
- **Custom Events**: `event_name`, `event_meta_keys`, `event_meta_values`
- **Page Tagging**: `tag_keys`, `tag_values`
- **Bot Detection**: `bot`, `bot_reason`, `ip`, `user_agent`
- **Traffic Classification**: `channel`

#### Engine Configuration:
```sql
ENGINE MergeTree
ENGINE_PARTITION_KEY toYYYYMM(timestamp)
ENGINE_SORTING_KEY timestamp, client_id, visitor_id
ENGINE_TTL timestamp + toIntervalDay(60)
ENGINE_SAMPLING_KEY visitor_id
```

### 2. Page Views Data Source (`analytics_page_views`)
**Processed page view events with full enrichment**

Stores clean, processed page view data with:
- Complete user journey tracking
- Device and browser classification
- Geographic attribution
- UTM campaign data
- Page metadata and tagging



### 3. Custom Events Data Source (`analytics_custom_events`)
**Custom business events with flexible metadata**

Supports:
- Event name classification
- Flexible key-value metadata
- Full user context preservation
- Geographic and device attribution

### 4. Requests Data Source (`analytics_requests`)
**Raw request tracking and bot detection**

Includes:
- Comprehensive bot detection patterns
- IP and user agent analysis
- Request classification and reasoning
- Security and compliance tracking

## Enhanced Processing Pipes

### 1. Analytics Hits (`analytics_hits`)
**Comprehensive event processing with intelligence**

#### New Capabilities:
- **Enhanced Device Detection**: Distinguishes between mobile, tablet, desktop, and bot traffic
- **Advanced Browser Detection**: Supports Chrome, Firefox, Safari, Edge, Opera with version detection
- **Operating System Intelligence**: Detailed OS detection including Windows versions, macOS, iOS, Android, Linux
- **Traffic Source Classification**: Automatic categorization into Direct, Search, Social, Email, Campaign, Referral
- **Geographic Enrichment**: Country, region, and city data processing
- **Bot Filtering**: Comprehensive bot detection and classification

#### Detection Logic:
```sql
-- Device Detection
CASE
    WHEN match(user_agent, 'bot|crawler|spider') THEN 'bot'
    WHEN match(user_agent, 'android.*mobile') THEN 'mobile-android'
    WHEN match(user_agent, 'iphone|ipod') THEN 'mobile-ios'
    WHEN match(user_agent, 'ipad') THEN 'tablet-ios'
    WHEN match(user_agent, 'android.*tablet') THEN 'tablet-android'
    ELSE 'desktop'
END

-- Traffic Source Classification
CASE
    WHEN referrer = '' THEN 'Direct'
    WHEN utm_source != '' THEN 'Campaign'
    WHEN match(referrer, 'google|bing|yahoo') THEN 'Search'
    WHEN match(referrer, 'facebook|twitter|linkedin') THEN 'Social'
    ELSE 'Referral'
END
```

### 2. Page Views Processing (`process_page_views`)
**Materialized pipe for page view data**

- Filters out bot traffic
- Enriches with device and browser intelligence
- Applies traffic source classification
- Materializes to `analytics_page_views`

### 3. Custom Events Processing (`process_custom_events`)
**Materialized pipe for custom events**

- Processes custom event metadata
- Maintains user context
- Applies same enrichment as page views
- Materializes to `analytics_custom_events`

### 4. Request Processing (`process_requests`)
**Advanced bot detection and request classification**

#### Bot Detection Patterns:
- **Search Engine Bots**: Googlebot, Bingbot, Yahoo Slurp, DuckDuckBot
- **Social Media Crawlers**: Facebook, Twitter, LinkedIn bots
- **SEO Tools**: Ahrefs, SemRush crawlers
- **Suspicious Patterns**: Short user agents, Base64 encoding, empty agents

## Updated Materialized Views

### 1. Pages Analytics (`analytics_pages_mv`)
**Comprehensive page performance metrics**

#### New Dimensions:
- Hostname and pathname tracking
- Complete geographic breakdown
- UTM campaign attribution
- Device and browser classification
- Language and screen class

#### New Metrics:
- Visitor count (unique visitors)
- Page view count
- Total time on page
- Bounce rate calculation

### 2. Sessions Analytics (`analytics_sessions_mv`)
**Rich session-level insights**

#### Session Tracking:
- Entry and exit pages
- Session duration
- Bounce detection
- Geographic attribution
- Campaign attribution
- Device and browser classification

### 3. Traffic Sources (`analytics_sources_mv`)
**Advanced traffic attribution**

#### Attribution Tracking:
- Referrer analysis with classification
- UTM parameter tracking
- Channel classification
- Geographic source analysis
- Device-specific traffic patterns

## Bot Detection & Security

### Bot Classification System
1. **Search Engine Bots**: Google, Bing, Yahoo, DuckDuckGo
2. **Social Media Crawlers**: Facebook, Twitter, LinkedIn
3. **SEO Tools**: Ahrefs, SemRush, Moz
4. **Security Scanners**: Various security scanning tools
5. **Generic Bots**: Pattern-based detection
6. **Suspicious Traffic**: Anomalous user agent patterns

### Detection Methods:
- User agent pattern matching
- User agent length analysis
- Suspicious encoding detection
- Known bot signature matching
- Behavioral pattern analysis

## Mock Data Generation

### Comprehensive Test Data
The mock schema now generates realistic data for:
- **Geographic Distribution**: 10 countries with realistic city/region mapping
- **Device Mix**: 70% desktop, 20% mobile, 10% tablet
- **Browser Distribution**: Chrome (45%), Safari (25%), Firefox (15%), Edge (10%), Other (5%)
- **Traffic Sources**: Organic (40%), Direct (30%), Social (15%), Email (10%), Paid (5%)
- **Bot Traffic**: 10% realistic bot traffic for testing detection

### Sample Generation Command:
```bash
# Generate 10,000 realistic events
tb datasource generate analytics_events --count 10000
```

## Performance Optimizations

### Indexing Strategy
- **Partitioning**: By month (`toYYYYMM(timestamp)`)
- **Sorting Keys**: Optimized for query patterns
- **Sampling**: Visitor-based sampling for large datasets

### Query Optimization
- **Materialized Views**: Pre-aggregated common queries
- **LowCardinality**: Applied to categorical fields
- **Array Fields**: Efficient storage for metadata
- **TTL**: Automatic data lifecycle management

## Migration Checklist

### Data Source Updates
- [x] Enhanced `analytics_events` with 35+ new fields
- [x] Created `analytics_page_views` for processed page data

- [x] Created `analytics_custom_events` for business events
- [x] Created `analytics_requests` for security tracking

### Processing Pipeline Updates
- [x] Enhanced `analytics_hits` with intelligence
- [x] Created `process_page_views` materialized pipe
- [x] Created `process_custom_events` materialized pipe  
- [x] Created `process_requests` materialized pipe

### Materialized Views Updates
- [x] Enhanced `analytics_pages_mv` with comprehensive metrics
- [x] Enhanced `analytics_sessions_mv` with session intelligence
- [x] Enhanced `analytics_sources_mv` with attribution tracking

### Testing & Validation
- [x] Updated mock data schema for comprehensive testing
- [x] Created realistic data distributions
- [x] Validated bot detection accuracy

## Usage Examples

### Query Page Performance
```sql
SELECT 
    pathname,
    sumMerge(hits) as total_hits,
    uniqMerge(visits) as unique_visitors,
    avgMerge(total_duration) as avg_time_on_page
FROM analytics_pages_mv 
WHERE date >= today() - 7
GROUP BY pathname
ORDER BY total_hits DESC
```

### Analyze Traffic Sources
```sql
SELECT 
    channel,
    referrer_name,
    sumMerge(hits) as hits,
    uniqMerge(visits) as visitors,
    (sumMerge(bounces) / sumMerge(hits)) * 100 as bounce_rate
FROM analytics_sources_mv
WHERE date >= today() - 30
GROUP BY channel, referrer_name
ORDER BY visitors DESC
```

### Session Analysis
```sql
SELECT 
    country_code,
    device,
    avg(latest_hit - first_hit) as avg_session_duration,
    avg(page_views) as avg_pages_per_session,
    sum(is_bounce) / count() * 100 as bounce_rate
FROM analytics_sessions_mv
WHERE date >= today() - 7
GROUP BY country_code, device
```

## Next Steps

1. **Deploy Updated Schema**: Push all datasource and pipe changes
2. **Validate Data Flow**: Ensure proper data ingestion and processing
3. **Update Dashboard Queries**: Modify existing queries to use new rich data
4. **Monitor Performance**: Track query performance and optimize as needed
5. **Implement Alerting**: Set up monitoring for data quality and bot detection

## Support

For questions about this migration:
- Review the reference implementation in `/reference` folder
- Check existing pipes and datasources for examples
- Test changes using mock data generation
- Monitor Tinybird logs for any processing issues

---

**Migration Completed**: All components updated to enterprise-grade analytics tracking
**Compatibility**: Maintains backward compatibility while adding comprehensive new features
**Performance**: Optimized for high-volume analytics workloads 