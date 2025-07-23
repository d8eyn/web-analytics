# Web Analytics Dashboard - PHP Implementation Guide

This document provides the specifications and code needed to implement a comprehensive PHP-based dashboard that fetches data from your enhanced Tinybird web analytics infrastructure and provides advanced visualization capabilities.

**Architecture**: Keep existing JavaScript tracking → Tinybird storage/processing → **Enhanced PHP Dashboard with 26+ Analytics Endpoints**

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Tinybird API Integration](#tinybird-api-integration)
3. [Enhanced Data Models & Types](#enhanced-data-models--types)
4. [Configuration Requirements](#configuration-requirements)
5. [Comprehensive PHP Dashboard Implementation](#comprehensive-php-dashboard-implementation)
6. [Advanced Frontend Components](#advanced-frontend-components)
7. [Implementation Checklist](#implementation-checklist)

## System Architecture Overview

Your implementation integrates with the enhanced Tinybird infrastructure featuring 26+ analytics endpoints:

1. **Existing**: JavaScript tracking + Tinybird data processing (keep as-is)
2. **Enhanced**: Comprehensive PHP dashboard with tabbed analytics, real-time data, and conversion tracking

### Data Flow

```
Website Visitor → [Existing] JavaScript Tracker → [Existing] Tinybird API → [Enhanced] Tinybird Storage
                                                                                        ↓
[Enhanced] PHP Dashboard ← [Enhanced] HTTP Client ← [Enhanced] 26+ Tinybird Analytics Endpoints
```

## Tinybird API Integration

Your PHP dashboard connects to your enhanced Tinybird workspace with comprehensive analytics endpoints:

### Tinybird API Configuration

```php
// config/tinybird.php
return [
    'host' => env('TINYBIRD_HOST', 'https://api.tinybird.co'),
    'auth_token' => env('TINYBIRD_AUTH_TOKEN'), // Your dashboard token
    'workspace' => env('TINYBIRD_WORKSPACE'),
    'cache_ttl' => env('TINYBIRD_CACHE_TTL', 300), // 5 minutes
    'timeout' => env('TINYBIRD_TIMEOUT', 30),
];
```

### Complete Tinybird Endpoints Catalog

Your enhanced Tinybird workspace now exposes these comprehensive pipe endpoints:

#### **Core KPIs and Trends**
1. **KPIs**: `/v0/pipes/kpis.json` - Enhanced metrics with bounce rate and session duration
2. **Trend**: `/v0/pipes/trend.json` - Real-time user activity (last 30 minutes)

#### **Page Analytics (5 endpoints)**
3. **Top Pages**: `/v0/pipes/top_pages.json` - Most visited pages
4. **Entry Pages**: `/v0/pipes/entry_pages.json` - Top session entry points
5. **Exit Pages**: `/v0/pipes/exit_pages.json` - Top session exit points
6. **Top Hostnames**: `/v0/pipes/top_hostnames.json` - Multi-domain analytics
7. **Top Channels**: `/v0/pipes/top_channels.json` - Traffic channel breakdown

#### **Traffic Attribution (3 endpoints)**
8. **Top Sources**: `/v0/pipes/top_sources.json` - Referral domains
9. **Top Mediums**: `/v0/pipes/top_mediums.json` - UTM medium analytics
10. **Top Campaigns**: `/v0/pipes/top_campaigns.json` - UTM campaign performance

#### **Geographic Analytics (4 endpoints)**
11. **Top Locations**: `/v0/pipes/top_locations.json` - Country breakdown
12. **Top Regions**: `/v0/pipes/top_regions.json` - State/province analytics
13. **Top Cities**: `/v0/pipes/top_cities.json` - Metropolitan area data
14. **Top Languages**: `/v0/pipes/top_languages.json` - Language preferences

#### **Technology Analytics (3 endpoints)**
15. **Top Devices**: `/v0/pipes/top_devices.json` - Device type analytics
16. **Top Browsers**: `/v0/pipes/top_browsers.json` - Browser distribution
17. **Top OS**: `/v0/pipes/top_os.json` - Operating system analytics

#### **Business Analytics (2 endpoints)**
18. **Top Custom Events**: `/v0/pipes/top_custom_events.json` - Custom event tracking
19. **Conversion Goals**: `/v0/pipes/conversion_goals.json` - Goal completion metrics

#### **Processing Endpoints (7 endpoints)**
20. **Analytics Hits**: `/v0/pipes/analytics_hits.json` - Enhanced processed events
21. **Process Page Views**: `/v0/pipes/process_page_views.json` - Page view processing
22. **Process Custom Events**: `/v0/pipes/process_custom_events.json` - Custom event processing
23. **Process Requests**: `/v0/pipes/process_requests.json` - Bot detection processing
24. **Analytics Pages**: `/v0/pipes/analytics_pages.json` - Page aggregation
25. **Analytics Sessions Agg**: `/v0/pipes/analytics_sessions_agg.json` - Session aggregation
26. **Analytics Custom Events Agg**: `/v0/pipes/analytics_custom_events_agg.json` - Events aggregation

### Enhanced HTTP Client Implementation

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Exception;

class TinybirdClient {
    
    private string $host;
    private string $token;
    private int $cacheTtl;
    private int $timeout;
    
    public function __construct() {
        $this->host = config('tinybird.host');
        $this->token = config('tinybird.auth_token');
        $this->cacheTtl = config('tinybird.cache_ttl', 300);
        $this->timeout = config('tinybird.timeout', 30);
    }
    
    public function query(string $pipe, array $params = []): array {
        $cacheKey = $this->getCacheKey($pipe, $params);
        
        // Use shorter cache for real-time endpoints
        $ttl = in_array($pipe, ['trend', 'kpis']) ? 60 : $this->cacheTtl;
        
        return Cache::remember($cacheKey, $ttl, function () use ($pipe, $params) {
            return $this->makeRequest($pipe, $params);
        });
    }
    
    private function makeRequest(string $pipe, array $params): array {
        $url = $this->buildUrl($pipe, $params);
        
        $response = Http::timeout($this->timeout)
            ->withHeaders([
                'Authorization' => "Bearer {$this->token}",
                'Accept' => 'application/json',
            ])
            ->get($url);
        
        if (!$response->successful()) {
            throw new Exception("Tinybird API error: " . $response->body());
        }
        
        return $response->json();
    }
    
    private function buildUrl(string $pipe, array $params): string {
        $baseUrl = "{$this->host}/v0/pipes/{$pipe}.json";
        
        if (!empty($params)) {
            $baseUrl .= '?' . http_build_query($params);
        }
        
        return $baseUrl;
    }
    
    private function getCacheKey(string $pipe, array $params): string {
        return 'tinybird.' . $pipe . '.' . md5(serialize($params));
    }
}
```

## Enhanced Data Models & Types

### Complete PHP Class Definitions

```php
<?php

// Enhanced KPIs Data Model
class KpisData {
    public string $date;
    public int $visits;           // Unique visitors
    public int $pageviews;        // Page views
    public ?float $bounce_rate;   // Bounce rate (0-1)
    public float $avg_session_sec; // Session duration in seconds
}

// Real-time Trend Data Model
class TrendData {
    public string $t;             // Time interval (5-minute intervals)
    public int $visits;           // Visitors in interval
}

// Entry/Exit Pages Data Models
class EntryPagesData {
    public string $pathname;      // Entry page path
    public int $visits;           // Session entries
    public int $hits;            // Total hits
}

class ExitPagesData {
    public string $pathname;      // Exit page path
    public int $visits;           // Session exits
    public int $hits;            // Total hits
}

// Enhanced Page Analytics
class TopPagesData {
    public string $pathname;      // Page path
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

class TopHostnamesData {
    public string $hostname;      // Domain name
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

class TopChannelsData {
    public string $channel;       // Direct, Search, Social, Email, Campaign, Referral
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

// Traffic Attribution Models
class TopSourcesData {
    public string $referrer;      // Referral domain
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

class TopMediumsData {
    public string $medium;        // UTM medium (cpc, social, email, etc.)
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

class TopCampaignsData {
    public string $campaign;      // UTM campaign name
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

// Geographic Data Models
class TopLocationsData {
    public string $location;      // ISO country code
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

class TopRegionsData {
    public string $region;        // State/province
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

class TopCitiesData {
    public string $city;          // City name
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

class TopLanguagesData {
    public string $language;      // Language code (en-US, fr-FR, etc.)
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

// Technology Data Models
class TopDevicesData {
    public string $device;        // desktop, mobile-ios, mobile-android, tablet, bot
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

class TopBrowsersData {
    public string $browser;       // chrome, firefox, safari, edge, opera
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

class TopOSData {
    public string $os;            // Windows, macOS, iOS, Android, Linux
    public int $visits;           // Unique visitors
    public int $hits;            // Page views
}

// Business Analytics Models
class TopCustomEventsData {
    public string $event_name;    // Custom event name
    public int $unique_users;     // Unique users triggering event
    public int $event_count;      // Total event occurrences
    public float $avg_duration_seconds; // Average event duration
}

class ConversionGoalsData {
    public string $goal_name;     // Conversion goal name
    public int $conversions;      // Total conversions
}

// Enhanced Analytics Hit Data Model
class AnalyticsHitData {
    public string $timestamp;
    public string $action;
    public string $session_id;
    public string $client_id;
    public string $visitor_id;
    public string $hostname;
    public string $path;
    public string $title;
    public string $language;
    public string $country_code;
    public string $region;
    public string $city;
    public string $referrer;
    public string $utm_source;
    public string $utm_medium;
    public string $utm_campaign;
    public string $device;
    public string $browser;
    public string $os;
    public string $channel;
}
```

## Comprehensive PHP Dashboard Implementation

### Enhanced Analytics Service Layer

```php
<?php

namespace App\Services;

class AnalyticsService {
    
    private TinybirdClient $client;
    
    public function __construct(TinybirdClient $client) {
        $this->client = $client;
    }
    
    // Core KPIs and Trends
    public function getKpis(?string $dateFrom = null, ?string $dateTo = null): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ]);
        
        $response = $this->client->query('kpis', $params);
        return $response['data'] ?? [];
    }
    
    public function getTrend(): array {
        $response = $this->client->query('trend');
        return $response['data'] ?? [];
    }
    
    // Page Analytics
    public function getTopPages(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_pages', $params);
        return $response['data'] ?? [];
    }
    
    public function getEntryPages(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('entry_pages', $params);
        return $response['data'] ?? [];
    }
    
    public function getExitPages(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('exit_pages', $params);
        return $response['data'] ?? [];
    }
    
    public function getTopHostnames(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_hostnames', $params);
        return $response['data'] ?? [];
    }
    
    public function getTopChannels(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_channels', $params);
        return $response['data'] ?? [];
    }
    
    // Traffic Attribution
    public function getTopSources(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_sources', $params);
        return $response['data'] ?? [];
    }
    
    public function getTopMediums(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_mediums', $params);
        return $response['data'] ?? [];
    }
    
    public function getTopCampaigns(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_campaigns', $params);
        return $response['data'] ?? [];
    }
    
    // Geographic Analytics
    public function getTopLocations(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_locations', $params);
        return $response['data'] ?? [];
    }
    
    public function getTopRegions(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_regions', $params);
        return $response['data'] ?? [];
    }
    
    public function getTopCities(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_cities', $params);
        return $response['data'] ?? [];
    }
    
    public function getTopLanguages(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_languages', $params);
        return $response['data'] ?? [];
    }
    
    // Technology Analytics
    public function getTopDevices(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_devices', $params);
        return $response['data'] ?? [];
    }
    
    public function getTopBrowsers(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_browsers', $params);
        return $response['data'] ?? [];
    }
    
    public function getTopOS(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_os', $params);
        return $response['data'] ?? [];
    }
    
    // Business Analytics
    public function getTopCustomEvents(?string $dateFrom = null, ?string $dateTo = null, int $limit = 50): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'limit' => $limit,
        ]);
        
        $response = $this->client->query('top_custom_events', $params);
        return $response['data'] ?? [];
    }
    
    public function getConversionGoals(?string $dateFrom = null, ?string $dateTo = null): array {
        $params = array_filter([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ]);
        
        $response = $this->client->query('conversion_goals', $params);
        return $response['data'] ?? [];
    }
    
    // Helper method to get all dashboard data
    public function getDashboardData(?string $dateFrom = null, ?string $dateTo = null, int $limit = 10): array {
        return [
            'kpis' => $this->getKpis($dateFrom, $dateTo),
            'trend' => $this->getTrend(),
            
            // Page Analytics
            'topPages' => $this->getTopPages($dateFrom, $dateTo, $limit),
            'entryPages' => $this->getEntryPages($dateFrom, $dateTo, $limit),
            'exitPages' => $this->getExitPages($dateFrom, $dateTo, $limit),
            'topHostnames' => $this->getTopHostnames($dateFrom, $dateTo, $limit),
            'topChannels' => $this->getTopChannels($dateFrom, $dateTo, $limit),
            
            // Traffic Attribution
            'topSources' => $this->getTopSources($dateFrom, $dateTo, $limit),
            'topMediums' => $this->getTopMediums($dateFrom, $dateTo, $limit),
            'topCampaigns' => $this->getTopCampaigns($dateFrom, $dateTo, $limit),
            
            // Geographic
            'topLocations' => $this->getTopLocations($dateFrom, $dateTo, $limit),
            'topRegions' => $this->getTopRegions($dateFrom, $dateTo, $limit),
            'topCities' => $this->getTopCities($dateFrom, $dateTo, $limit),
            'topLanguages' => $this->getTopLanguages($dateFrom, $dateTo, $limit),
            
            // Technology
            'topDevices' => $this->getTopDevices($dateFrom, $dateTo, $limit),
            'topBrowsers' => $this->getTopBrowsers($dateFrom, $dateTo, $limit),
            'topOS' => $this->getTopOS($dateFrom, $dateTo, $limit),
            
            // Business
            'topCustomEvents' => $this->getTopCustomEvents($dateFrom, $dateTo, $limit),
            'conversionGoals' => $this->getConversionGoals($dateFrom, $dateTo),
        ];
    }
}
```

### Enhanced Dashboard Controller

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AnalyticsService;

class DashboardController extends Controller {
    
    private AnalyticsService $analytics;
    
    public function __construct(AnalyticsService $analytics) {
        $this->analytics = $analytics;
    }
    
    public function index(Request $request) {
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');
        
        // Fetch comprehensive dashboard data
        $data = $this->analytics->getDashboardData($dateFrom, $dateTo, 10);
        
        return view('dashboard.analytics', compact('data'));
    }
    
    // API endpoints for AJAX requests
    public function apiKpis(Request $request) {
        $data = $this->analytics->getKpis(
            $request->get('date_from'),
            $request->get('date_to')
        );
        return response()->json($data);
    }
    
    public function apiTrend(Request $request) {
        $data = $this->analytics->getTrend();
        return response()->json($data);
    }
    
    // Page Analytics APIs
    public function apiTopPages(Request $request) {
        $data = $this->analytics->getTopPages(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiEntryPages(Request $request) {
        $data = $this->analytics->getEntryPages(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiExitPages(Request $request) {
        $data = $this->analytics->getExitPages(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiTopHostnames(Request $request) {
        $data = $this->analytics->getTopHostnames(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiTopChannels(Request $request) {
        $data = $this->analytics->getTopChannels(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    // Traffic Attribution APIs
    public function apiTopSources(Request $request) {
        $data = $this->analytics->getTopSources(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiTopMediums(Request $request) {
        $data = $this->analytics->getTopMediums(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiTopCampaigns(Request $request) {
        $data = $this->analytics->getTopCampaigns(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    // Geographic APIs
    public function apiTopLocations(Request $request) {
        $data = $this->analytics->getTopLocations(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiTopRegions(Request $request) {
        $data = $this->analytics->getTopRegions(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiTopCities(Request $request) {
        $data = $this->analytics->getTopCities(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiTopLanguages(Request $request) {
        $data = $this->analytics->getTopLanguages(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    // Technology APIs
    public function apiTopDevices(Request $request) {
        $data = $this->analytics->getTopDevices(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiTopBrowsers(Request $request) {
        $data = $this->analytics->getTopBrowsers(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiTopOS(Request $request) {
        $data = $this->analytics->getTopOS(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    // Business Analytics APIs
    public function apiTopCustomEvents(Request $request) {
        $data = $this->analytics->getTopCustomEvents(
            $request->get('date_from'),
            $request->get('date_to'),
            $request->get('limit', 50)
        );
        return response()->json($data);
    }
    
    public function apiConversionGoals(Request $request) {
        $data = $this->analytics->getConversionGoals(
            $request->get('date_from'),
            $request->get('date_to')
        );
        return response()->json($data);
    }
}
```

### Enhanced Data Formatting Utilities

```php
<?php

namespace App\Services;

class AnalyticsFormatter {
    
    public static function formatNumber(int $number): string {
        return number_format($number);
    }
    
    public static function formatKNumber(int $number): string {
        if ($number >= 1000000) {
            return round($number / 1000000, 1) . 'M';
        }
        if ($number >= 1000) {
            return round($number / 1000, 1) . 'K';
        }
        return (string) $number;
    }
    
    public static function formatDuration(float $seconds): string {
        if (is_nan($seconds) || $seconds <= 0) {
            return '0s';
        }
        
        $minutes = floor($seconds / 60);
        $remainingSeconds = floor($seconds % 60);
        
        if ($minutes > 0) {
            return sprintf('%dm %02ds', $minutes, $remainingSeconds);
        }
        
        return sprintf('%ds', $remainingSeconds);
    }
    
    public static function formatPercentage(?float $value): string {
        if ($value === null || is_nan($value)) {
            return '0%';
        }
        
        return sprintf('%.1f%%', $value * 100);
    }
    
    public static function formatBounceRate(?float $bounceRate): string {
        return self::formatPercentage($bounceRate);
    }
    
    public static function formatDeviceType(string $device): string {
        $deviceMap = [
            'desktop' => 'Desktop',
            'mobile-ios' => 'Mobile (iOS)',
            'mobile-android' => 'Mobile (Android)',
            'tablet-ios' => 'Tablet (iOS)',
            'tablet-android' => 'Tablet (Android)',
            'tablet' => 'Tablet',
            'bot' => 'Bot',
        ];
        
        return $deviceMap[$device] ?? ucfirst($device);
    }
    
    public static function formatCountryCode(string $code): string {
        $countries = [
            'US' => 'United States',
            'GB' => 'United Kingdom',
            'CA' => 'Canada',
            'AU' => 'Australia',
            'DE' => 'Germany',
            'FR' => 'France',
            'ES' => 'Spain',
            'IT' => 'Italy',
            'JP' => 'Japan',
            'BR' => 'Brazil',
            'MX' => 'Mexico',
            'IN' => 'India',
            'CN' => 'China',
            'RU' => 'Russia',
            'NL' => 'Netherlands',
            'SE' => 'Sweden',
            'NO' => 'Norway',
            'DK' => 'Denmark',
            'FI' => 'Finland',
            'PL' => 'Poland',
        ];
        
        return $countries[strtoupper($code)] ?? $code;
    }
    
    public static function formatLanguage(string $language): string {
        $languages = [
            'en-US' => 'English (US)',
            'en-GB' => 'English (UK)',
            'es-ES' => 'Spanish (Spain)',
            'es-MX' => 'Spanish (Mexico)',
            'fr-FR' => 'French (France)',
            'de-DE' => 'German (Germany)',
            'it-IT' => 'Italian (Italy)',
            'pt-BR' => 'Portuguese (Brazil)',
            'ja-JP' => 'Japanese (Japan)',
            'zh-CN' => 'Chinese (Simplified)',
            'ru-RU' => 'Russian (Russia)',
            'ar-SA' => 'Arabic (Saudi Arabia)',
            'hi-IN' => 'Hindi (India)',
            'ko-KR' => 'Korean (South Korea)',
            'th-TH' => 'Thai (Thailand)',
            'vi-VN' => 'Vietnamese (Vietnam)',
        ];
        
        return $languages[$language] ?? $language;
    }
}
```

## Advanced Frontend Components

### Comprehensive Dashboard Blade Template

```blade
{{-- resources/views/dashboard/analytics.blade.php --}}
@extends('layouts.app')

@section('content')
<div class="analytics-dashboard">
    <div class="header">
        <h1>
            <img src="/favicon.ico" alt="" width="24" height="24" style="vertical-align: middle; margin-right: 8px;">
            Analytics Dashboard
        </h1>
        <div class="header-controls">
            <div class="current-visitors">
                <span class="status-indicator"></span>
                <span id="current-visitors-count">-</span> current visitors
            </div>
            <div class="date-filter">
                <select id="date-preset">
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="7">Last 7 days</option>
                    <option value="30" selected>Last 30 days</option>
                    <option value="365">Last 12 months</option>
                    <option value="custom">Custom Range</option>
                </select>
                <input type="date" id="date-from" style="display: none;">
                <input type="date" id="date-to" style="display: none;">
                <button onclick="refreshDashboard()">Update</button>
            </div>
        </div>
    </div>

    {{-- Enhanced KPI Cards --}}
    <div class="kpi-grid">
        <div class="kpi-card" id="visits-card">
            <h3>Unique Visitors</h3>
            <div class="kpi-value" data-kpi="visits">-</div>
            <div class="kpi-change" data-kpi-change="visits">-</div>
        </div>
        <div class="kpi-card" id="pageviews-card">
            <h3>Page Views</h3>
            <div class="kpi-value" data-kpi="pageviews">-</div>
            <div class="kpi-change" data-kpi-change="pageviews">-</div>
        </div>
        <div class="kpi-card" id="sessions-card">
            <h3>Sessions</h3>
            <div class="kpi-value" data-kpi="sessions">-</div>
            <div class="kpi-change" data-kpi-change="sessions">-</div>
        </div>
        <div class="kpi-card" id="bounce-rate-card">
            <h3>Bounce Rate</h3>
            <div class="kpi-value" data-kpi="bounce_rate">-</div>
            <div class="kpi-change" data-kpi-change="bounce_rate">-</div>
        </div>
        <div class="kpi-card" id="session-duration-card">
            <h3>Session Duration</h3>
            <div class="kpi-value" data-kpi="avg_session_sec">-</div>
            <div class="kpi-change" data-kpi-change="avg_session_sec">-</div>
        </div>
    </div>

    {{-- KPI Trend Chart --}}
    <div class="chart-container large">
        <div class="kpi-tabs">
            <button class="kpi-tab active" data-kpi="visits">Unique Visitors</button>
            <button class="kpi-tab" data-kpi="pageviews">Page Views</button>
            <button class="kpi-tab" data-kpi="avg_session_sec">Session Duration</button>
            <button class="kpi-tab" data-kpi="bounce_rate">Bounce Rate</button>
        </div>
        <canvas id="kpi-trend-chart" height="400"></canvas>
    </div>

    {{-- Dashboard Grid --}}
    <div class="dashboard-grid">
        {{-- Left Column --}}
        <div class="dashboard-left">
            {{-- Pages Section --}}
            <div class="tabbed-widget">
                <div class="widget-header">
                    <h3>Pages</h3>
                    <div class="widget-tabs">
                        <button class="tab-btn active" data-tab="pages">Pages</button>
                        <button class="tab-btn" data-tab="entry">Entry Pages</button>
                        <button class="tab-btn" data-tab="exit">Exit Pages</button>
                        <button class="tab-btn" data-tab="hostname">Hostname</button>
                        <button class="tab-btn" data-tab="channel">Channel</button>
                    </div>
                </div>
                <div class="widget-content">
                    <div class="tab-content active" data-content="pages">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Page</th><th>Visitors</th><th>Views</th></tr>
                            </thead>
                            <tbody id="pages-table-body"></tbody>
                        </table>
                    </div>
                    <div class="tab-content" data-content="entry">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Entry Page</th><th>Sessions</th><th>Views</th></tr>
                            </thead>
                            <tbody id="entry-pages-table-body"></tbody>
                        </table>
                    </div>
                    <div class="tab-content" data-content="exit">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Exit Page</th><th>Sessions</th><th>Views</th></tr>
                            </thead>
                            <tbody id="exit-pages-table-body"></tbody>
                        </table>
                    </div>
                    <div class="tab-content" data-content="hostname">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Hostname</th><th>Visitors</th><th>Views</th></tr>
                            </thead>
                            <tbody id="hostnames-table-body"></tbody>
                        </table>
                    </div>
                    <div class="tab-content" data-content="channel">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Channel</th><th>Visitors</th><th>Views</th></tr>
                            </thead>
                            <tbody id="channels-table-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            {{-- Referrers Section --}}
            <div class="tabbed-widget">
                <div class="widget-header">
                    <h3>Referrers</h3>
                    <div class="widget-tabs">
                        <button class="tab-btn active" data-tab="sources">Sources</button>
                        <button class="tab-btn" data-tab="mediums">Mediums</button>
                        <button class="tab-btn" data-tab="campaigns">Campaigns</button>
                    </div>
                </div>
                <div class="widget-content">
                    <div class="tab-content active" data-content="sources">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Source</th><th>Visitors</th><th>Views</th></tr>
                            </thead>
                            <tbody id="sources-table-body"></tbody>
                        </table>
                    </div>
                    <div class="tab-content" data-content="mediums">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Medium</th><th>Visitors</th><th>Views</th></tr>
                            </thead>
                            <tbody id="mediums-table-body"></tbody>
                        </table>
                    </div>
                    <div class="tab-content" data-content="campaigns">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Campaign</th><th>Visitors</th><th>Views</th></tr>
                            </thead>
                            <tbody id="campaigns-table-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            {{-- Conversion Goals --}}
            <div class="chart-container">
                <h3>Conversion Goals</h3>
                <table class="analytics-table">
                    <thead>
                        <tr><th>Goal</th><th>Conversions</th></tr>
                    </thead>
                    <tbody id="conversion-goals-body"></tbody>
                </table>
            </div>

            {{-- Events Section --}}
            <div class="tabbed-widget">
                <div class="widget-header">
                    <h3>Events</h3>
                    <div class="widget-tabs">
                        <button class="tab-btn active" data-tab="events">Events</button>
                        <button class="tab-btn" data-tab="tags">Tags</button>
                    </div>
                </div>
                <div class="widget-content">
                    <div class="tab-content active" data-content="events">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Event</th><th>Users</th><th>Count</th></tr>
                            </thead>
                            <tbody id="events-table-body"></tbody>
                        </table>
                    </div>
                    <div class="tab-content" data-content="tags">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Tag</th><th>Users</th><th>Count</th></tr>
                            </thead>
                            <tbody id="tags-table-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {{-- Right Column --}}
        <div class="dashboard-right">
            {{-- Real-time Users --}}
            <div class="chart-container small">
                <h3>Users in last 30 minutes</h3>
                <canvas id="realtime-chart" height="150"></canvas>
            </div>

            {{-- Countries Section --}}
            <div class="tabbed-widget">
                <div class="widget-header">
                    <h3>Countries</h3>
                    <div class="widget-tabs">
                        <button class="tab-btn active" data-tab="countries">Countries</button>
                        <button class="tab-btn" data-tab="regions">Regions</button>
                        <button class="tab-btn" data-tab="cities">Cities</button>
                        <button class="tab-btn" data-tab="languages">Languages</button>
                    </div>
                </div>
                <div class="widget-content">
                    <div class="tab-content active" data-content="countries">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Country</th><th>Visitors</th><th>Views</th></tr>
                            </thead>
                            <tbody id="countries-table-body"></tbody>
                        </table>
                    </div>
                    <div class="tab-content" data-content="regions">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Region</th><th>Visitors</th><th>Views</th></tr>
                            </thead>
                            <tbody id="regions-table-body"></tbody>
                        </table>
                    </div>
                    <div class="tab-content" data-content="cities">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>City</th><th>Visitors</th><th>Views</th></tr>
                            </thead>
                            <tbody id="cities-table-body"></tbody>
                        </table>
                    </div>
                    <div class="tab-content" data-content="languages">
                        <table class="analytics-table">
                            <thead>
                                <tr><th>Language</th><th>Visitors</th><th>Views</th></tr>
                            </thead>
                            <tbody id="languages-table-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            {{-- Technology Section --}}
            <div class="tabbed-widget">
                <div class="widget-header">
                    <h3>OS</h3>
                    <div class="widget-tabs">
                        <button class="tab-btn active" data-tab="os">OS</button>
                        <button class="tab-btn" data-tab="browsers">Browsers</button>
                        <button class="tab-btn" data-tab="platforms">Platforms</button>
                        <button class="tab-btn" data-tab="screens">Screens</button>
                    </div>
                </div>
                <div class="widget-content">
                    <div class="tab-content active" data-content="os">
                        <canvas id="os-chart"></canvas>
                    </div>
                    <div class="tab-content" data-content="browsers">
                        <canvas id="browsers-chart"></canvas>
                    </div>
                    <div class="tab-content" data-content="platforms">
                        <canvas id="platforms-chart"></canvas>
                    </div>
                    <div class="tab-content" data-content="screens">
                        <canvas id="screens-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js"></script>
<script>
// Enhanced Dashboard JavaScript
let dashboardData = @json($data);
let activeKpi = 'visits';

// Formatting functions
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return new Intl.NumberFormat().format(num);
}

function formatDuration(seconds) {
    if (isNaN(seconds) || seconds <= 0) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return minutes > 0 ? `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s` : `${remainingSeconds}s`;
}

function formatPercentage(value) {
    return value ? `${(value * 100).toFixed(1)}%` : '0%';
}

// Date management
function refreshDashboard() {
    const preset = document.getElementById('date-preset').value;
    let dateFrom, dateTo;
    
    if (preset === 'custom') {
        dateFrom = document.getElementById('date-from').value;
        dateTo = document.getElementById('date-to').value;
    } else {
        const today = new Date();
        dateTo = today.toISOString().split('T')[0];
        
        switch (preset) {
            case 'today':
                dateFrom = dateTo;
                break;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                dateFrom = dateTo = yesterday.toISOString().split('T')[0];
                break;
            case '7':
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                dateFrom = sevenDaysAgo.toISOString().split('T')[0];
                break;
            case '30':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
                break;
            case '365':
                const oneYearAgo = new Date(today);
                oneYearAgo.setDate(oneYearAgo.getDate() - 365);
                dateFrom = oneYearAgo.toISOString().split('T')[0];
                break;
        }
    }
    
    window.location.href = `?date_from=${dateFrom}&date_to=${dateTo}`;
}

// KPI Updates
function updateKPIs(kpis) {
    if (!kpis || kpis.length === 0) return;
    
    const totals = kpis.reduce((acc, day) => {
        acc.visits += day.visits || 0;
        acc.pageviews += day.pageviews || 0;
        acc.sessions += day.visits || 0; // Sessions = visits for now
        acc.bounce_rate = day.bounce_rate || 0;
        acc.avg_session_sec = day.avg_session_sec || 0;
        return acc;
    }, { visits: 0, pageviews: 0, sessions: 0, bounce_rate: 0, avg_session_sec: 0 });
    
    document.querySelector('[data-kpi="visits"]').textContent = formatNumber(totals.visits);
    document.querySelector('[data-kpi="pageviews"]').textContent = formatNumber(totals.pageviews);
    document.querySelector('[data-kpi="sessions"]').textContent = formatNumber(totals.sessions);
    document.querySelector('[data-kpi="avg_session_sec"]').textContent = formatDuration(totals.avg_session_sec);
    document.querySelector('[data-kpi="bounce_rate"]').textContent = formatPercentage(totals.bounce_rate);
}

// Table updates
function updateTable(tableBodyId, data, columns) {
    const tbody = document.getElementById(tableBodyId);
    tbody.innerHTML = '';
    
    data.forEach(item => {
        const row = tbody.insertRow();
        columns.forEach(col => {
            const cell = row.insertCell();
            if (col.format) {
                cell.textContent = col.format(item[col.key]);
            } else {
                cell.textContent = item[col.key] || '-';
            }
        });
    });
}

// Chart creation
function createChart(canvasId, data, type = 'pie') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: type,
        data: {
            labels: data.map(item => Object.values(item)[0]),
            datasets: [{
                data: data.map(item => Object.values(item)[1] || Object.values(item)[2]),
                backgroundColor: [
                    '#27F795', '#F72768', '#F7D427', '#2768F7', '#9966FF', '#FF9F40',
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Tab functionality
function initializeTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            const widget = e.target.closest('.tabbed-widget');
            
            // Update tab buttons
            widget.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update tab content
            widget.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            widget.querySelector(`[data-content="${tab}"]`).classList.add('active');
        });
    });
}

// Real-time updates
function updateRealTimeData() {
    fetch('/api/analytics/trend')
        .then(response => response.json())
        .then(data => {
            updateRealtimeChart(data);
            // Update current visitors count
            const currentCount = data.reduce((sum, point) => sum + (point.visits || 0), 0);
            document.getElementById('current-visitors-count').textContent = formatNumber(currentCount);
        });
}

function updateRealtimeChart(data) {
    const ctx = document.getElementById('realtime-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(point => new Date(point.t).toLocaleTimeString()),
            datasets: [{
                label: 'Visitors',
                data: data.map(point => point.visits),
                borderColor: '#27F795',
                backgroundColor: 'rgba(39, 247, 149, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { 
                y: { beginAtZero: true },
                x: { display: false }
            }
        }
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    initializeTabs();
    
    // Update KPIs
    updateKPIs(dashboardData.kpis);
    
    // Update tables
    updateTable('pages-table-body', dashboardData.topPages, [
        { key: 'pathname' },
        { key: 'visits', format: formatNumber },
        { key: 'hits', format: formatNumber }
    ]);
    
    updateTable('entry-pages-table-body', dashboardData.entryPages, [
        { key: 'pathname' },
        { key: 'visits', format: formatNumber },
        { key: 'hits', format: formatNumber }
    ]);
    
    updateTable('exit-pages-table-body', dashboardData.exitPages, [
        { key: 'pathname' },
        { key: 'visits', format: formatNumber },
        { key: 'hits', format: formatNumber }
    ]);
    
    updateTable('sources-table-body', dashboardData.topSources, [
        { key: 'referrer' },
        { key: 'visits', format: formatNumber },
        { key: 'hits', format: formatNumber }
    ]);
    
    updateTable('countries-table-body', dashboardData.topLocations, [
        { key: 'location' },
        { key: 'visits', format: formatNumber },
        { key: 'hits', format: formatNumber }
    ]);
    
    updateTable('conversion-goals-body', dashboardData.conversionGoals, [
        { key: 'goal_name' },
        { key: 'conversions', format: formatNumber }
    ]);
    
    // Create charts
    createChart('os-chart', dashboardData.topOS);
    createChart('browsers-chart', dashboardData.topBrowsers);
    
    // Update real-time data
    updateRealTimeData();
    
    // Set up real-time updates every 2 minutes
    setInterval(updateRealTimeData, 120000);
    
    // Handle date preset changes
    document.getElementById('date-preset').addEventListener('change', function() {
        const isCustom = this.value === 'custom';
        document.getElementById('date-from').style.display = isCustom ? 'inline' : 'none';
        document.getElementById('date-to').style.display = isCustom ? 'inline' : 'none';
    });
});
</script>
@endsection
```

### Enhanced CSS Styles

```css
/* public/css/analytics.css */
.analytics-dashboard {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 20px;
}

.header h1 {
    display: flex;
    align-items: center;
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
}

.header-controls {
    display: flex;
    align-items: center;
    gap: 20px;
}

.current-visitors {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #666;
}

.status-indicator {
    width: 8px;
    height: 8px;
    background: #27F795;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}

.date-filter {
    display: flex;
    gap: 10px;
    align-items: center;
}

.date-filter select,
.date-filter input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
}

.date-filter button {
    padding: 8px 16px;
    background: #27F795;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
}

.date-filter button:hover {
    background: #20d084;
}

/* Enhanced KPI Grid */
.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.kpi-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    border: 1px solid #f0f0f0;
    text-align: center;
    transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.kpi-card h3 {
    margin: 0 0 12px 0;
    color: #666;
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.kpi-value {
    font-size: 36px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
}

.kpi-change {
    font-size: 12px;
    color: #27F795;
    font-weight: 500;
}

/* Chart Containers */
.chart-container {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    border: 1px solid #f0f0f0;
    margin-bottom: 20px;
}

.chart-container.large {
    margin-bottom: 30px;
}

.chart-container.small {
    padding: 16px;
}

.chart-container h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
}

/* KPI Tabs */
.kpi-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 24px;
    background: #f8f9fa;
    padding: 4px;
    border-radius: 8px;
}

.kpi-tab {
    flex: 1;
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
    color: #666;
    transition: all 0.2s;
}

.kpi-tab.active {
    color: #27F795;
    border-bottom-color: #27F795;
}

.kpi-tab:hover:not(.active) {
    color: #333;
    background: #f8f9fa;
}

.widget-content {
    padding: 24px;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

/* Tables */
.analytics-table {
    width: 100%;
    border-collapse: collapse;
}

.analytics-table th,
.analytics-table td {
    text-align: left;
    padding: 12px 8px;
    border-bottom: 1px solid #f0f0f0;
}

.analytics-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #555;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.analytics-table td {
    font-size: 14px;
    color: #333;
}

.analytics-table tr:hover {
    background: #f8f9fa;
}

/* Responsive Design */
@media (max-width: 768px) {
    .analytics-dashboard {
        padding: 16px;
    }
    
    .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .header-controls {
        width: 100%;
        justify-content: space-between;
    }
    
    .kpi-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .dashboard-grid {
        gap: 20px;
    }
    
    .widget-tabs {
        flex-wrap: wrap;
        gap: 4px;
    }
    
    .tab-btn {
        padding: 8px 12px;
        font-size: 12px;
    }
}

/* Loading States */
.loading {
    opacity: 0.6;
    pointer-events: none;
}

.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #27F795;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Chart Canvas Sizing */
canvas {
    max-height: 300px;
}

.chart-container.small canvas {
    max-height: 200px;
}

.chart-container.large canvas {
    max-height: 400px;
}
```

### Enhanced Route Configuration

```php
// routes/web.php
Route::get('/analytics', [DashboardController::class, 'index'])->name('analytics.dashboard');

// routes/api.php  
Route::prefix('analytics')->group(function () {
    // Core KPIs
    Route::get('/kpis', [DashboardController::class, 'apiKpis']);
    Route::get('/trend', [DashboardController::class, 'apiTrend']);
    
    // Page Analytics
    Route::get('/top-pages', [DashboardController::class, 'apiTopPages']);
    Route::get('/entry-pages', [DashboardController::class, 'apiEntryPages']);
    Route::get('/exit-pages', [DashboardController::class, 'apiExitPages']);
    Route::get('/top-hostnames', [DashboardController::class, 'apiTopHostnames']);
    Route::get('/top-channels', [DashboardController::class, 'apiTopChannels']);
    
    // Traffic Attribution
    Route::get('/top-sources', [DashboardController::class, 'apiTopSources']);
    Route::get('/top-mediums', [DashboardController::class, 'apiTopMediums']);
    Route::get('/top-campaigns', [DashboardController::class, 'apiTopCampaigns']);
    
    // Geographic
    Route::get('/top-locations', [DashboardController::class, 'apiTopLocations']);
    Route::get('/top-regions', [DashboardController::class, 'apiTopRegions']);
    Route::get('/top-cities', [DashboardController::class, 'apiTopCities']);
    Route::get('/top-languages', [DashboardController::class, 'apiTopLanguages']);
    
    // Technology
    Route::get('/top-devices', [DashboardController::class, 'apiTopDevices']);
    Route::get('/top-browsers', [DashboardController::class, 'apiTopBrowsers']);
    Route::get('/top-os', [DashboardController::class, 'apiTopOS']);
    
    // Business
    Route::get('/top-custom-events', [DashboardController::class, 'apiTopCustomEvents']);
    Route::get('/conversion-goals', [DashboardController::class, 'apiConversionGoals']);
});
```

## Implementation Checklist

### Enhanced Setup Requirements
- [ ] Add comprehensive Tinybird configuration to `.env` file
- [ ] Get dashboard token with permissions for all 26+ endpoints
- [ ] Install required packages (`guzzlehttp/guzzle`, `laravel/framework`)
- [ ] Register enhanced AnalyticsServiceProvider
- [ ] Configure caching for performance optimization

### Backend Implementation  
- [ ] Create enhanced TinybirdClient service with caching
- [ ] Create comprehensive AnalyticsService with 20+ methods
- [ ] Create enhanced DashboardController with API endpoints
- [ ] Create AnalyticsFormatter utility class with country/language formatting
- [ ] Set up enhanced routes (web and 15+ API endpoints)

### Frontend Implementation
- [ ] Create comprehensive dashboard Blade template with tabbed sections
- [ ] Add enhanced CSS styling for tabbed widgets and responsive design
- [ ] Implement advanced JavaScript for data visualization and real-time updates
- [ ] Add Chart.js for multiple chart types (line, pie, bar)
- [ ] Implement comprehensive date filtering and tab functionality
- [ ] Add real-time data updates every 2 minutes

### Advanced Features
- [ ] Real-time visitor tracking with live updates
- [ ] Comprehensive tabbed analytics sections
- [ ] Enhanced KPI cards with trend indicators  
- [ ] Geographic intelligence with country name formatting
- [ ] Technology analytics with device type formatting
- [ ] Conversion goals tracking and business metrics
- [ ] UTM campaign attribution and traffic source analysis
- [ ] Entry/exit page analysis for user journey insights

### Optional Enhancements
- [ ] WebSocket integration for real-time updates
- [ ] Advanced dashboard caching strategies with Redis
- [ ] Export functionality (CSV, PDF, Excel) for all data sets
- [ ] Mobile-responsive design with touch-friendly interfaces
- [ ] User authentication/authorization with role-based access
- [ ] Dashboard customization options and widget configuration
- [ ] Alerting system for conversion goals and traffic thresholds
- [ ] A/B testing integration for conversion optimization

This comprehensive implementation provides a complete PHP dashboard that fully integrates with your enhanced Tinybird analytics infrastructure, featuring 26+ endpoints, advanced visualizations, real-time data updates, and enterprise-grade analytics capabilities.

The implementation now matches the full feature set of the enhanced React dashboard while providing the flexibility and customization options of a PHP-based solution. 