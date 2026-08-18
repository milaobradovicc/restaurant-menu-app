const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  naziv: { type: String, required: true },
  opis: String,
  cena: { type: Number, required: true },
  slika: String,
  kategorijaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  redniBroj: { type: Number, default: 0, index: true },
  nedostupan: { type: Boolean, default: false },
  novo: { type: Boolean, default: false },

});

ProductSchema.index({ kategorijaId: 1, redniBroj: 1 });

module.exports = mongoose.model("Product", ProductSchema);
