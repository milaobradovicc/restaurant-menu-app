require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../models/Product");

const MONGO_URL = process.env.MONGO_URI;

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
  try {
    const proizvodi = await Product.find();

    for (let proizvod of proizvodi) {
      // Ako polje već postoji, preskoči
      if (proizvod.nedostupan === undefined) {
        proizvod.nedostupan = false;
        await proizvod.save();
        console.log(`✅ Ažurirano: ${proizvod.naziv}`);
      }
    }

    console.log("🎉 Svi proizvodi su ažurirani sa poljem 'nedostupno: false'");
  } catch (err) {
    console.error("❌ Greška pri ažuriranju:", err);
  } finally {
    mongoose.connection.close();
  }
});
