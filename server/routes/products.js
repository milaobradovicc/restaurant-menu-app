const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Category = require("../models/Category");
const Product = require("../models/Product");

const proizvodiPath = path.join(__dirname, "../uploads/proizvodi");

if (!fs.existsSync(proizvodiPath)) {
  fs.mkdirSync(proizvodiPath, { recursive: true });
}


// 📁 Konfiguracija Multer-a
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, proizvodiPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

/// PUT /api/products/reorder
router.put("/reorder", async (req, res) => {
  try {
    const { proizvodi } = req.body;

    if (!Array.isArray(proizvodi) || proizvodi.length === 0) {
      return res.status(400).json({ error: "Nema podataka za ažuriranje" });
    }

    // Izvuci kategorijaId iz prvog proizvoda
    const kategorijaId = proizvodi[0].kategorijaId;

    // Proveri da svi pripadaju istoj kategoriji (opciono ali korisno)
    const razliciteKategorije = proizvodi.some(
      (p) => p.kategorijaId !== kategorijaId
    );
    if (razliciteKategorije) {
      return res.status(400).json({ error: "Svi proizvodi moraju biti iz iste kategorije" });
    }

    // Ažuriraj redne brojeve po redu
    for (let i = 0; i < proizvodi.length; i++) {
      await Product.findByIdAndUpdate(proizvodi[i]._id, { redniBroj: i });
    }

    res.json({ message: "Raspored uspešno sačuvan" });
  } catch (err) {
    console.error("Greška pri reorder-u:", err);
    res.status(500).json({ error: "Greška pri čuvanju rasporeda" });
  }
});

router.patch("/:id/toggle-novo", async (req, res) => {
  try {
    const proizvod = await Product.findById(req.params.id);
    if (!proizvod) return res.status(404).json({ message: "Not found" });

    proizvod.novo = !proizvod.novo;
    await proizvod.save();
    res.json(proizvod);
  } catch (err) {
    console.error("Greška pri toggle-novo:", err);
    res.status(500).json({ message: "Greška na serveru" });
  }
});



// POST /api/products  ✅ Dodavanje proizvoda
router.post("/", upload.single("slika"), async (req, res) => {
  try {
    const { naziv, opis, cena, kategorijaId } = req.body;

    if (!naziv || !cena || !kategorijaId) {
      return res.status(400).json({ message: "Naziv, cena i kategorija su obavezni" });
    }

    // 🔢 Automatski redniBroj po kategoriji
    const poslednji = await Product.findOne({ kategorijaId }).sort("-redniBroj");
    const sledeciBroj = poslednji ? poslednji.redniBroj + 1 : 1;

    const noviProizvod = new Product({
      naziv,
      opis,
      cena,
      kategorijaId: kategorijaId.trim(),
      redniBroj: sledeciBroj,
      slika: req.file ? `/uploads/proizvodi/${req.file.filename}` : "/images/logoRestoran1.png",

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

    const proizvodi = await Product.find({ kategorijaId: cleanId }).sort("redniBroj");
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

// PATCH /api/products/:id/toggle
router.patch("/:id/toggle", async (req, res) => {
  const proizvod = await Product.findById(req.params.id);
  if (!proizvod) return res.status(404).json({ message: "Not found" });
  proizvod.nedostupan = !proizvod.nedostupan;
  await proizvod.save();
  res.json(proizvod);
});

// PUT /api/products/:id – izmena proizvoda
router.put("/:id", upload.single("slika"), async (req, res) => {
  try {
    const update = {
      naziv: req.body.naziv,
      opis: req.body.opis,
      cena: req.body.cena,
    };

    if (req.body.kategorijaId) {
      update.kategorijaId = req.body.kategorijaId;
    }

    if (req.file) {
      update.slika = `/uploads/proizvodi/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    console.error("Greška pri izmeni:", err);
    res.status(500).json({ error: "Greška pri izmeni proizvoda" });
  }
});

// DELETE /api/products/:id – brisanje
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Proizvod obrisan" });
  } catch (err) {
    console.error("Greška pri brisanju:", err);
    res.status(500).json({ error: "Greška pri brisanju proizvoda" });
  }
});

module.exports = router;
