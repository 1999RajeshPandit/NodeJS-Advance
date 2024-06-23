import express from "express";
import { rateLimiter1 } from "./middleware/rate-limiter.js"; // this limitter slow down n than send 429
import { libraryRoutes } from "./library.route.js";
import { streamRoutes } from "./stream.route.js";
import app_status from "express-status-monitor";

export function app() {
  const server = express();

  // monitoring app
  server.use(
    app_status({
      title: "Express Status Monitor",
      path: "/status",
    })
  );
  //parse json
  server.use(express.json());

  // rate limitter hands on
  server.get("/ping", rateLimiter1, async (req, res) => {
    res.status(200).json({
      success: true,
      message: "pong",
    });
  });

  server.use("/library", libraryRoutes);
  server.use("/stream", streamRoutes);

  return server;
}
