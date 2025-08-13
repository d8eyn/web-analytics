import { NextRequest, NextResponse } from 'next/server'

const DATASOURCE = 'analytics_events_api';
const MAX_PAYLOAD_SIZE = 10 * 1024; // 10KB limit

/**
 * Get client IP address from request headers
 */
const getClientIP = (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    let ip = '0.0.0.0';
    
    if (forwarded) {
        ip = forwarded.split(',')[0].trim();
    } else if (realIp) {
        ip = realIp;
    } else if (cfConnectingIp) {
        ip = cfConnectingIp;
    } else {
        ip = '0.0.0.0'; // Can't get socket.remoteAddress in app router
    }
    
    // Convert IPv6 localhost to IPv4
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
        ip = '127.0.0.1';
    }
    
    // Remove IPv6 prefix if present
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }
    
    return ip;
};

/**
 * Enhanced bot detection based on headers and patterns
 */
const detectServerSideBot = (req, userAgent) => {
    const ua = (userAgent || '').toLowerCase();
    
    // Check for explicit bot patterns in user agent
    const botPatterns = [
        'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
        'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp', 'telegram',
        'crawler', 'spider', 'scraper', 'wget', 'curl', 'ahrefsbot'
    ];
    
    for (const pattern of botPatterns) {
        if (ua.includes(pattern)) {
            return { bot: 1, bot_reason: `Bot detected: ${pattern}` };
        }
    }
    
    // Check for suspicious bot indicators (but be less aggressive)
    if (req.headers.get('x-forwarded-for')?.includes('googlebot') ||
        (!userAgent || userAgent.length < 10)) {
        return { bot: 1, bot_reason: 'Suspicious bot indicators' };
    }
    
    return { bot: 0, bot_reason: '' };
};

/**
 * Validate and enrich tracking data
 */
const enrichTrackingData = (data, req) => {
    try {
        // Basic validation
        if (!data.timestamp || !data.action || !data.session_id) {
            throw new Error('Missing required fields');
        }
        
        // Server-side enrichment
        const clientIP = getClientIP(req);
        const serverBotInfo = detectServerSideBot(req, data.user_agent);
        
        // Enrich the data with all required schema fields
        const enrichedData = {
            // Core tracking data
            timestamp: data.timestamp,
            action: String(data.action || 'page_hit'),
            version: String(data.version || '1'),
            session_id: String(data.session_id),
            client_id: parseInt(data.client_id) || 0,
            visitor_id: parseInt(data.visitor_id) || 0,
            site_id: String(data.site_id || ''),
            hostname: String(data.hostname || ''),
            path: String(data.path || ''),
            title: String(data.title || ''),
            language: String(data.language || 'en'),
            country_code: String(data.country_code || '').slice(0, 2), // Ensure max 2 chars for FixedString(2)
            region: String(data.region || ''),
            city: String(data.city || ''),
            referrer: String(data.referrer || ''),
            referrer_name: String(data.referrer_name || ''),
            referrer_icon: String(data.referrer_icon || ''),
            os: String(data.os || ''),
            os_version: String(data.os_version || ''),
            browser: String(data.browser || ''),
            browser_version: String(data.browser_version || ''),
            desktop: parseInt(data.desktop) || 0,
            mobile: parseInt(data.mobile) || 0,
            screen_class: String(data.screen_class || ''),
            utm_source: String(data.utm_source || ''),
            utm_medium: String(data.utm_medium || ''),
            utm_campaign: String(data.utm_campaign || ''),
            utm_content: String(data.utm_content || ''),
            utm_term: String(data.utm_term || ''),
            channel: String(data.channel || 'Direct'),
            duration_seconds: parseInt(data.duration_seconds) || 0,
            
            // Event fields (with defaults for non-event tracking)
            event_name: String(data.event_name || ''),
            event_meta_keys: Array.isArray(data.event_meta_keys) ? data.event_meta_keys : [],
            event_meta_values: Array.isArray(data.event_meta_values) ? data.event_meta_values : [],
            tag_keys: Array.isArray(data.tag_keys) ? data.tag_keys : [],
            tag_values: Array.isArray(data.tag_values) ? data.tag_values : [],
            
            // Technical fields
            user_agent: String(data.user_agent || ''),
            ip: String(clientIP),
            bot: parseInt(serverBotInfo.bot || data.bot || 0),
            bot_reason: String(serverBotInfo.bot_reason || data.bot_reason || ''),
            payload: String(data.payload || ''),
            server_timestamp: new Date().toISOString()
        };
        
        return enrichedData;
    } catch (error) {
        console.error('Data enrichment error:', error);
        return data; // Return original data if enrichment fails
    }
};

/**
 * Post event to Tinybird Events API with enhanced data
 * Using the Events API for better rate limits and performance
 */
const _postEvent = async (event, req) => {
    const enrichedEvent = enrichTrackingData(event, req);
    
    // Events API expects NDJSON format (newline-delimited JSON)
    // Each event should be on its own line
    const ndjsonBody = JSON.stringify(enrichedEvent) + '\n';
    
    const options = {
        method: 'POST',
        body: ndjsonBody,
        headers: {
            'Authorization': `Bearer ${process.env.TINYBIRD_TOKEN}`,
            'Content-Type': 'application/x-ndjson'
        }
    };
    
    // Use the correct regional endpoint from environment
    const tinybirdHost = process.env.TINYBIRD_HOST || process.env.NEXT_PUBLIC_TINYBIRD_HOST || 'https://api.tinybird.co';
    
    // Using Events API endpoint for better rate limits (100 req/s default vs lower for datasources API)
    // wait=false for async processing (202 response) - faster but no immediate acknowledgment
    // wait=true for sync processing (200 response) - slower but guaranteed write acknowledgment
    const waitForAck = process.env.TINYBIRD_WAIT_FOR_ACK === 'true' ? 'true' : 'false';
    const response = await fetch(`${tinybirdHost}/v0/events?name=${DATASOURCE}&wait=${waitForAck}`, options);
    
    // Handle Events API specific status codes
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Tinybird Events API error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
        });
        
        // Handle specific error codes according to Events API documentation
        switch (response.status) {
            case 400:
                throw new Error(`Invalid request (missing parameters): ${errorText}`);
            case 403:
                throw new Error(`Invalid token: ${errorText}`);
            case 404:
                throw new Error(`Workspace not found or wrong region: ${errorText}`);
            case 422:
                // Partial ingestion due to Materialized View error
                console.warn('Partial ingestion completed - MV error:', errorText);
                return { status: 'partial', error: errorText };
            case 429:
                throw new Error(`Rate limit exceeded (100 req/s): ${errorText}`);
            case 500:
                throw new Error(`Unexpected server error: ${errorText}`);
            case 503:
                throw new Error(`Service temporarily unavailable (throughput limit or MV issue): ${errorText}`);
            default:
                throw new Error(`Tinybird error: ${response.statusText} - ${errorText}`);
        }
    }
    
    // Success responses:
    // 200: Write acknowledged (wait=true)
    // 202: Data accepted, will be written eventually (wait=false)
    if (response.status === 202) {
        return { status: 'accepted', message: 'Event queued for processing' };
    }
    
    return response.json();
};

/**
 * Rate limiting check (simple in-memory, use Redis for production)
 * Note: Tinybird Events API has a default limit of 100 req/s (6000/min)
 * Our local limit is more conservative to prevent abuse
 */
const rateLimitMap = new Map();
const isRateLimited = (ip) => {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 1000; // Max 1000 requests per minute per IP (well below Tinybird's 6000/min limit)
    
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return false;
    }
    
    const limit = rateLimitMap.get(ip);
    if (now > limit.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return false;
    }
    
    if (limit.count >= maxRequests) {
        return true;
    }
    
    limit.count++;
    return false;
};

// CORS headers helper
const corsHeaders = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
};

// Handle OPTIONS requests (preflight)
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}

// Handle POST requests
export async function POST(req) {
    try {
        // Check content length
        const contentLength = parseInt(req.headers.get('content-length') || '0');
        if (contentLength > MAX_PAYLOAD_SIZE) {
            return NextResponse.json(
                { error: 'Payload too large' },
                { status: 413, headers: corsHeaders }
            );
        }
        
        // Rate limiting
        const clientIP = getClientIP(req);
        if (isRateLimited(clientIP)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: corsHeaders }
            );
        }
        
        // Parse and validate JSON
        let eventData;
        try {
            eventData = await req.json();
            if (!eventData) {
                throw new Error('No data received');
            }
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid JSON' },
                { status: 400, headers: corsHeaders }
            );
        }
        
        // Process the event
        await _postEvent(eventData, req);
        
        return NextResponse.json(
            { status: 'ok' },
            { status: 200, headers: corsHeaders }
        );
        
    } catch (error) {
        console.error('Tracking API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
} 