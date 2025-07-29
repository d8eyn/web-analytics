// Enhanced funnel types matching reference implementation capabilities

export interface FunnelStepConfig {
  name: string;
  description?: string;
  
  // Path-based filters (enhanced)
  path?: string[];                    // Exact paths: ["/product", "/cart"]
  pathPattern?: string[];             // SQL LIKE patterns: ["/product%", "/cart%"]
  pathRegex?: string[];              // ClickHouse regex: ["(?i)^/product.*$"]
  entryPath?: string[];              // Entry page filtering
  exitPath?: string[];               // Exit page filtering
  
  // Event-based filters (enhanced)
  eventName?: string[];              // Multiple events: ["Add to Cart", "Purchase"]
  eventMeta?: Record<string, string>; // Event metadata: {"amount": "89.90", "currency": "USD"}
  eventMetaKey?: string[];           // Event meta keys for filtering
  
  // Technology filters
  os?: string[];                     // Operating systems
  osVersion?: string[];              // OS versions
  browser?: string[];                // Browsers
  browserVersion?: string[];         // Browser versions
  platform?: string[];              // Platform: ["desktop", "mobile"]
  screenClass?: string[];            // Screen classifications
  
  // Geographic filters
  country?: string[];                // Country codes
  countryCode?: string[];            // Alias for country
  region?: string[];                 // Regions
  city?: string[];                   // Cities
  language?: string[];               // Languages
  
  // Traffic source filters
  referrer?: string[];               // Full referrer URLs
  referrerName?: string[];           // Referrer names
  channel?: string[];                // Traffic channels
  utmSource?: string[];              // UTM source
  utmMedium?: string[];              // UTM medium
  utmCampaign?: string[];            // UTM campaign
  utmContent?: string[];             // UTM content
  utmTerm?: string[];                // UTM term
  
  // Custom filters
  tags?: Record<string, string>;     // Custom tags: {"currency": "USD"}
  tag?: string[];                    // Tag keys for filtering
  hostname?: string[];               // Hostname filtering
  
  // Visitor-specific filters
  visitorId?: number;                // Specific visitor (for debugging)
  sessionId?: string;                // Specific session (for debugging)
  
  // Step behavior
  sequenceMode?: 'any' | 'ordered';  // Whether step order matters
  timeWindow?: number;               // Max hours between this and previous step
}

export interface FunnelConfig {
  id: string;
  name: string;
  description?: string;
  steps: FunnelStepConfig[];         // Dynamic step count (minimum 2)
  
  // Global filters that apply to all steps
  dateRange?: {
    from?: string;
    to?: string;
  };
  
  // Funnel-specific settings
  maxSteps?: number;                 // Removed 4-step limit
  timeWindow?: number;               // Global time window (hours between steps)
  sequenceMode?: 'any' | 'ordered';  // Global sequence requirements
  includeTitle?: boolean;            // Include page titles in results
  includeTimeOnPage?: boolean;       // Include time on page metrics
  
  // Advanced options
  customMetricKey?: string;          // Custom metric calculations
  customMetricType?: 'avg' | 'sum' | 'count';
  excludeBots?: boolean;             // Exclude bot traffic (default: true)
  sample?: number;                   // Sampling rate for large datasets
}

export interface FunnelStepResult {
  step: number;
  name: string;
  visitors: number;
  relativeVisitors: number;          // % of total funnel visitors (step 1)
  previousVisitors: number;          // Visitors from previous step
  relativePreviousVisitors: number;  // % from previous step
  dropped: number;                   // Visitors who dropped off
  dropOff: number;                   // Drop-off rate from previous step
  conversionRate: number;            // Conversion rate from step 1
  
  // Enhanced metrics (optional)
  avgTimeToStep?: number;            // Average time to reach this step
  pageTitle?: string;                // Most common page title
  avgTimeOnPage?: number;            // Average time on page for this step
  customMetricAvg?: number;          // Custom metric average
  customMetricTotal?: number;        // Custom metric total
}

export interface FunnelResult {
  funnelId: string;
  funnelName: string;
  totalVisitors: number;
  steps: FunnelStepResult[];
  overallConversionRate: number;
  dateRange: {
    from: string;
    to: string;
  };
  
  // Enhanced result metadata
  totalSteps: number;                // Actual number of steps
  avgTimeToComplete?: number;        // Average time to complete entire funnel
  completionRate: number;            // Percentage who completed all steps
  processingTime?: number;           // Query execution time
}

// Enhanced API parameters for dynamic funnel processing
export interface FunnelApiParams {
  funnel_definition: string;         // JSON stringified enhanced FunnelConfig
  date_from?: string;
  date_to?: string;
  sample?: number;                   // Sampling for performance
}

// Reference-style funnel configurations with enhanced filtering
export const ENHANCED_FUNNELS: FunnelConfig[] = [
  {
    id: 'ecommerce-purchase-enhanced',
    name: 'Enhanced E-commerce Purchase Flow',
    description: 'Advanced tracking with regex patterns and event metadata',
    sequenceMode: 'ordered',
    timeWindow: 24, // 24 hours max between steps
    steps: [
      {
        name: 'Product Page View',
        description: 'User visits any product page',
        pathRegex: ['(?i)^/product/[^/]+$'],  // Regex: /product/anything
        sequenceMode: 'any'
      },
      {
        name: 'Add to Cart',
        description: 'User adds item to shopping cart',
        eventName: ['Add to Cart'],
        eventMeta: { 'action': 'add_to_cart' },
        path: ['/product'],  // Must still be on product page
        timeWindow: 2 // 2 hours max from product view
      },
      {
        name: 'Checkout Started',
        description: 'User begins checkout process',
        pathPattern: ['/checkout%'],
        eventName: ['Checkout Started', 'Begin Checkout']
      },
      {
        name: 'Purchase Completed',
        description: 'User completes purchase',
        eventName: ['Purchase', 'Order Complete'],
        eventMeta: { 'currency': 'USD' },
        tags: { 'conversion': 'purchase' }
      }
    ]
  },
  {
    id: 'signup-flow-advanced',
    name: 'Advanced User Signup Flow',
    description: 'Comprehensive signup tracking with geographic and tech filters',
    steps: [
      {
        name: 'Landing Page',
        description: 'User visits homepage',
        path: ['/'],
        country: ['US', 'CA', 'GB'] // Focus on key markets
      },
      {
        name: 'Pricing Page',
        description: 'User views pricing information',
        pathPattern: ['/pricing%'],
        platform: ['desktop'] // Desktop users more likely to convert
      },
      {
        name: 'Signup Form',
        description: 'User accesses signup form',
        pathRegex: ['(?i)^/signup.*$'],
        referrerName: ['Google', 'Bing'] // Track search traffic
      },
      {
        name: 'Account Created',
        description: 'User completes registration',
        eventName: ['signup', 'account_created'],
        eventMeta: { 'method': 'email' },
        tags: { 'conversion': 'signup' }
      }
    ]
  },
  {
    id: 'content-engagement-advanced',
    name: 'Advanced Content Engagement Flow',
    description: 'Multi-channel content engagement with UTM tracking',
    steps: [
      {
        name: 'Blog Entry',
        description: 'User enters blog section',
        pathPattern: ['/blog%'],
        utmSource: ['google', 'social', 'email'],
        language: ['en'] // English content focus
      },
      {
        name: 'Article Engagement',
        description: 'User reads article for meaningful time',
        eventName: ['article_read', 'content_engaged'],
        eventMeta: { 'read_time': '30' }, // 30+ seconds
        pathRegex: ['(?i)^/blog/[^/]+$']
      },
      {
        name: 'Social Share',
        description: 'User shares content',
        eventName: ['share', 'social_share'],
        eventMeta: { 'platform': 'twitter' }
      },
      {
        name: 'Newsletter Signup',
        description: 'User subscribes to newsletter',
        eventName: ['newsletter_signup', 'subscribe'],
        tags: { 'conversion': 'newsletter' },
        utmMedium: ['organic', 'social']
      }
    ]
  }
];

// Legacy configurations for backward compatibility
export const DEFAULT_FUNNELS: FunnelConfig[] = ENHANCED_FUNNELS; 