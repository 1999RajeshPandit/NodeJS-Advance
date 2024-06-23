import express from "express";
import { Transform } from "stream";
import fs from "fs";
import zlib from "zlib";
import path from "path";

export const streamRoutes = express.Router();
const __dirname = "src";

streamRoutes.get("/video", (req, res) => {
  const path = "src/files/song.mp4";
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

// stream log file 
streamRoutes.get("/log", (req, res) => {
  const stream = fs.createReadStream(path.join(__dirname,"files/log.txt"));
  // res.writeHead(206);
  // stream.on("data", (chunk) => {
  //   res.write(chunk);
  // });
  // stream.on("end", () => res.end);
  res.writeHead(206);
  stream.pipe(res);
});

// stream and transform log file in uppercase
streamRoutes.get("/log-upper", (req, res) => {
  const uppercaseTransform = new UppercaseTransform();
  const stream = fs.createReadStream("src/files/log.txt");
  // stream.pipe(uppercaseTransform).on("data", (chunk) => {
  //   res.write(chunk);
  // });
  // stream.on("end", () => res.end);
  res.writeHead(206);
  stream.pipe(uppercaseTransform).pipe(res);
});

// streamRoutes.get("/log-zip", (req, res) => {
//   const logFilePath = "src/files/log.txt";
//   const zipFilePath = "src/files/log.zip";

//   const logStream = fs.createReadStream(logFilePath);
//   const zipStream = fs.createWriteStream(zipFilePath);

//   logStream.pipe(zlib.createGzip()).pipe(zipStream)
//   on("finish", () => {
//     console.log("Zip file created successfully!");
//   })
// });
streamRoutes.get("/log-zip", (req, res) => {
  const logFilePath = "src/files/log.txt";

  const logStream = fs.createReadStream(logFilePath);

  // Set the appropriate headers for the zipped file
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="log.zip"');

  // Pipe the log file stream through the zlib.createGzip() stream and then to the response
  logStream.pipe(zlib.createGzip()).pipe(res);
});

class UppercaseTransform extends Transform {
  constructor() {
    super();
  }

  _transform(chunk, encoding, callback) {
    const uppercaseChunk = chunk.toString().toUpperCase();
    this.push(uppercaseChunk);
    callback();
  }
}
