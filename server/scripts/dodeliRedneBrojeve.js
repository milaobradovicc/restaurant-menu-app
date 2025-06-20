require("dotenv").config(); // mora ići na sam vrh

const mongoose = require("mongoose");
const Category = require("../models/Category"); // prilagodi putanju

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
  const kategorije = await Category.find();
  for (let i = 0; i < kategorije.length; i++) {
    kategorije[i].redniBroj = i;
    await kategorije[i].save();
  }
  console.log("✅ Redni brojevi uspešno dodeljeni!");
  mongoose.connection.close();
});
