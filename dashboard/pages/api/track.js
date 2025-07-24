const DATASOURCE = 'analytics_events_api';
const MAX_PAYLOAD_SIZE = 10 * 1024; // 10KB limit

/**
 * Get client IP address from request headers
 */
const getClientIP = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    
    let ip = '0.0.0.0';
    
    if (forwarded) {
        ip = forwarded.split(',')[0].trim();
    } else if (realIp) {
        ip = realIp;
    } else if (cfConnectingIp) {
        ip = cfConnectingIp;
    } else {
        ip = req.socket.remoteAddress || '0.0.0.0';
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
    const headers = req.headers;
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
    if (headers['x-forwarded-for']?.includes('googlebot') ||
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
 * Post event to Tinybird HFI with enhanced data
 */
const _postEvent = async (event, req) => {
    const enrichedEvent = enrichTrackingData(event, req);
    
    const options = {
        method: 'post',
        body: JSON.stringify(enrichedEvent),
        headers: {
            'Authorization': `Bearer ${process.env.TINYBIRD_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    
    // Use the correct regional endpoint from environment
    const tinybirdHost = process.env.TINYBIRD_HOST || process.env.NEXT_PUBLIC_TINYBIRD_HOST || 'https://api.tinybird.co';
    const response = await fetch(`${tinybirdHost}/v0/datasources?name=${DATASOURCE}&mode=append&format=ndjson`, options);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.log('Tinybird error response:', errorText);
        throw new Error(`Tinybird error: ${response.statusText} - ${errorText}`);
    }

    return response.json();
};

/**
 * Rate limiting check (simple in-memory, use Redis for production)
 */
const rateLimitMap = new Map();
const isRateLimited = (ip) => {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 1000; // Max 1000 requests per minute per IP
    
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

export default async function handler(req, res) {
    // Set CORS headers for all requests
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOW_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Only allow POST method
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        // Check content length
        const contentLength = parseInt(req.headers['content-length'] || '0');
        if (contentLength > MAX_PAYLOAD_SIZE) {
            return res.status(413).json({ error: 'Payload too large' });
        }
        
        // Rate limiting
        const clientIP = getClientIP(req);
        if (isRateLimited(clientIP)) {
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }
        
        // Parse and validate JSON
        let eventData;
        try {
            eventData = req.body; // Next.js automatically parses JSON
            if (!eventData) {
                throw new Error('No data received');
            }
        } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON' });
        }
        
        // Process the event
        await _postEvent(eventData, req);
        
        return res.status(200).json({ status: 'ok' });
        
    } catch (error) {
        console.error('Tracking API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}; 