# Dynamic Type Handling for Event Metadata

## Overview

This document describes the dynamic type handling system for custom event metadata and page tags. The solution allows tracking of user-defined data with automatic type detection and proper type conversion at query time.

## Architecture

### 1. Client-Side Type Detection (script.js)

The tracking script now automatically detects data types and stores type hints alongside values:

```javascript
// Example usage
UMNTR.trackEvent('purchase', {
  product_id: 'SKU-123',      // Detected as: string
  price: 29.99,                // Detected as: float
  quantity: 3,                 // Detected as: integer
  is_discounted: true,         // Detected as: boolean
  categories: ['electronics'], // Detected as: array
  metadata: { color: 'blue' }  // Detected as: object
});
```

### 2. Data Storage Schema

The schema now includes type hint arrays:

```sql
-- analytics_events_api.datasource
`event_meta_keys` Array(String)    -- Field names
`event_meta_values` Array(String)  -- Values (all stored as strings)
`event_meta_types` Array(String)   -- Type hints: 'string', 'integer', 'float', 'boolean', 'array', 'object', 'null'

`tag_keys` Array(String)
`tag_values` Array(String)
`tag_types` Array(String)
```

### 3. Type Detection Logic

The JavaScript tracking script detects types as follows:

| JavaScript Type | Detected As | Storage Format | Example |
|----------------|-------------|----------------|---------|
| `null/undefined` | `'null'` | Empty string `''` | `null` → `''` |
| `Array` | `'array'` | JSON string | `[1,2,3]` → `'[1,2,3]'` |
| `Object` | `'object'` | JSON string | `{a:1}` → `'{"a":1}'` |
| `Number (integer)` | `'integer'` | String | `42` → `'42'` |
| `Number (float)` | `'float'` | String | `3.14` → `'3.14'` |
| `Boolean` | `'boolean'` | String | `true` → `'true'` |
| `String` | `'string'` | String | `'hello'` → `'hello'` |

## Querying Dynamic Data

### Basic Query with Type Conversion

```sql
-- Extract and convert a specific metadata field
SELECT
  event_name,
  event_meta_keys[indexOf(event_meta_keys, 'price')] as key,
  event_meta_values[indexOf(event_meta_keys, 'price')] as raw_value,
  event_meta_types[indexOf(event_meta_keys, 'price')] as type,
  -- Convert based on type hint
  CASE event_meta_types[indexOf(event_meta_keys, 'price')]
    WHEN 'integer' THEN toInt64OrNull(event_meta_values[indexOf(event_meta_keys, 'price')])
    WHEN 'float' THEN toFloat64OrNull(event_meta_values[indexOf(event_meta_keys, 'price')])
    ELSE NULL
  END as numeric_value
FROM analytics_events_api
WHERE has(event_meta_keys, 'price')
```

### Dynamic Aggregations

The `dynamic_event_metadata_query.pipe` provides several nodes for different query patterns:

#### 1. Aggregate Metrics by Type

```sql
-- Automatically applies appropriate aggregations based on type
SELECT
  metadata_key,
  data_type,
  CASE data_type
    WHEN 'integer' THEN avg(toInt64OrNull(value))
    WHEN 'float' THEN avg(toFloat64OrNull(value))
    WHEN 'boolean' THEN countIf(value = 'true') / count()
    ELSE NULL
  END as avg_value
FROM events
GROUP BY metadata_key, data_type
```

#### 2. Query Specific Fields

Use the `query_specific_values` node with parameters:

```bash
# Query a specific metadata field
curl "https://api.tinybird.co/v0/pipes/dynamic_event_metadata_query.json?metadata_key=price&event_name=purchase"
```

#### 3. Get Metadata Overview

Use the `aggregated_metrics` node to see all metadata fields with their types and statistics:

```bash
# Get overview of all metadata fields
curl "https://api.tinybird.co/v0/pipes/dynamic_event_metadata_query.json"
```

## Practical Examples

### Example 1: E-commerce Event Tracking

```javascript
// Client-side tracking
UMNTR.trackEvent('add_to_cart', {
  product_id: 'PROD-123',
  product_name: 'Wireless Mouse',
  price: 29.99,
  quantity: 2,
  in_stock: true,
  categories: ['Electronics', 'Accessories'],
  attributes: {
    color: 'black',
    warranty_months: 12
  }
});
```

This will be stored as:
- `event_meta_keys`: `['product_id', 'product_name', 'price', 'quantity', 'in_stock', 'categories', 'attributes']`
- `event_meta_values`: `['PROD-123', 'Wireless Mouse', '29.99', '2', 'true', '["Electronics","Accessories"]', '{"color":"black","warranty_months":12}']`
- `event_meta_types`: `['string', 'string', 'float', 'integer', 'boolean', 'array', 'object']`

### Example 2: Querying Numeric Ranges

```sql
-- Find all purchases with price between 20 and 50
SELECT
  timestamp,
  event_name,
  toFloat64OrNull(
    event_meta_values[indexOf(event_meta_keys, 'price')]
  ) as price
FROM analytics_events_api
WHERE 
  event_name = 'purchase'
  AND has(event_meta_keys, 'price')
  AND event_meta_types[indexOf(event_meta_keys, 'price')] IN ('float', 'integer')
  AND toFloat64OrNull(event_meta_values[indexOf(event_meta_keys, 'price')]) BETWEEN 20 AND 50
```

### Example 3: Boolean Field Analysis

```sql
-- Calculate conversion rate for discounted items
SELECT
  countIf(
    event_meta_values[indexOf(event_meta_keys, 'is_discounted')] = 'true'
  ) / count() as discount_rate
FROM analytics_events_api
WHERE 
  event_name = 'purchase'
  AND has(event_meta_keys, 'is_discounted')
  AND event_meta_types[indexOf(event_meta_keys, 'is_discounted')] = 'boolean'
```

### Example 4: Working with Arrays and Objects

```sql
-- Extract categories from array field
SELECT
  JSONExtractArrayRaw(
    event_meta_values[indexOf(event_meta_keys, 'categories')]
  ) as categories
FROM analytics_events_api
WHERE 
  has(event_meta_keys, 'categories')
  AND event_meta_types[indexOf(event_meta_keys, 'categories')] = 'array'

-- Extract specific object field
SELECT
  JSONExtractString(
    event_meta_values[indexOf(event_meta_keys, 'attributes')],
    'color'
  ) as color
FROM analytics_events_api
WHERE 
  has(event_meta_keys, 'attributes')
  AND event_meta_types[indexOf(event_meta_keys, 'attributes')] = 'object'
```

## Helper Functions

### Create a ClickHouse Function for Easy Access

```sql
-- Function to get typed value
CREATE FUNCTION getTypedMetaValue AS (keys, values, types, key_name) ->
  CASE types[indexOf(keys, key_name)]
    WHEN 'integer' THEN toString(toInt64OrNull(values[indexOf(keys, key_name)]))
    WHEN 'float' THEN toString(toFloat64OrNull(values[indexOf(keys, key_name)]))
    WHEN 'boolean' THEN toString(values[indexOf(keys, key_name)] = 'true')
    ELSE values[indexOf(keys, key_name)]
  END;

-- Usage
SELECT
  getTypedMetaValue(event_meta_keys, event_meta_values, event_meta_types, 'price') as price
FROM analytics_events_api
```

## Migration Guide

### For Existing Implementations

If you have existing data without type hints:

1. **Backward Compatibility**: The system defaults to `'string'` type if no type hints are present:
   ```sql
   coalesce(event_meta_types, arrayMap(x -> 'string', event_meta_values)) as event_meta_types
   ```

2. **Gradual Migration**: New events will have type hints while old events continue to work as strings.

3. **Type Inference**: For existing data, you can infer types at query time:
   ```sql
   CASE
     WHEN match(value, '^-?[0-9]+$') THEN 'integer'
     WHEN match(value, '^-?[0-9]+\.[0-9]+$') THEN 'float'
     WHEN value IN ('true', 'false') THEN 'boolean'
     WHEN startsWith(value, '[') AND endsWith(value, ']') THEN 'array'
     WHEN startsWith(value, '{') AND endsWith(value, '}') THEN 'object'
     ELSE 'string'
   END as inferred_type
   ```

## Performance Considerations

1. **Indexing**: The type hints are lightweight strings, adding minimal overhead.

2. **Query Optimization**: Use type hints to avoid unnecessary type conversions:
   ```sql
   -- Efficient: Only convert numeric types
   WHERE event_meta_types[idx] IN ('integer', 'float')
   ```

3. **Materialized Views**: Consider creating materialized views for frequently accessed typed fields:
   ```sql
   CREATE MATERIALIZED VIEW purchase_metrics
   ENGINE = MergeTree()
   ORDER BY (timestamp, product_id)
   AS SELECT
     timestamp,
     event_meta_values[indexOf(event_meta_keys, 'product_id')] as product_id,
     toFloat64OrNull(event_meta_values[indexOf(event_meta_keys, 'price')]) as price,
     toInt64OrNull(event_meta_values[indexOf(event_meta_keys, 'quantity')]) as quantity
   FROM analytics_events_api
   WHERE event_name = 'purchase'
   ```

## API Usage Examples

### Dashboard Integration

```typescript
// TypeScript interface for typed metadata
interface EventMetadata {
  keys: string[];
  values: string[];
  types: ('string' | 'integer' | 'float' | 'boolean' | 'array' | 'object' | 'null')[];
}

// Helper function to parse typed values
function parseMetadataValue(value: string, type: string): any {
  switch(type) {
    case 'integer':
      return parseInt(value);
    case 'float':
      return parseFloat(value);
    case 'boolean':
      return value === 'true';
    case 'array':
    case 'object':
      return JSON.parse(value);
    case 'null':
      return null;
    default:
      return value;
  }
}

// Convert metadata arrays to object
function metadataToObject(metadata: EventMetadata): Record<string, any> {
  const result: Record<string, any> = {};
  metadata.keys.forEach((key, index) => {
    result[key] = parseMetadataValue(
      metadata.values[index],
      metadata.types[index]
    );
  });
  return result;
}
```

## Troubleshooting

### Common Issues

1. **Type Mismatch**: If a field sometimes has different types:
   ```sql
   -- Handle mixed types gracefully
   coalesce(
     toFloat64OrNull(value),
     toInt64OrNull(value),
     0
   ) as numeric_value
   ```

2. **Missing Type Hints**: For data without type hints:
   ```sql
   -- Fallback to string comparison
   IF(
     length(event_meta_types) > 0,
     event_meta_types[idx],
     'string'
   ) as type_hint
   ```

3. **JSON Parsing Errors**: Validate JSON before parsing:
   ```sql
   IF(
     isValidJSON(value),
     JSONExtract(value, 'String'),
     value
   ) as safe_extract
   ```

## Best Practices

1. **Consistent Naming**: Use consistent field names across events for easier querying.

2. **Type Consistency**: Keep the same field with the same type across different events.

3. **Validation**: Validate data types on the client side before sending:
   ```javascript
   function validateEventData(data) {
     Object.entries(data).forEach(([key, value]) => {
       if (value !== null && value !== undefined) {
         // Ensure value can be properly stringified
         if (typeof value === 'object') {
           JSON.stringify(value); // Will throw if not serializable
         }
       }
     });
   }
   ```

4. **Documentation**: Document expected metadata fields and their types for each event.

5. **Testing**: Test with various data types to ensure proper handling:
   ```javascript
   // Test case
   UMNTR.trackEvent('test_event', {
     string_field: 'text',
     int_field: 42,
     float_field: 3.14,
     bool_field: true,
     array_field: [1, 2, 3],
     object_field: { nested: 'value' },
     null_field: null
   });
   ```

## Future Enhancements

Potential improvements to consider:

1. **Schema Registry**: Maintain a registry of known event schemas with expected types.

2. **Type Validation**: Add server-side validation to ensure type consistency.

3. **Compression**: Use more efficient encoding for type hints (e.g., single character codes).

4. **Native Variant Support**: When ClickHouse Variant type becomes stable, migrate to native support.

5. **Automatic Indexing**: Automatically create indexes for frequently queried typed fields.
