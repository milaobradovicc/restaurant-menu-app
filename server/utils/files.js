const fs = require("fs/promises");
const path = require("path");
const uploadsRoot = path.resolve(__dirname, "../uploads");

async function removeUpload(uploadPath) {
  if (!uploadPath || !uploadPath.startsWith("/uploads/")) return;
  const absolutePath = path.resolve(__dirname, "..", uploadPath.replace(/^\//, ""));
  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) return;
  try { await fs.unlink(absolutePath); } catch (error) { if (error.code !== "ENOENT") throw error; }
}

module.exports = { removeUpload };
