const Redis = require("ioredis");

function createRedisClient(redisUrl) {
  const redis = new Redis(redisUrl, {
    connectTimeout: 20000,
  });

  redis.on("connect", () => {
    console.log("Connected to Redis");
  });

  redis.on("error", (err) => {
    console.error("Redis error:", err);
  });

  return redis;
}

module.exports = createRedisClient;
