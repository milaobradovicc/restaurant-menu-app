const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const sharp = require("sharp");
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function createImageUpload(fieldName, directory, publicDirectory, options = {}) {
  const upload = multer({
    storage: multer.memoryStorage(), limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
    fileFilter: (_req, file, callback) => ALLOWED_IMAGE_TYPES.has(file.mimetype)
      ? callback(null, true) : callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", fieldName)),
  }).single(fieldName);
  return [upload, async (req, _res, next) => {
    if (!req.file) return next();
    try {
      await fs.mkdir(directory, { recursive: true });
      const name = options.fixedName || `${Date.now()}-${crypto.randomUUID()}`;
      const filename = `${name}.webp`;
      await sharp(req.file.buffer).rotate().resize({ width: options.width || 1600, height: options.height || 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: options.quality || 82 }).toFile(path.join(directory, filename));
      req.optimizedImage = { filename, path: `${publicDirectory}/${filename}` };
      next();
    } catch (error) { next(error); }
  }];
}

module.exports = { createImageUpload, MAX_IMAGE_BYTES };
