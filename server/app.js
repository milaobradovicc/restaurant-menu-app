require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { getConfig } = require("./config");

function createApp(config) {
  const app = express();
  app.use(cors({ origin(origin, callback) {
    if (!origin || config.allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed"));
  } }));
  app.use(express.json({ limit: "100kb" }));
  app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "7d", immutable: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/categories", require("./routes/categories"));
  app.use("/api/products", require("./routes/products"));
  app.use("/api/logo", require("./routes/logo"));
  app.use("/api/auth", require("./routes/authRoutes"));
  app.use((error, _req, res, _next) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Slika je veca od dozvoljenih 5 MB." : "Dozvoljeni su samo JPG, PNG i WebP fajlovi." });
    }
    console.error(error);
    return res.status(error.status || 500).json({ message: "Greska na serveru." });
  });
  return app;
}

async function startServer() {
  const config = getConfig();
  await mongoose.connect(config.mongoUri);
  return createApp(config).listen(config.port, "0.0.0.0", () => console.log(`Backend server radi na portu ${config.port}`));
}

if (require.main === module) startServer().catch((error) => { console.error("Server nije pokrenut:", error.message); process.exitCode = 1; });
module.exports = { createApp, startServer };
