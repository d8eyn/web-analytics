const handler = require('./pages/api/track.js').default;

// Mock request and response objects
const mockReq = {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: {
    timestamp: "2025-07-23T16:07:07.523Z",
    action: "page_hit",
    session_id: "test-123",
    client_id: 78054946,
    visitor_id: 12984153,
    hostname: "cuppa.ai",
    path: "/",
    title: "Test Page",
    duration_seconds: 0
  }
};

const mockRes = {
  setHeader: () => {},
  status: (code) => ({
    json: (data) => {
      console.log('Response:', code, data);
      return mockRes;
    },
    end: () => {
      console.log('Response:', code);
      return mockRes;
    }
  })
};

// Test the handler
handler(mockReq, mockRes).catch(console.error); 