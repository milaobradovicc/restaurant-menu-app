const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const Category = require("../models/Category");
const Product = require("../models/Product");

// 📁 Konfiguracija Multer-a
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Uveri se da folder postoji
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// POST /api/products  ✅ Dodavanje proizvoda
router.post("/", upload.single("slika"), async (req, res) => {
  try {
    const kategorijaId = req.body.kategorijaId?.trim();
    const noviProizvod = new Product({
      naziv: req.body.naziv,
      opis: req.body.opis,
      cena: req.body.cena,
      kategorijaId: kategorijaId,
      slika: req.file ? `/uploads/${req.file.filename}` : null,
    });

    const sacuvan = await noviProizvod.save();
    res.status(201).json(sacuvan);
  } catch (err) {
    console.error("❌ Greška pri čuvanju proizvoda:", err);
    res.status(500).json({ error: "Greška pri dodavanju proizvoda" });
  }
});

// GET proizvodi za određenu kategoriju
router.get("/kategorija/:id", async (req, res) => {
  try {
    const cleanId = req.params.id.trim(); // očisti višak
    console.log("Primljen ID kategorije:", req.params.id);

    const proizvodi = await Product.find({ kategorijaId: cleanId });
    const kategorija = await Category.findById(cleanId);

    console.log("Nađeni proizvodi:", proizvodi);
    console.log("Kategorija:", kategorija);

    res.json({
      kategorija: kategorija?.naziv || "Kategorija",
      proizvodi,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri dohvatanju proizvoda" });
  }
});

module.exports = router;
