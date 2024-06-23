import cluster from "cluster";
import os from "os";
import process from "process";
import { app } from "./src/server.js";

const numCPUs = os.cpus().length;
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  console.log(`Total Worker CPU: ${numCPUs}`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  app().listen(3009, () => {
    console.log(`Server running: http://localhost:3009`);
  });
}
