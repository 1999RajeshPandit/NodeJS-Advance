import { redisClient } from "../conn.js";
const RATELIMIT_DURATION_IN_SECONDS = 120;
const NUMBER_OF_REQUEST_ALLOWED = 5;

// This limiter is to limit client request it doesn't provide delay kind of implementation
export async function rateLimiter(req, res, next) {
  const userId = req.headers["user_id"];
  const count = await redisClient.get("user_" + userId);
  if (!count || +count < NUMBER_OF_REQUEST_ALLOWED) {
    await log("user_" + userId, +(count || 0) + 1);F
    return next();
  }
  res.status(429).send({
    success: false,
    message: "Too many requests",
  });
}

// This limiter is to limit client request & delay the request after certain request
export async function rateLimiter1(req, res, next) {
  const userId = req.headers["user_id"];
  const count = +((await redisClient.get("user_" + userId)) || 0);
  if (count < NUMBER_OF_REQUEST_ALLOWED) {
    await log("user_" + userId, count + 1);
    return next();
  } else if (count < 2 * NUMBER_OF_REQUEST_ALLOWED) {
    setTimeout(async () => {
      await log("user_" + userId, count + 1);
      return next();
    }, 2000);
  } else if (count < 3 * NUMBER_OF_REQUEST_ALLOWED) {
    setTimeout(async () => {
      await log("user_" + userId, count + 1);
      return next();
    }, 4000);
  } else {
    res.status(429).send({
      success: false,
      message: "Too many requests",
    });
  }
}

async function log(key, val) {
  await redisClient.set(key, val, "Ex", RATELIMIT_DURATION_IN_SECONDS);
}
