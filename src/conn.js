import { Redis } from "ioredis";
export const redisClient = new Redis({ url: "redis://localhost:8001" });
