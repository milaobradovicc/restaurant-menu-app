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
  redniBroj: Number,
  nedostupan: Boolean,
  novo: { type: Boolean, default: false },

});

module.exports = mongoose.model("Product", ProductSchema);
