const Redis = require("ioredis");
const debug = require("debug")("express-middleware-cache-redis:client");

function createRedisClient(clientOrUrl) {
  let redis;

  if (typeof clientOrUrl === "string") {
    redis = new Redis(clientOrUrl, {
      connectTimeout: 20000,
    });

    redis.on("connect", () => {
      debug("Connected to Redis");
    });

    redis.on("error", (err) => {
      console.error("Redis error:", err);
    });
  } else if (
    typeof clientOrUrl === "object" &&
    typeof clientOrUrl.get === "function"
  ) {
    redis = clientOrUrl;
  } else {
    throw new Error(
      "Invalid argument: Expected a Redis URL string or a Redis client instance."
    );
  }

  return redis;
}

module.exports = createRedisClient;
