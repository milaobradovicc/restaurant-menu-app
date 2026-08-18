const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const verifyToken = require("../middleware/authMiddleware");
const { createImageUpload } = require("../middleware/imageUpload");

const router = express.Router();
const logoDirectory = path.join(__dirname, "../uploads/logo");
const uploadLogo = createImageUpload("logo", logoDirectory, "/uploads/logo", { fixedName: "logo", width: 800, height: 800, quality: 88 });

router.get("/", async (_req, res) => {
  try {
    const files = await fs.readdir(logoDirectory);
    const logo = files.find((file) => file.startsWith("logo."));
    return res.json({ logo: logo ? `/uploads/logo/${logo}` : null });
  } catch (error) {
    if (error.code === "ENOENT") return res.json({ logo: null });
    return res.status(500).json({ message: "Greska pri ucitavanju logotipa." });
  }
});

router.put("/", verifyToken, ...uploadLogo, async (req, res) => {
  if (!req.optimizedImage) return res.status(400).json({ message: "Logo nije poslat." });
  try {
    const files = await fs.readdir(logoDirectory);
    await Promise.allSettled(files.filter((file) => file.startsWith("logo.") && file !== req.optimizedImage.filename).map((file) => fs.unlink(path.join(logoDirectory, file))));
    return res.json({ logo: req.optimizedImage.path });
  } catch (error) { return res.status(500).json({ message: "Greska pri cuvanju logotipa." }); }
});

module.exports = router;
