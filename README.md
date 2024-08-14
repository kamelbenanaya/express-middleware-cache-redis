# Express Redis Cache Middleware

A middleware for Express.js that provides request caching using Redis.

## Installation

```bash
npm install express-redis-cache-middleware
```

const express = require('express');
const expressRedisCacheMiddleware = require('express-redis-cache-middleware');

const app = express();
const redisUrl = process.env.REDIS_HOST;

const { checkCacheMiddleware, clearCacheMiddleware, redis } = expressRedisCacheMiddleware(redisUrl);

// Use middleware in your routes
app.get('/api/data', checkCacheMiddleware, (req, res) => {
// Your route handler
});

app.post('/api/data', clearCacheMiddleware('GET-/api/data'), (req, res) => {
// Your route handler
});
