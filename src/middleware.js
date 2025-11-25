const debug = require("debug")("express-middleware-cache-redis:middleware");

function createMiddleware(redis) {
  const checkCacheMiddleware = async function (req, res, next) {
    try {
      const cacheKey = `${req.method}-${req.originalUrl}`;
      debug("call cacheMiddleware with key: %s", cacheKey);

      const cacheEnabled = await redis.get(`${cacheKey}-enabled`);
      if (cacheEnabled === "true") {
        const cachedData = await redis.get(`${cacheKey}-data`);
        if (cachedData) {
          debug("Returning cached data");
          return res.status(200).json(JSON.parse(cachedData));
        }
      }

      const originalJson = res.json;
      res.json = async (body) => {
        if (body && typeof body === "object") {
          try {
            await redis.set(`${cacheKey}-data`, JSON.stringify(body));
            await redis.set(`${cacheKey}-enabled`, "true");
            debug("Cache updated with response data");
          } catch (error) {
            debug(`Error updating cache for ${cacheKey}: %o`, error);
          }
        }
        debug("Returning real data");
        return originalJson.call(res, body);
      };

      next();
    } catch (error) {
      debug("Error in cache middleware: %o", error);
      next(error);
    }
  };

  const clearCacheMiddleware = function (prefix) {
    return async (req, res, next) => {
      try {
        // Allow matching any method if just path is provided
        const pattern = `*${prefix}*`;
        const stream = redis.scanStream({
          match: pattern,
          count: 100,
        });

        stream.on("data", async (keys) => {
          if (keys.length) {
            const pipeline = redis.pipeline();
            keys.forEach((key) => pipeline.del(key));
            await pipeline.exec();
            debug(`Deleted keys: ${keys.join(", ")}`);
          }
        });

        stream.on("end", () => {
          debug(`Cache clearing completed for prefix: ${prefix}`);
          next();
        });

        stream.on("error", (error) => {
          debug(`Error during cache clearing for prefix ${prefix}: %o`, error);
          next(error);
        });
      } catch (error) {
        debug(`Error in clearCacheMiddleware: %o`, error);
        next(error);
      }
    };
  };

  return { checkCacheMiddleware, clearCacheMiddleware };
}

module.exports = createMiddleware;
