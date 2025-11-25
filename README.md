# Express Middleware Cache Redis

Boost your Express.js application's performance with effortless Redis caching.

**express-middleware-cache-redis** is a lightweight, flexible middleware wrapper that simplifies caching HTTP responses. It intercepts requests to serve cached data instantly and provides easy-to-use tools for invalidating cache when your data changes.

## 🚀 Features

- **Easy Integration**: Plug-and-play middleware for any Express route.
- **Flexible Connection**: Connect using a Redis URL string OR pass your existing `ioredis` client instance.
- **Smart Caching**: Automatically caches JSON responses based on the request method and URL.
- **Pattern-Based Clearing**: Easily clear groups of cached routes (e.g., all `/api/users` endpoints) with a simple prefix.
- **High Performance**: Built on top of `ioredis` for robust and fast Redis interactions.

## 📦 Installation

```bash
npm install express-middleware-cache-redis
```

Make sure you have [redis](https://redis.io/) installed and running on your machine or server.

## 🛠 Usage

### 1. Initialize the Middleware

You can initialize the package in two ways:

**Option A: Using a Connection String**
Great for quick setups or when you want the package to handle the connection.

```javascript
const express = require('express');
const expressRedisCache = require('express-middleware-cache-redis');

const app = express();

// Connect to local Redis
const { checkCacheMiddleware, clearCacheMiddleware } = expressRedisCache('redis://localhost:6379');
```

**Option B: Using an Existing Client**
Perfect if your app already uses `ioredis` and you want to share the connection.

```javascript
const Redis = require('ioredis');
const expressRedisCache = require('express-middleware-cache-redis');

const redisClient = new Redis(); // Your existing client
const { checkCacheMiddleware, clearCacheMiddleware } = expressRedisCache(redisClient);
```

### 2. Caching Responses (GET Requests)

Use `checkCacheMiddleware` on routes where you want to cache the output. The first time the route is hit, the response is saved to Redis. Subsequent requests are served instantly from the cache.

```javascript
app.get('/api/products', checkCacheMiddleware, async (req, res) => {
  // Heavy database operation...
  const products = await Product.find(); 
  
  // This JSON response will be cached automatically!
  res.json(products);
});
```

### 3. Clearing Cache (POST/PUT/DELETE Requests)

When you add or modify data, you need to clear the old cache so users see the changes. Use `clearCacheMiddleware` and provide a path prefix to match.

**Example:**
If you have cached data at:
- `GET /api/products`
- `GET /api/products/123`

You can clear ALL of them by targeting the `/api/products` prefix:

```javascript
app.post('/api/products', clearCacheMiddleware('/api/products'), async (req, res) => {
  const newProduct = await Product.create(req.body);
  
  // The cache for anything starting with "/api/products" is now cleared.
  res.json(newProduct);
});
```

## 📝 API Reference

### `expressRedisCache(clientOrUrl)`
- **clientOrUrl**: Can be a Redis connection string (e.g., `'redis://...'`) OR an `ioredis` client instance.
- **Returns**: An object containing `{ checkCacheMiddleware, clearCacheMiddleware, redis }`.

### `checkCacheMiddleware(req, res, next)`
- Middleware that checks if a cache exists for the current route.
- If found -> sends cached response.
- If not found -> proceeds to your handler and caches the result.

### `clearCacheMiddleware(prefix)`
- **prefix**: A string representing the URL path to clear.
- **Behavior**: Scans Redis for all keys containing this prefix and deletes them.
- **Example**: `clearCacheMiddleware('/api/users')` will remove cache for `GET-/api/users`, `GET-/api/users/active`, etc.

## 📄 License

ISC
