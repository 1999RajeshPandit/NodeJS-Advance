import express from "express";
import { redisClient as redisStore } from "./conn.js";
import { rateLimiter } from "./middleware/rate-limiter.js";

export const libraryRoutes = express.Router();
libraryRoutes.use(rateLimiter); 

// Redis HashSet hands on
libraryRoutes.post("/", async (req, res) => {
  const { id, count, name } = req.body;
  const bookKey = `book:${id}`;
  const existingBook = await redisStore.hgetall(bookKey);
  if (Object.keys(existingBook).length > 0) {
    const existingCount = parseInt(existingBook.count, 10);
    const newCount = existingCount + count;
    await redisStore.hset(bookKey, "count", newCount);
  } else {
    await redisStore.hset(bookKey, "count", count, "name", name);
  }
  await redisStore.expire(bookKey, 90);
  return res.status(200).json({
    success: true,
    message: "book added/updated in library",
  });
});

libraryRoutes.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const data = await redisStore.del("book:" + id);
  return res.status(200).json({
    success: true,
    message: "book deleted in library",
  });
});
