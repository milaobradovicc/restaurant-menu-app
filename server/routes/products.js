const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Category = require("../models/Category");
const Product = require("../models/Product");
const verifyToken = require("../middleware/authMiddleware");
const { createImageUpload } = require("../middleware/imageUpload");
const { removeUpload } = require("../utils/files");

const router = express.Router();
const uploadImage = createImageUpload("slika", path.join(__dirname, "../uploads/proizvodi"), "/uploads/proizvodi");
const validId = (value) => mongoose.isValidObjectId(value);

router.get("/kategorija/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Neispravan ID kategorije." });
  try {
    const [proizvodi, kategorija] = await Promise.all([
      Product.find({ kategorijaId: req.params.id }).sort("redniBroj").lean(),
      Category.findById(req.params.id).select("naziv").lean(),
    ]);
    if (!kategorija) return res.status(404).json({ message: "Kategorija nije pronadjena." });
    return res.json({ kategorija: kategorija.naziv, proizvodi });
  } catch (error) {
    return res.status(500).json({ message: "Greska pri ucitavanju proizvoda." });
  }
});

router.put("/reorder", verifyToken, async (req, res) => {
  const proizvodi = req.body.proizvodi;
  if (!Array.isArray(proizvodi) || !proizvodi.length || proizvodi.some((p) => !validId(p._id))) {
    return res.status(400).json({ message: "Neispravan raspored proizvoda." });
  }
  try {
    await Product.bulkWrite(proizvodi.map((p, index) => ({ updateOne: { filter: { _id: p._id }, update: { $set: { redniBroj: index } } } })));
    return res.json({ message: "Raspored je sacuvan." });
  } catch (error) { return res.status(500).json({ message: "Greska pri cuvanju rasporeda." }); }
});

router.patch("/:id/toggle-novo", verifyToken, async (req, res) => toggleField(req, res, "novo"));
router.patch("/:id/toggle", verifyToken, async (req, res) => toggleField(req, res, "nedostupan"));

async function toggleField(req, res, field) {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Neispravan ID proizvoda." });
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Proizvod nije pronadjen." });
    product[field] = !product[field];
    await product.save();
    return res.json(product);
  } catch (error) { return res.status(500).json({ message: "Greska pri izmeni proizvoda." }); }
}

router.post("/", verifyToken, ...uploadImage, async (req, res) => {
  const naziv = String(req.body.naziv || "").trim();
  const kategorijaId = String(req.body.kategorijaId || "").trim();
  const cena = Number(req.body.cena);
  if (!naziv || !validId(kategorijaId) || !Number.isFinite(cena) || cena < 0) return res.status(400).json({ message: "Naziv, validna cena i kategorija su obavezni." });
  try {
    const poslednji = await Product.findOne({ kategorijaId }).sort("-redniBroj").select("redniBroj").lean();
    const product = await Product.create({ naziv, opis: String(req.body.opis || "").trim(), cena, kategorijaId, redniBroj: (poslednji?.redniBroj ?? -1) + 1, slika: req.optimizedImage?.path || "" });
    return res.status(201).json(product);
  } catch (error) {
    await removeUpload(req.optimizedImage?.path);
    return res.status(500).json({ message: "Greska pri dodavanju proizvoda." });
  }
});

router.put("/:id", verifyToken, ...uploadImage, async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Neispravan ID proizvoda." });
  const cena = Number(req.body.cena);
  if (!String(req.body.naziv || "").trim() || !Number.isFinite(cena) || cena < 0) return res.status(400).json({ message: "Naziv i validna cena su obavezni." });
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) { await removeUpload(req.optimizedImage?.path); return res.status(404).json({ message: "Proizvod nije pronadjen." }); }
    const oldImage = existing.slika;
    existing.naziv = req.body.naziv.trim(); existing.opis = String(req.body.opis || "").trim(); existing.cena = cena;
    if (validId(req.body.kategorijaId)) existing.kategorijaId = req.body.kategorijaId;
    if (req.optimizedImage) existing.slika = req.optimizedImage.path;
    await existing.save();
    if (req.optimizedImage) await removeUpload(oldImage);
    return res.json(existing);
  } catch (error) { await removeUpload(req.optimizedImage?.path); return res.status(500).json({ message: "Greska pri izmeni proizvoda." }); }
});

router.delete("/:id", verifyToken, async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Neispravan ID proizvoda." });
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Proizvod nije pronadjen." });
    await removeUpload(product.slika);
    return res.json({ message: "Proizvod je obrisan." });
  } catch (error) { return res.status(500).json({ message: "Greska pri brisanju proizvoda." }); }
});

module.exports = router;
