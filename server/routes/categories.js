const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Category = require("../models/Category");
const Product = require("../models/Product");
const verifyToken = require("../middleware/authMiddleware");
const { createImageUpload } = require("../middleware/imageUpload");
const { removeUpload } = require("../utils/files");

const router = express.Router();
const uploadImage = createImageUpload("slika", path.join(__dirname, "../uploads/kategorije"), "/uploads/kategorije");
const validId = (value) => mongoose.isValidObjectId(value);

router.get("/", async (_req, res) => {
  try { return res.json(await Category.find().sort("redniBroj").lean()); }
  catch (error) { return res.status(500).json({ message: "Greska pri ucitavanju kategorija." }); }
});

router.put("/reorder", verifyToken, async (req, res) => {
  const kategorije = req.body.kategorije;
  if (!Array.isArray(kategorije) || !kategorije.length || kategorije.some((item) => !validId(item._id))) return res.status(400).json({ message: "Neispravan raspored kategorija." });
  try {
    await Category.bulkWrite(kategorije.map((item, index) => ({ updateOne: { filter: { _id: item._id }, update: { $set: { redniBroj: Number.isFinite(Number(item.redniBroj)) ? Number(item.redniBroj) : index } } } })));
    return res.json({ message: "Raspored je sacuvan." });
  } catch (error) { return res.status(500).json({ message: "Greska pri cuvanju rasporeda." }); }
});

router.post("/", verifyToken, ...uploadImage, async (req, res) => {
  const naziv = String(req.body.naziv || "").trim();
  if (!naziv) { await removeUpload(req.optimizedImage?.path); return res.status(400).json({ message: "Naziv je obavezan." }); }
  try {
    const last = await Category.findOne().sort("-redniBroj").select("redniBroj").lean();
    return res.status(201).json(await Category.create({ naziv, slika: req.optimizedImage?.path || "", redniBroj: (last?.redniBroj ?? -1) + 1 }));
  } catch (error) { await removeUpload(req.optimizedImage?.path); return res.status(500).json({ message: "Greska pri dodavanju kategorije." }); }
});

router.put("/:id", verifyToken, ...uploadImage, async (req, res) => {
  const naziv = String(req.body.naziv || "").trim();
  if (!validId(req.params.id) || !naziv) { await removeUpload(req.optimizedImage?.path); return res.status(400).json({ message: "Neispravni podaci kategorije." }); }
  try {
    const category = await Category.findById(req.params.id);
    if (!category) { await removeUpload(req.optimizedImage?.path); return res.status(404).json({ message: "Kategorija nije pronadjena." }); }
    const oldImage = category.slika;
    category.naziv = naziv;
    if (req.optimizedImage) category.slika = req.optimizedImage.path;
    await category.save();
    if (req.optimizedImage) await removeUpload(oldImage);
    return res.json(category);
  } catch (error) { await removeUpload(req.optimizedImage?.path); return res.status(500).json({ message: "Greska pri izmeni kategorije." }); }
});

router.delete("/:id", verifyToken, async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Neispravan ID kategorije." });
  try {
    const [category, products] = await Promise.all([Category.findById(req.params.id), Product.find({ kategorijaId: req.params.id }).select("slika")]);
    if (!category) return res.status(404).json({ message: "Kategorija nije pronadjena." });
    await Promise.all([Category.deleteOne({ _id: category._id }), Product.deleteMany({ kategorijaId: category._id })]);
    await Promise.allSettled([removeUpload(category.slika), ...products.map((product) => removeUpload(product.slika))]);
    return res.json({ message: "Kategorija i njeni proizvodi su obrisani." });
  } catch (error) { return res.status(500).json({ message: "Greska pri brisanju kategorije." }); }
});

module.exports = router;
