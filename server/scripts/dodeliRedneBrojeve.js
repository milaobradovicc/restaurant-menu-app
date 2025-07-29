require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../models/Product"); // <- OVA LINIJA je obavezna

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
  try {
    const proizvodi = await Product.find().sort({ kategorija: 1, _id: 1 });

    for (let i = 0; i < proizvodi.length; i++) {
      proizvodi[i].redniBroj = i;
      await proizvodi[i].save();
    }

    console.log("✅ Redni brojevi uspešno dodeljeni!");
  } catch (err) {
    console.error("❌ Greška:", err);
  } finally {
    mongoose.connection.close();
  }
});
