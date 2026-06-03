const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, "dist");

try {
  fs.accessSync(DIST, fs.constants.R_OK);
  console.log(`[startup] dist found at ${DIST}`);
} catch {
  console.log(`[startup] dist NOT found at ${DIST}`);
}

try {
  const idx = path.join(DIST, "index.html");
  fs.accessSync(idx, fs.constants.R_OK);
  console.log(`[startup] index.html found at ${idx}`);
} catch {
  console.log(`[startup] index.html NOT found`);
}

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  console.log(`[request] ${req.method} ${req.url}`);

  if (req.url === "/health" || req.url === "/_health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    console.log(`[response] 200 /health`);
    return;
  }

  let filePath = path.join(DIST, req.url === "/" ? "index.html" : req.url);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      fs.readFile(path.join(DIST, "index.html"), (err2, fallback) => {
        if (err2) {
          console.log(`[response] 502 ${req.url}`);
          res.writeHead(502);
          res.end("Application failed to respond");
          return;
        }
        console.log(`[response] 200 ${req.url} (fallback to index.html)`);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fallback);
      });
      return;
    }
    console.log(`[response] 200 ${req.url}`);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("[fatal]", err);
});
