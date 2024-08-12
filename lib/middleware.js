module.exports = {
  checkCacheMiddleware: function (redisClient) {
    return async function (req, res, next) {
      try {
        const cacheKey = `${req.method}-${req.originalUrl}`;
        console.log("call cacheMiddleware with key:", cacheKey);

        const cacheEnabled = await redisClient.get(`${cacheKey}-enabled`);
        if (cacheEnabled === "true") {
          const cachedData = await redisClient.get(`${cacheKey}-data`);
          if (cachedData) {
            console.log("Returning cached data");
            return res.status(200).json(JSON.parse(cachedData));
          }
        }

        const originalJson = res.json;
        res.json = async (body) => {
          if (body && typeof body === "object") {
            try {
              await redisClient.set(`${cacheKey}-data`, JSON.stringify(body));
              await redisClient.set(`${cacheKey}-enabled`, "true");
              console.log("Cache updated with response data");
            } catch (error) {
              console.error(`Error updating cache for ${cacheKey}:`, error);
            }
          }
          console.log("Returning real data");
          return originalJson.call(res, body);
        };

        next();
      } catch (error) {
        console.error("Error in cache middleware:", error);
        next(error);
      }
    };
  },

  clearCacheMiddleware: function (redisClient) {
    return function (prefix) {
      return async (req, res, next) => {
        try {
          const pattern = `${prefix}*`;
          const stream = redisClient.scanStream({
            match: pattern,
            count: 100,
          });

          stream.on("data", async (keys) => {
            if (keys.length) {
              const pipeline = redisClient.pipeline();
              keys.forEach((key) => pipeline.del(key));
              await pipeline.exec();
              console.log(`Deleted keys: ${keys.join(", ")}`);
            }
          });

          stream.on("end", () => {
            console.log(`Cache clearing completed for prefix: ${prefix}`);
            next();
          });

          stream.on("error", (error) => {
            console.error(
              `Error during cache clearing for prefix ${prefix}:`,
              error
            );
            next(error);
          });
        } catch (error) {
          console.error(`Error in clearCacheMiddleware:`, error);
          next(error);
        }
      };
    };
  },
};
