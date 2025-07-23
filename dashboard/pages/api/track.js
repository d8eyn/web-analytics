const DATASOURCE = 'analytics_events_new';
const MAX_PAYLOAD_SIZE = 10 * 1024; // 10KB limit

/**
 * Get client IP address from request headers
 */
const getClientIP = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIp) {
        return realIp;
    }
    if (cfConnectingIp) {
        return cfConnectingIp;
    }
    
    return req.socket.remoteAddress || '0.0.0.0';
};

/**
 * Enhanced bot detection based on headers and patterns
 */
const detectServerSideBot = (req, userAgent) => {
    const headers = req.headers;
    
    // Check for common bot headers
    if (headers['x-forwarded-for']?.includes('googlebot') ||
        headers['user-agent']?.toLowerCase().includes('bot') ||
        !headers['accept'] ||
        !headers['accept-language']) {
        return { bot: 1, bot_reason: 'Server-side bot detection' };
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
            action: data.action || 'page_hit',
            version: data.version || '1',
            session_id: data.session_id,
            client_id: data.client_id || 0,
            visitor_id: data.visitor_id || 0,
            site_id: data.site_id || '',
            hostname: data.hostname || '',
            path: data.path || '',
            title: data.title || '',
            language: data.language || 'en',
            country_code: (data.country_code || '').slice(0, 2), // Ensure max 2 chars for FixedString(2)
            region: data.region || '',
            city: data.city || '',
            referrer: data.referrer || '',
            referrer_name: data.referrer_name || '',
            referrer_icon: data.referrer_icon || '',
            os: data.os || '',
            os_version: data.os_version || '',
            browser: data.browser || '',
            browser_version: data.browser_version || '',
            desktop: data.desktop || 0,
            mobile: data.mobile || 0,
            screen_class: data.screen_class || '',
            utm_source: data.utm_source || '',
            utm_medium: data.utm_medium || '',
            utm_campaign: data.utm_campaign || '',
            utm_content: data.utm_content || '',
            utm_term: data.utm_term || '',
            channel: data.channel || 'Direct',
            duration_seconds: data.duration_seconds || 0,
            
            // Event fields (with defaults for non-event tracking)
            event_name: data.event_name || '',
            event_meta_keys: data.event_meta_keys || [],
            event_meta_values: data.event_meta_values || [],
            tag_keys: data.tag_keys || [],
            tag_values: data.tag_values || [],
            
            // Technical fields
            user_agent: data.user_agent || '',
            ip: clientIP,
            bot: serverBotInfo.bot || data.bot || 0,
            bot_reason: serverBotInfo.bot_reason || data.bot_reason || '',
            payload: data.payload || '',
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
    const response = await fetch(`${tinybirdHost}/v0/events?name=${DATASOURCE}`, options);
    if (!response.ok) {
        throw new Error(`Tinybird error: ${response.statusText}`);
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