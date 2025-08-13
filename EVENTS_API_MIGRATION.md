# Migration to Tinybird Events API

## Overview
The tracking API has been migrated from using the Tinybird Data Sources API (`/v0/datasources`) to the [Tinybird Events API (`/v0/events`)](https://www.tinybird.co/docs/api-reference/events-api#post-v0events) for improved performance and reliability.

## Benefits of Events API

### 1. **Higher Rate Limits**
- **Events API**: 100 requests/second (6,000 requests/minute) by default
- **Data Sources API**: Lower rate limits
- Can request increased capacity if needed

### 2. **Built-in Idempotency**
- Automatic deduplication within a 5-hour window
- Safe to retry failed requests without data duplication
- Uses data hash to detect duplicate events

### 3. **Better Error Handling**
- Detailed HTTP status codes for different scenarios
- Clearer error messages for debugging
- Specific handling for Materialized View errors (422 status)

### 4. **Performance Options**
- `wait=false` (default): Async processing, returns 202 immediately
- `wait=true`: Sync processing, returns 200 after write acknowledgment
- Choose based on your data criticality needs

### 5. **Compression Support**
- Supports Gzip and Zstandard compression
- Reduces bandwidth for high-volume events
- Add `Content-Encoding: gzip` or `Content-Encoding: zstd` header

## Configuration

### Required Environment Variables
```bash
# Your Tinybird API token (no change)
TINYBIRD_TOKEN=your_tracker_token_here

# Tinybird host (no change)
TINYBIRD_HOST=https://api.tinybird.co
```

### Optional Environment Variables
```bash
# Set to 'true' for synchronous writes (wait for acknowledgment)
# Default is 'false' for faster async processing
TINYBIRD_WAIT_FOR_ACK=false
```

## Implementation Details

### Request Format
- **Endpoint**: `${TINYBIRD_HOST}/v0/events?name=${DATASOURCE}`
- **Method**: POST
- **Content-Type**: `application/x-ndjson`
- **Body**: Newline-delimited JSON (NDJSON)

### Status Codes
- **200**: Write acknowledged (when `wait=true`)
- **202**: Data accepted for async processing (when `wait=false`)
- **400**: Invalid request (missing parameters)
- **403**: Invalid token
- **404**: Workspace not found or wrong region
- **422**: Partial ingestion due to Materialized View error
- **429**: Rate limit exceeded
- **500**: Unexpected server error
- **503**: Service temporarily unavailable

### Rate Limiting
The application implements local rate limiting (1,000 requests/minute per IP) which is well below Tinybird's limit, providing an additional layer of protection against abuse.

## Migration Checklist

- [x] Update tracking endpoint from `/v0/datasources` to `/v0/events`
- [x] Change request format to NDJSON
- [x] Add proper error handling for Events API status codes
- [x] Configure `wait` parameter based on requirements
- [x] Update rate limiting documentation

## Monitoring

Monitor these metrics after migration:
1. **Response times**: Should be faster with `wait=false`
2. **Error rates**: Check for 429 (rate limit) errors
3. **Data ingestion**: Verify events are being processed
4. **Materialized View errors**: Watch for 422 status codes

## Rollback

If needed, revert to the Data Sources API by changing:
```javascript
// From (Events API):
const response = await fetch(`${tinybirdHost}/v0/events?name=${DATASOURCE}&wait=${waitForAck}`, options);

// To (Data Sources API):
const response = await fetch(`${tinybirdHost}/v0/datasources?name=${DATASOURCE}&mode=append&format=ndjson`, options);
```

## References
- [Tinybird Events API Documentation](https://www.tinybird.co/docs/api-reference/events-api#post-v0events)
- [Tinybird Ingestion Limits](https://www.tinybird.co/docs/limits#ingestion-limits)
