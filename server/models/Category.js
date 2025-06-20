const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  naziv: { type: String, required: true }, // naziv kategorije
  slika: String, // putanja slike (lokalna ili relativna)
  redniBroj: {
    type: Number,
    default: 0, // inicijalno će sve imati 0 ako ne dodeliš
  },
});

module.exports = mongoose.model("Category", CategorySchema);
