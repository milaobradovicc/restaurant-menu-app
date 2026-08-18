require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("✅ Povezano sa MongoDB");

        const kategorije = await Category.find();

        for (let kat of kategorije) {
            if (kat.slika && !kat.slika.startsWith("/uploads/kategorije/")) {
                const imeFajla = kat.slika.split("/").pop(); // npr. pice.jpg
                kat.slika = `/uploads/kategorije/${imeFajla}`;
                await kat.save();
                console.log(`🔁 Ažurirano: ${kat.naziv}`);
            }
        }

        console.log("✅ Sve slike ažurirane!");
        process.exit();
    })
    .catch((err) => {
        console.error("❌ Greška:", err);
        process.exit(1);
    });
