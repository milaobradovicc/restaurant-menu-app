const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Category = require("../models/Category");

// 🔧 Setup za multer (za upload slika)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, "slika-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// PUT /api/categories/reorder
router.put("/reorder", async (req, res) => {
  const noviRaspored = req.body.kategorije; // [{ _id, redniBroj }, ...]

  try {
    for (let i = 0; i < noviRaspored.length; i++) {
      const { _id, redniBroj } = noviRaspored[i];
      await Category.findByIdAndUpdate(_id, { redniBroj });
    }
    res.json({ message: "Raspored sačuvan" });
  } catch (err) {
    console.error("❌ Greška u reorder:", err);
    res.status(500).json({ error: "Greška pri čuvanju rasporeda" });
  }
});

// 📥 POST /api/categories – Dodavanje kategorije
router.post("/", upload.single("slika"), async (req, res) => {
  try {
    console.log("📦 Body:", req.body); // da vidimo naziv
    console.log("🖼️ File:", req.file); // da vidimo sliku
    const { naziv } = req.body;
    const slika = req.file ? `/uploads/${req.file.filename}` : "";

    if (!naziv) return res.status(400).json({ message: "Naziv je obavezan" });

    const novaKategorija = new Category({ naziv, slika });
    await novaKategorija.save();
    res.status(201).json(novaKategorija);
  } catch (err) {
    console.error("❌ Greška pri dodavanju kategorije:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📤 GET /api/categories – Dohvati sve
router.get("/", async (req, res) => {
  try {
    const kategorije = await Category.find();
    res.json(kategorije);
  } catch (err) {
    res.status(500).json({ message: "Greška pri učitavanju" });
  }
});

//DELETE /api/categories - Izbrisi kategoriju
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ poruka: "Kategorija obrisana" });
  } catch (err) {
    res.status(500).json({ poruka: "Greška pri brisanju" });
  }
});

router.put("/:id", upload.single("slika"), async (req, res) => {
  try {
    const { naziv } = req.body;
    const update = { naziv };

    if (req.file) {
      update.slika = `/uploads/${req.file.filename}`;
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    console.error("Greška pri izmeni:", err);
    res.status(500).json({ poruka: "Greška pri izmeni" });
  }
});

module.exports = router;
